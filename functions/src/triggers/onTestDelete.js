import { admin, functions } from '../f.firebase.js'
import logger from '../utils/logger.js'

export const onTestDelete = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'deleted',
  opts: { retry: true },
  handler: async (event) => {
    const studyId = event.params?.docId
    if (!studyId || studyId.includes('/')) {
      throw new Error('Invalid deleted study path')
    }

    const db = admin.firestore()
    const studyRef = event.data?.ref || db.collection('tests').doc(studyId)
    try {
      await db.recursiveDelete(studyRef)
    } catch (error) {
      logger.error('Study descendant cleanup failed', {
        studyId,
        errorCode: error?.code,
      })
      throw error
    }
  },
})
