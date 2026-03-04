import { functions } from '../f.firebase.js'
import UserRepository from '../repositories/UserRepository.js'
import logger from '../utils/logger.js'

export const onTestCreate = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'created',
  handler: async (event) => {
    const snapshot = event.data
    if (!snapshot) return logger.info('No data associated with the event')

    const test = snapshot.data()

    if (!test.testAdmin?.userDocId) {
      logger.warn('onTestCreate: missing testAdmin.userDocId', {
        testId: snapshot.id,
      })
      return
    }

    try {
      const userRepository = new UserRepository()
      const user = await userRepository.get(test.testAdmin.userDocId)

      user.myTests[snapshot.id] = {
        testDocId: snapshot.id,
        testTitle: test.testTitle || test.title || 'Untitled Test',
        testType: test.testType || 'UNKNOWN',
        subType: test.subType || null,
        numberColaborators: test.cooperators?.length || 0,
        creationDate: test.creationDate || test.createdAt || Date.now(),
        updateDate: Date.now(),
      }

      await userRepository.update(test.testAdmin.userDocId, user)
      logger.info('onTestCreate: updated user myTests', {
        testId: snapshot.id,
        userId: test.testAdmin.userDocId,
      })
    } catch (error) {
      logger.error('onTestCreate: failed to update user myTests', {
        testId: snapshot.id,
        userId: test.testAdmin.userDocId,
        error: error.message,
      })
    }
  },
})
