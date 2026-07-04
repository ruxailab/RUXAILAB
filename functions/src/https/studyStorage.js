import { admin, functions } from '../f.firebase.js'

const error = (code, message) =>
  new functions.https.HttpsError(code, message)

export const assertStorageDeletionAllowed = ({
  study,
  uid,
  isSuperAdmin = false,
}) => {
  const membership = study.cooperators?.find(
    (cooperator) =>
      cooperator?.userDocId === uid && cooperator?.accepted === true,
  )
  const allowed =
    isSuperAdmin ||
    study.testAdmin?.userDocId === uid ||
    membership?.accessLevel === 0
  if (!allowed) throw error('permission-denied', 'Storage access is denied')
}

export const deleteStudyStorageFile = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const { studyId, path } = request?.data || {}
    if (!studyId || !path || !path.startsWith(`tests/${studyId}/`)) {
      throw error('invalid-argument', 'A valid study storage path is required')
    }

    const db = admin.firestore()
    const [studySnap, userSnap] = await Promise.all([
      db.collection('tests').doc(studyId).get(),
      db.collection('users').doc(uid).get(),
    ])
    if (!studySnap.exists) throw error('not-found', 'Study not found')

    const study = studySnap.data()
    assertStorageDeletionAllowed({
      study,
      uid,
      isSuperAdmin: userSnap.data()?.accessLevel === 0,
    })

    await admin.storage().bucket().file(path).delete({ ignoreNotFound: true })
    await db
      .collection('tests')
      .doc(studyId)
      .collection('auditTrail')
      .add({
        action: 'storage.fileDeleted',
        actorId: uid,
        target: path,
        details: {},
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      })

    return { status: 'deleted' }
  },
})
