import { functions } from '../f.firebase.js'
import { updateUserTestEntry } from './updateUserTestEntry.js'
import logger from '../utils/logger.js'

export const onTestUpdate = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'updated',
  handler: async (event) => {
    const snapshot = event.data.after
    if (!snapshot) return logger.info('No data associated with the event')

    const newTest = snapshot.data()
    await updateUserTestEntry(newTest, snapshot.id)
  },
})
