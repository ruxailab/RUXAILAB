import { admin, functions } from '../core/firebase/f.firebase.js'
import { writeAuditEvent } from '../utils/auditTrail.js'
import { resolveStudyRole, ROLE } from '../shared/auth/studyAccess.js'

const PROTECTED_FIELDS = new Set([
  'answersDocId',
  'cooperators',
  'creationDate',
  'studyRoleMap',
  'testAdmin',
  'testType',
])
const MANAGER_DENIED_FIELDS = new Set([
  'endDate',
  'isPublic',
  'status',
  'templateDoc',
  'testStatus',
])
const MAX_AUDIT_TEXT_LENGTH = 160
const MAX_PATCH_ENTRIES = 500
const MAX_PATCH_DEPTH = 20

const error = (code, message) =>
  new functions.https.HttpsError(code, message)

export const applyStudyPatch = (current, patch) => {
  if (!Array.isArray(patch) || patch.length > MAX_PATCH_ENTRIES) {
    throw error('invalid-argument', 'studyPatch must be a valid patch list')
  }

  const result = { ...current }
  const deletedRoots = new Set()
  const rootPaths = new Set()

  for (const change of patch) {
    if (
      !Array.isArray(change?.path) ||
      change.path.length === 0 ||
      change.path.length > MAX_PATCH_DEPTH ||
      change.path.some(
        (segment) =>
          typeof segment !== 'string' ||
          !segment ||
          ['__proto__', 'prototype', 'constructor'].includes(segment),
      ) ||
      (change.delete !== true && !Object.hasOwn(change, 'value'))
    ) {
      throw error('invalid-argument', 'studyPatch contains an invalid change')
    }

    const [root, ...nestedPath] = change.path
    rootPaths.add(root)

    if (nestedPath.length === 0) {
      if (change.delete) {
        delete result[root]
        deletedRoots.add(root)
      } else {
        result[root] = change.value
        deletedRoots.delete(root)
      }
      continue
    }

    let target = result[root]
    if (Array.isArray(target)) {
      throw error('invalid-argument', 'studyPatch cannot traverse array values')
    }
    if (!target || typeof target !== 'object' || Array.isArray(target)) {
      target = {}
    } else {
      target = { ...target }
    }
    result[root] = target

    for (let index = 0; index < nestedPath.length - 1; index += 1) {
      const segment = nestedPath[index]
      const child = target[segment]
      if (Array.isArray(child)) {
        throw error(
          'invalid-argument',
          'studyPatch cannot traverse array values',
        )
      }
      target[segment] =
        child && typeof child === 'object' && !Array.isArray(child)
          ? { ...child }
          : {}
      target = target[segment]
    }

    const leaf = nestedPath[nestedPath.length - 1]
    if (change.delete) delete target[leaf]
    else target[leaf] = change.value
  }

  return { result, rootPaths, deletedRoots }
}

export const authorizeStudyUpdate = ({
  current,
  requestedUpdates,
  uid,
  isSuperAdmin = false,
}) => {
  const role = resolveStudyRole(current, uid, isSuperAdmin)
  if (![ROLE.ADMIN, ROLE.MANAGER].includes(role)) {
    throw error('permission-denied', 'Study editing is not permitted')
  }

  const changedFields = Object.keys(requestedUpdates).filter(
    (key) =>
      !PROTECTED_FIELDS.has(key) &&
      JSON.stringify(requestedUpdates[key]) !== JSON.stringify(current[key]),
  )
  if (
    role === ROLE.MANAGER &&
    changedFields.some((field) => MANAGER_DENIED_FIELDS.has(field))
  ) {
    throw error('permission-denied', 'Managers cannot change Settings')
  }

  return {
    changedFields,
    updates: Object.fromEntries(
      Object.entries(requestedUpdates).filter(
        ([key]) => !PROTECTED_FIELDS.has(key),
      ),
    ),
    settingsChanged: changedFields.some((field) =>
      MANAGER_DENIED_FIELDS.has(field),
    ),
  }
}

const truncateAuditText = (value) =>
  value.length > MAX_AUDIT_TEXT_LENGTH
    ? `${value.slice(0, MAX_AUDIT_TEXT_LENGTH)}…`
    : value

const auditValue = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value === 'string') return truncateAuditText(value)
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  return null
}

export const buildStudyAuditDetails = ({
  current,
  requestedUpdates,
  changedFields,
}) => ({
  changedFields,
  changes: Object.fromEntries(
    changedFields.map((field) => {
      const before = auditValue(current[field])
      const after = auditValue(requestedUpdates[field])
      return [
        field,
        before !== null || after !== null
          ? { before, after }
          : { changed: true },
      ]
    }),
  ),
})

export const updateStudyWithAudit = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const studyId = request?.data?.studyId
    const requestedUpdates = request?.data?.study
    const studyPatch = request?.data?.studyPatch
    if (!studyId || !requestedUpdates || typeof requestedUpdates !== 'object') {
      throw error('invalid-argument', 'studyId and study are required')
    }

    const db = admin.firestore()
    const studyRef = db.collection('tests').doc(studyId)
    const userRef = db.collection('users').doc(uid)

    return db.runTransaction(async (transaction) => {
      const [studySnap, userSnap] = await Promise.all([
        transaction.get(studyRef),
        transaction.get(userRef),
      ])
      if (!studySnap.exists) throw error('not-found', 'Study not found')

      const current = studySnap.data()
      const {
        result: patchedStudy,
        rootPaths,
        deletedRoots,
      } = studyPatch === undefined
        ? { result: current, rootPaths: new Set(), deletedRoots: new Set() }
        : applyStudyPatch(current, studyPatch)
      const effectiveUpdates = { ...requestedUpdates }
      for (const root of rootPaths) {
        if (Object.hasOwn(requestedUpdates, root)) continue
        if (Object.hasOwn(patchedStudy, root)) {
          effectiveUpdates[root] = patchedStudy[root]
        } else {
          effectiveUpdates[root] = undefined
        }
      }
      const actorEmail =
        userSnap.data()?.email || request?.auth?.token?.email || ''
      const { changedFields, updates, settingsChanged } = authorizeStudyUpdate({
        current,
        requestedUpdates: effectiveUpdates,
        uid,
        isSuperAdmin: userSnap.data()?.accessLevel === 0,
      })
      for (const root of deletedRoots) {
        if (Object.hasOwn(updates, root)) {
          updates[root] = admin.firestore.FieldValue.delete()
        }
      }
      if (changedFields.length === 0) {
        return { status: 'unchanged', changedFields }
      }
      transaction.update(studyRef, updates)
      writeAuditEvent(transaction, studyRef, {
        action: settingsChanged ? 'study.settingsChanged' : 'study.edited',
        actorId: uid,
        target: studyId,
        actorEmail,
        targetLabel: current.testTitle || requestedUpdates.testTitle || studyId,
        targetType: 'study',
        details: buildStudyAuditDetails({
          current,
          requestedUpdates: effectiveUpdates,
          changedFields,
        }),
      })

      return { status: 'updated', changedFields }
    })
  },
})
