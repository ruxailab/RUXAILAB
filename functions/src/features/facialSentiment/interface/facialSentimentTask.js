import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import { FirestoreJobRepository } from '../../../core/repositories/FirestoreJobRepository.js'
import { taskQueue } from '../../../core/tasks/index.js'
import {
  FirestoreUserRepository,
  FirestoreAnswerRepository,
  FirestoreStudyRepository,
  FirestoreSentimentRepository,
} from '../../../shared/repositories/index.js'
import { AnalyzeFacialSentimentTaskService } from '../service/AnalyzeFacialSentimentTaskService.js'
import { EnqueueFacialSentimentTaskService } from '../service/EnqueueFacialSentimentTaskService.js'
import { facialSentimentTaskValidator } from '../validators/facialSentimentTaskValidator.js'

/**
 * Callable entry point: authenticates the caller and enqueues facial sentiment.
 * The Cloud Tasks worker performs the analysis.
 */
export const facialSentimentTask = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Facial sentiment analysis failed'),
    requireAuth,
    validateRequest(facialSentimentTaskValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const service = new AnalyzeFacialSentimentTaskService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository: new FirestoreAnswerRepository(db),
      studyRepository: new FirestoreStudyRepository(db),
      sentimentRepository: new FirestoreSentimentRepository(db),
      FieldValue,
      facialSentimentApiBaseUrl: process.env.FACIAL_SENTIMENT_API_BASE_URL,
    })

    const ready = await service.resolveContext({
      uid: request.auth.uid,
      input,
    })

    const enqueueService = new EnqueueFacialSentimentTaskService({
      jobRepository: new FirestoreJobRepository(db),
      taskQueue: taskQueue('facialSentimentTaskWorker'),
      FieldValue,
    })

    return enqueueService.execute({
      uid: request.auth.uid,
      input: {
        answersDocId: ready.answersDocId,
        userDocId: ready.userDocId,
        taskId: ready.taskId,
        studyId: ready.studyId,
      },
    })
  },
})
