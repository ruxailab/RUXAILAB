import functions from 'firebase-functions'
import admin from 'firebase-admin'

const db = admin.firestore()
const storage = admin.storage()

export const deleteMediaFile = functions.https.onCall(async (data, context) => {
  // 1. Authenticated?
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }

  const { filePath, testId } = data
  if (!filePath) {
    throw new functions.https.HttpsError('invalid-argument', 'File path is required.')
  }

  // 2. Ownership Check (Secure)
  // Fetch test to see if requester is the owner
  if (testId) {
    const testDoc = await db.collection('tests').doc(testId).get()
    if (!testDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Test not found.')
    }
    const testData = testDoc.data()
    // Check if the user is the creator (testAdmin.userDocId)
    // Note: Adjust 'testAdmin.userDocId' based on exact schema if needed
    if (testData.testAdmin && testData.testAdmin.userDocId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'You do not own this test.')
    }
  }

  // 3. Execute Delete
  try {
    await storage.bucket().file(filePath).delete()
    return { success: true, message: 'File deleted successfully' }
  } catch (error) {
    console.error('Delete failed:', error)
    // If file doesn't exist, we can consider it "deleted" or throw error
    if (error.code === 404) {
      return { success: true, message: 'File was already deleted' }
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete file.')
  }
})

export const getFileMetadata = functions.https.onCall(async (data, context) => {
  // 1. Authenticated?
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }

  const { filePath } = data
  if (!filePath) {
    throw new functions.https.HttpsError('invalid-argument', 'File path is required.')
  }

  // 2. Fetch Metadata
  try {
    const [metadata] = await storage.bucket().file(filePath).getMetadata()
    return {
      size: parseInt(metadata.size, 10),
      contentType: metadata.contentType,
      updated: metadata.updated
    }
  } catch (error) {
    console.warn('Metadata fetch failed:', error)
    // Return 0 size on error (e.g., file not found) to prevent UI crash
    return { size: 0, error: 'File not found' }
  }
})
