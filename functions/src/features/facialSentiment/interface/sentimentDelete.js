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
import { DeleteSentimentSideService } from '../service/DeleteSentimentSideService.js'
import { RebuildSentimentAnalyticsService } from '../service/RebuildSentimentAnalyticsService.js'
import { sentimentDeleteValidator } from '../validators/sentimentDeleteValidator.js'

/**
 * Callable entry point: clear facial or text sentiment and rebuild analytics.
 */
export const sentimentDelete = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Sentiment delete failed'),
    requireAuth,
    validateRequest(sentimentDeleteValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const answerRepository = new FirestoreAnswerRepository(db)
    const sentimentRepository = new FirestoreSentimentRepository(db)

    const service = new DeleteSentimentSideService({
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