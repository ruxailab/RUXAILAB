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
import { DeleteUserSentimentsService } from '../service/DeleteUserSentimentsService.js'
import { RebuildSentimentAnalyticsService } from '../service/RebuildSentimentAnalyticsService.js'
import { sentimentDeleteByUserValidator } from '../validators/sentimentDeleteByUserValidator.js'

/**
 * Callable entry point: delete all sentiments for a user answer and rebuild analytics.
 */
export const sentimentDeleteByUser = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Sentiment delete by user failed'),
    requireAuth,
    validateRequest(sentimentDeleteByUserValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const answerRepository = new FirestoreAnswerRepository(db)
    const sentimentRepository = new FirestoreSentimentRepository(db)

    const service = new DeleteUserSentimentsService({
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
    })

    return service.execute({ uid: request.auth.uid, input })
  },
})
