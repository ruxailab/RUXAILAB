import { admin, functions } from '../core/firebase/f.firebase.js'
import { resolveStudyRole, ROLE } from '../shared/auth/studyAccess.js'

const error = (code, message) =>
  new functions.https.HttpsError(code, message)

export const assertSummaryExportAllowed = (study, uid, isSuperAdmin) => {
  if (study?.testType !== 'USER') {
    throw error(
      'failed-precondition',
      'Summary export is available only for user studies',
    )
  }
  const role = resolveStudyRole(study, uid, isSuperAdmin)
  if (![ROLE.ADMIN, ROLE.MANAGER].includes(role)) {
    throw error('permission-denied', 'Summary export is not permitted')
  }
}

export const generateStudySummary = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const studyId = request?.data?.studyId
    if (!studyId) throw error('invalid-argument', 'studyId is required')

    const db = admin.firestore()
    const [studySnap, userSnap] = await Promise.all([
      db.collection('tests').doc(studyId).get(),
      db.collection('users').doc(uid).get(),
    ])
    if (!studySnap.exists) throw error('not-found', 'Study not found')

    const study = studySnap.data()
    assertSummaryExportAllowed(study, uid, userSnap.data()?.accessLevel === 0)

    const answerSnap = await db.collection('answers').doc(study.answersDocId).get()
    const pdfServiceUrl =
      process.env.LARAVEL_PDF_URL || process.env.VUE_APP_LARAVEL_PDF
    if (!pdfServiceUrl) {
      throw error('failed-precondition', 'PDF service is not configured')
    }

    const response = await fetch(`${pdfServiceUrl}/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          title: study.testTitle || '',
          description: study.testDescription || '',
          type: study.testType || '',
          taskAnswers: answerSnap.data()?.taskAnswers || {},
        },
      }),
    })
    if (!response.ok) throw error('internal', 'PDF service request failed')

    const pdf = Buffer.from(await response.arrayBuffer()).toString('base64')
    return { pdf }
  },
})
