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
import {
  FirestoreSentimentAnalyticsRepository,
  UpsertSentimentAnalyticsService,
} from '../../facialSentiment/index.js'
import { AnalyzeTextSentimentTaskService } from '../service/AnalyzeTextSentimentTaskService.js'
import { textSentimentTaskValidator } from '../validators/textSentimentTaskValidator.js'

/**
 * Callable entry point: authenticates the caller and delegates to AnalyzeTextSentimentTaskService.
 */
export const textSentimentTask = functions.onCall({
  options: {
    timeoutSeconds: 540,
    memory: '256MiB',
  },
  middlewares: [
    mapHttpsError(functions, 'Text sentiment analysis failed'),
    requireAuth,
    validateRequest(textSentimentTaskValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const answerRepository = new FirestoreAnswerRepository(db)
    const sentimentRepository = new FirestoreSentimentRepository(db)

    const service = new AnalyzeTextSentimentTaskService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository,
      studyRepository: new FirestoreStudyRepository(db),
      sentimentRepository,
      FieldValue,
      textSentimentApiBaseUrl: process.env.TRANSCRIPTION_SENTIMENT_API_BASE_URL,
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
      text: saved.text,
    })

    return saved
  },
})
