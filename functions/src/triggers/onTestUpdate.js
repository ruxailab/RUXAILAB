import { functions } from '../f.firebase.js'
import UserRepository from '../repositories/UserRepository.js'
import logger from '../utils/logger.js'

export const onTestUpdate = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'updated',
  handler: async (event) => {
    const snapshot = event.data.after
    if (!snapshot) return logger.info('No data associated with the event')

    const newTest = snapshot.data()

    if (!newTest.testAdmin?.userDocId) {
      logger.warn('onTestUpdate: missing testAdmin.userDocId', {
        testId: snapshot.id,
      })
      return
    }

    try {
      const userRepository = new UserRepository()
      const user = await userRepository.get(newTest.testAdmin.userDocId)

      user.myTests[snapshot.id] = {
        testDocId: snapshot.id,
        testTitle: newTest.testTitle || newTest.title || 'Untitled Test',
        testType: newTest.testType || 'UNKNOWN',
        subType: newTest.subType || null,
        numberColaborators: newTest.cooperators?.length || 0,
        creationDate: newTest.creationDate || newTest.createdAt || Date.now(),
        updateDate: Date.now(),
      }

      await userRepository.update(newTest.testAdmin.userDocId, user)
      logger.info('onTestUpdate: updated user myTests', {
        testId: snapshot.id,
        userId: newTest.testAdmin.userDocId,
      })
    } catch (error) {
      logger.error('onTestUpdate: failed to update user myTests', {
        testId: snapshot.id,
        userId: newTest.testAdmin.userDocId,
        error: error.message,
      })
    }
  },
})
