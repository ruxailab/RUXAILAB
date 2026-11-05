import { admin, functions } from '../core/firebase/f.firebase.js'
import logger from "../utils/logger.js";

export const deleteAuth = functions.onCall({
  handler: async (request) => {
    const callerUid = request?.auth?.uid
    if (!callerUid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication is required',
      )
    }

    const targetUserId = request?.data?.userId
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'userId is required',
      )
    }

    try {
      const db = admin.firestore()

      if (callerUid !== targetUserId) {
        const callerDoc = await db.collection('users').doc(callerUid).get()
        const isSuperAdmin =
          callerDoc.exists && callerDoc.data()?.accessLevel === 0
        if (!isSuperAdmin) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'Permission denied',
          )
        }
      }

      const testsRef = db.collection('tests')
      const testsQuery = await testsRef
        .where("testAdmin.userDocId", "==", targetUserId)
        .get()

      if (!testsQuery.empty) {
        for (const testDoc of testsQuery.docs) {
          const testData = testDoc.data()

          const answersDocId = testData.answersDocId
          if (answersDocId) await db.collection("answers").doc(answersDocId).delete()

          await deleteFolderFiles(testDoc.id)
          await db.collection("tests").doc(testDoc.id).delete()
        }
      }

      const userDocRef = db.collection('users').doc(targetUserId)
      await userDocRef.delete()

      try {
        await admin.auth().deleteUser(targetUserId)
      } catch (authErr) {
        if (authErr?.code !== 'auth/user-not-found') {
          throw authErr
        }
      }

      return 'User deleted successfully.'
    } catch (err) {
      logger.error('Error deleting user:', { error: err });
      if (err instanceof functions.https.HttpsError) {
        throw err
      }
      throw new functions.https.HttpsError('internal', err?.message || 'Error deleting user')
    }
  }
})

const deleteFolderFiles = async (testId) => {
  const folderPath = `tests/${testId}/`;
  const [files] = await admin.storage().bucket().getFiles({ prefix: folderPath });

  if (files.length > 0) {
    logger.info(`Deletando ${files.length} arquivos da pasta ${folderPath}`);
    await Promise.all(files.map(file => file.delete()));
  }
}
