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
import { AnalyzeTextSentimentTaskService } from '../service/AnalyzeTextSentimentTaskService.js'
import { EnqueueTextSentimentTaskService } from '../service/EnqueueTextSentimentTaskService.js'
import { textSentimentTaskValidator } from '../validators/textSentimentTaskValidator.js'

/**
 * Callable entry point: authenticates the caller and enqueues text sentiment.
 * The Cloud Tasks worker performs the analysis.
 */
export const textSentimentTask = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Text sentiment analysis failed'),
    requireAuth,
    validateRequest(textSentimentTaskValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const service = new AnalyzeTextSentimentTaskService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository: new FirestoreAnswerRepository(db),
      studyRepository: new FirestoreStudyRepository(db),
      sentimentRepository: new FirestoreSentimentRepository(db),
      FieldValue,
      textSentimentApiBaseUrl: process.env.TRANSCRIPTION_SENTIMENT_API_BASE_URL,
    })

    const ready = await service.resolveContext({
      uid: request.auth.uid,
      input,
    })

    const enqueueService = new EnqueueTextSentimentTaskService({
      jobRepository: new FirestoreJobRepository(db),
      taskQueue: taskQueue('textSentimentTaskWorker'),
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
