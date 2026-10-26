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
  RebuildSentimentAnalyticsService,
} from '../../facialSentiment/index.js'
import { DeleteTextSentimentService } from '../service/DeleteTextSentimentService.js'
import { textSentimentDeleteValidator } from '../validators/textSentimentDeleteValidator.js'

/**
 * Callable entry point: delete text sentiment and rebuild analytics.
 */
export const textSentimentDelete = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Text sentiment delete failed'),
    requireAuth,
    validateRequest(textSentimentDeleteValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const answerRepository = new FirestoreAnswerRepository(db)
    const sentimentRepository = new FirestoreSentimentRepository(db)

    const service = new DeleteTextSentimentService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository,
      studyRepository: new FirestoreStudyRepository(db),
      sentimentRepository,
      createRebuildService: (answersDocId) =>
        new RebuildSentimentAnalyticsService({
          analyticsRepository: new FirestoreSentimentAnalyticsRepository(
            db,
            answersDocId,
          ),
          answerRepository,
          sentimentRepository,
          FieldValue,
        }),
      FieldValue,
    })

    return service.execute({
      uid: request.auth.uid,
      input: request.data || {},
    })
  },
})
