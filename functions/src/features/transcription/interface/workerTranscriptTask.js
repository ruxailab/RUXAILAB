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
import { TranscribeTaskService } from '../service/TranscribeTaskService.js'
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
    const service = new TranscribeTaskService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository: new FirestoreAnswerRepository(db),
      studyRepository: new FirestoreStudyRepository(db),
      transcriptionRepository: new FirestoreTranscriptionRepository(db),
      FieldValue: admin.firestore.FieldValue,
      transcriptionApiBaseUrl: process.env.TRANSCRIPTION_API_BASE_URL,
    })

    return service.execute({
      uid: request.auth.uid,
      input: request.data || {},
    })
  },
})
