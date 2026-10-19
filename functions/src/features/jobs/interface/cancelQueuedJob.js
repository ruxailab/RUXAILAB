import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import { taskQueue } from '../../../core/tasks/index.js'
import { TASK_QUEUE_BY_TYPE } from '../taskQueueNames.js'
import { FirestoreJobRepository } from '../../../core/repositories/FirestoreJobRepository.js'
import {
  FirestoreUserRepository,
  FirestoreStudyRepository,
} from '../../../shared/repositories/index.js'
import { CancelQueuedJobService } from '../service/CancelQueuedJobService.js'
import { cancelQueuedJobValidator } from '../validators/cancelQueuedJobValidator.js'

/**
 * Callable entry point: cancel a job that is still queued.
 */
export const cancelQueuedJob = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Job cancel failed'),
    requireAuth,
    validateRequest(cancelQueuedJobValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const taskQueues = {}
    for (const functionName of new Set(Object.values(TASK_QUEUE_BY_TYPE))) {
      taskQueues[functionName] = taskQueue(functionName)
    }

    const service = new CancelQueuedJobService({
      jobRepository: new FirestoreJobRepository(db),
      userRepository: new FirestoreUserRepository(db),
      studyRepository: new FirestoreStudyRepository(db),
      taskQueues,
      FieldValue: admin.firestore.FieldValue,
    })

    return service.execute({
      uid: request.auth.uid,
      input: request.data || {},
    })
  },
})
