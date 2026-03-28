import { functions } from '../f.firebase.js'
import { updateUserTestEntry } from './updateUserTestEntry.js'
import logger from '../utils/logger.js'

export const onTestUpdate = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'updated',
  handler: async (event) => {
    const snapshot = event.data.after
    if (!snapshot) return logger.info('No data associated with the event')

    try {
      const newTest = snapshot.data()
      await updateUserTestEntry(newTest, snapshot.id)
    } catch (error) {
      logger.error(`Error in onTestUpdate for test ${event.params.docId}:`, { error })
      throw error
    }
  },
})
