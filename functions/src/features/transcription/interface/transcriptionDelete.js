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
import { DeleteTranscriptionService } from '../service/DeleteTranscriptionService.js'
import { RebuildTranscriptionAnalyticsService } from '../service/RebuildTranscriptionAnalyticsService.js'
import { transcriptionDeleteValidator } from '../validators/transcriptionDeleteValidator.js'

/**
 * Callable entry point: delete a transcription and rebuild analytics.
 */
export const transcriptionDelete = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Transcription delete failed'),
    requireAuth,
    validateRequest(transcriptionDeleteValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const answerRepository = new FirestoreAnswerRepository(db)
    const transcriptionRepository = new FirestoreTranscriptionRepository(db)

    const service = new DeleteTranscriptionService({
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
