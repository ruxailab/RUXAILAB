import { admin, functions } from '../core/firebase/f.firebase.js'
import { ROLE, resolveStudyRole } from '../shared/auth/studyAccess.js'
import { buildAuditEvent } from '../utils/auditTrail.js'

const error = (code, message) => new functions.https.HttpsError(code, message)

const REPORTABLE_STUDY_TYPES = new Set(['USER', 'HEURISTIC'])

export const assertReportDownloadAllowed = ({ study, uid, isSuperAdmin }) => {
  if (!study) throw error('not-found', 'Study not found')
  if (!REPORTABLE_STUDY_TYPES.has(study.testType)) {
    throw error('failed-precondition', 'Report download is not supported')
  }

  const role = resolveStudyRole(study, uid, isSuperAdmin)
  if (role !== ROLE.ADMIN && role !== ROLE.MANAGER) {
    throw error('permission-denied', 'Report download is not permitted')
  }
}

export const recordReportDownload = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const studyId = request?.data?.studyId
    if (!studyId) throw error('invalid-argument', 'studyId is required')

    const db = admin.firestore()
    const studyRef = db.collection('tests').doc(studyId)
    const userRef = db.collection('users').doc(uid)
    const [studySnap, userSnap] = await Promise.all([
      studyRef.get(),
      userRef.get(),
    ])
    const study = studySnap.data()
    const isSuperAdmin = userSnap.data()?.accessLevel === ROLE.ADMIN

    assertReportDownloadAllowed({ study, uid, isSuperAdmin })

    await studyRef.collection('auditTrail').add(
      buildAuditEvent({
        action: 'report.downloadRequested',
        actorId: uid,
        actorEmail: userSnap.data()?.email || request?.auth?.token?.email || '',
        target: studyId,
        targetLabel: study.testTitle || studyId,
        targetType: 'report',
        details: { studyType: study.testType },
      }),
    )

    return { status: 'recorded' }
  },
})
