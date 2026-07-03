import { admin, functions } from '../f.firebase.js'

const error = (code, message) =>
  new functions.https.HttpsError(code, message)

const canExportSummary = (study, uid, isSuperAdmin) => {
  if (isSuperAdmin || study?.testAdmin?.userDocId === uid) return true
  const membership = study?.cooperators?.find(
    (cooperator) =>
      cooperator?.userDocId === uid && cooperator?.accepted === true,
  )
  return membership?.accessLevel === 0 || membership?.accessLevel === 4
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
    if (!canExportSummary(study, uid, userSnap.data()?.accessLevel === 0)) {
      throw error('permission-denied', 'Summary export is not permitted')
    }

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
