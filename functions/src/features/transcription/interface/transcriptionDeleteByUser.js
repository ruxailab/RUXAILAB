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
} from '../../../shared/repositories/index.js'
import { FirestoreTranscriptionRepository } from '../repositories/FirestoreTranscriptionRepository.js'
import { FirestoreTranscriptionAnalyticsRepository } from '../repositories/FirestoreTranscriptionAnalyticsRepository.js'
import { DeleteUserTranscriptionsService } from '../service/DeleteUserTranscriptionsService.js'
import { RebuildTranscriptionAnalyticsService } from '../service/RebuildTranscriptionAnalyticsService.js'
import { transcriptionDeleteByUserValidator } from '../validators/transcriptionDeleteByUserValidator.js'

/**
 * Callable entry point: delete all transcriptions for a user answer and rebuild analytics.
 */
export const transcriptionDeleteByUser = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Transcription delete by user failed'),
    requireAuth,
    validateRequest(transcriptionDeleteByUserValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const answerRepository = new FirestoreAnswerRepository(db)
    const transcriptionRepository = new FirestoreTranscriptionRepository(db)

    const service = new DeleteUserTranscriptionsService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository,
      studyRepository: new FirestoreStudyRepository(db),
      transcriptionRepository,
      createRebuildService: (answersDocId) =>
        new RebuildTranscriptionAnalyticsService({
          analyticsRepository: new FirestoreTranscriptionAnalyticsRepository(
            db,
            answersDocId,
          ),
          transcriptionRepository,
          answerRepository,
          FieldValue,
        }),
    })

    return service.execute({ uid: request.auth.uid, input })
  },
})
