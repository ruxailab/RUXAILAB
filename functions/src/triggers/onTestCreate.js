import { functions } from '../f.firebase.js'
import { updateUserTestEntry } from './updateUserTestEntry.js'
import logger from '../utils/logger.js'

export const onTestCreate = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'created',
  handler: async (event) => {
    const snapshot = event.data
    if (!snapshot) return logger.info('No data associated with the event')

    try {
      const test = snapshot.data()
      await updateUserTestEntry(test, snapshot.id)
    } catch (error) {
      logger.error(`Error in onTestCreate for test ${event.params.docId}:`, { error })
      throw error
    }
  },
})
