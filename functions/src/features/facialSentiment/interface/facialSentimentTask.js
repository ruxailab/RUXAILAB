import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import {
  FirestoreUserRepository,
  FirestoreAnswerRepository,
  FirestoreStudyRepository,
  FirestoreSentimentRepository,
} from '../../../shared/repositories/index.js'
import { FirestoreSentimentAnalyticsRepository } from '../repositories/FirestoreSentimentAnalyticsRepository.js'
import { AnalyzeFacialSentimentTaskService } from '../service/AnalyzeFacialSentimentTaskService.js'
import { UpsertSentimentAnalyticsService } from '../service/UpsertSentimentAnalyticsService.js'
import { facialSentimentTaskValidator } from '../validators/facialSentimentTaskValidator.js'

/**
 * Callable entry point: authenticates the caller and delegates to AnalyzeFacialSentimentTaskService.
 */
export const facialSentimentTask = functions.onCall({
  options: {
    timeoutSeconds: 540,
    memory: '256MiB',
  },
  middlewares: [
    mapHttpsError(functions, 'Facial sentiment analysis failed'),
    requireAuth,
    validateRequest(facialSentimentTaskValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const answerRepository = new FirestoreAnswerRepository(db)
    const sentimentRepository = new FirestoreSentimentRepository(db)

    const service = new AnalyzeFacialSentimentTaskService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository,
      studyRepository: new FirestoreStudyRepository(db),
      sentimentRepository,
      FieldValue,
      facialSentimentApiBaseUrl: process.env.FACIAL_SENTIMENT_API_BASE_URL,
    })

    const saved = await service.execute({ uid: request.auth.uid, input })

    const analyticsService = new UpsertSentimentAnalyticsService({
      analyticsRepository: new FirestoreSentimentAnalyticsRepository(
        db,
        saved.answersDocId,
      ),
      answerRepository,
      sentimentRepository,
      FieldValue,
    })

    await analyticsService.execute({
      answersDocId: saved.answersDocId,
      userDocId: saved.userDocId,
      taskId: saved.taskId,
      sentimentDocId: saved.sentimentDocId,
      emotions: saved.emotions,
    })

    return saved
  },
})
