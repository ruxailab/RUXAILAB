import { admin, functions } from '../core/firebase/f.firebase.js'
import { writeAuditEvent } from '../utils/auditTrail.js'

const ROLE = { ADMIN: 0, MANAGER: 4 }
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

const error = (code, message) =>
  new functions.https.HttpsError(code, message)

const actorRole = (study, uid, superAdmin) => {
  if (superAdmin || study?.testAdmin?.userDocId === uid) return ROLE.ADMIN
  return (
    study?.cooperators?.find(
      (cooperator) =>
        cooperator?.userDocId === uid && cooperator?.accepted === true,
    )?.accessLevel ?? null
  )
}

export const authorizeStudyUpdate = ({
  current,
  requestedUpdates,
  uid,
  isSuperAdmin = false,
}) => {
  const role = actorRole(current, uid, isSuperAdmin)
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
      const actorEmail =
        userSnap.data()?.email || request?.auth?.token?.email || ''
      const { changedFields, updates, settingsChanged } = authorizeStudyUpdate({
        current,
        requestedUpdates,
        uid,
        isSuperAdmin: userSnap.data()?.accessLevel === 0,
      })
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
          requestedUpdates,
          changedFields,
        }),
      })

      return { status: 'updated', changedFields }
    })
  },
})
