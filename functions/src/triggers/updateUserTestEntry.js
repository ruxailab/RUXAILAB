import UserRepository from '../repositories/UserRepository.js'
import logger from '../utils/logger.js'

/**
 * Shared handler for updating user test entries
 * Used by both onCreate and onUpdate triggers to avoid duplication
 *
 * @param {Object} testData - Test data from Firebase
 * @param {string} testDocId - Test document ID
 * @throws {Error} If user update fails
 */
export const updateUserTestEntry = async (testData, testDocId) => {
  if (!testData || !testDocId) {
    logger.warn('updateUserTestEntry called with missing test data or ID')
    return
  }

  try {
    const userRepository = new UserRepository()
    const userId = testData.testAdmin?.userDocId

    if (!userId) {
      logger.warn(`Test ${testDocId} has no associated user ID`)
      return
    }

    const user = await userRepository.get(userId)

    if (!user) {
      logger.warn(`User ${userId} not found for test ${testDocId}`)
      return
    }

    // Initialize myTests if it doesn't exist
    if (!user.myTests) {
      user.myTests = {}
    }

    // Update or create test entry
    user.myTests[testDocId] = {
      testDocId,
      testTitle: testData.testTitle || testData.title || 'Untitled Test',
      testType: testData.testType || 'UNKNOWN',
      subType: testData.subType || null,
      numberColaborators: testData.cooperators?.length || 0,
      creationDate: testData.creationDate || testData.createdAt || Date.now(),
      updateDate: Date.now(),
    }

    await userRepository.update(userId, user)

    logger.info(`Successfully updated test entry for user ${userId}: ${testDocId}`)
  } catch (error) {
    logger.error(`Error updating user test entry for ${testDocId}:`, { error })
    throw error
  }
}
