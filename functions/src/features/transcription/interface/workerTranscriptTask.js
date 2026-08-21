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
import { TranscribeTaskService } from '../service/TranscribeTaskService.js'
import { UpsertTranscriptionAnalyticsService } from '../service/UpsertTranscriptionAnalyticsService.js'
import { workerTranscriptTaskValidator } from '../validators/workerTranscriptTaskValidator.js'

/**
 * Callable entry point: authenticates the caller and delegates to TranscribeTaskService.
 */
export const workerTranscriptTask = functions.onCall({
  options: {
    timeoutSeconds: 540,
    memory: '256MiB',
  },
  middlewares: [
    mapHttpsError(functions, 'Task transcription failed'),
    requireAuth,
    validateRequest(workerTranscriptTaskValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const answerRepository = new FirestoreAnswerRepository(db)
    const transcriptionRepository = new FirestoreTranscriptionRepository(db)

    const service = new TranscribeTaskService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository,
      studyRepository: new FirestoreStudyRepository(db),
      transcriptionRepository,
      FieldValue,
      transcriptionApiBaseUrl: process.env.TRANSCRIPTION_API_BASE_URL,
    })

    const analyticsService = new UpsertTranscriptionAnalyticsService({
      analyticsRepository: new FirestoreTranscriptionAnalyticsRepository(db, input.answersDocId),
      transcriptionRepository,
      answerRepository,
      FieldValue,
    })

    const saved = await service.execute({ uid: request.auth.uid, input })
    await analyticsService.execute({ transcription: saved })
    return saved
  },
})
