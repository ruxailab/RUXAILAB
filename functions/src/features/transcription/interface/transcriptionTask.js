import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import { taskQueue } from '../../../core/tasks/index.js'
import {
  FirestoreUserRepository,
  FirestoreAnswerRepository,
  FirestoreStudyRepository,
} from '../../../shared/repositories/index.js'
import { FirestoreTranscriptionRepository } from '../repositories/FirestoreTranscriptionRepository.js'
import { FirestoreJobRepository } from '../../../core/repositories/FirestoreJobRepository.js'
import { TranscribeTaskService } from '../service/TranscribeTaskService.js'
import { EnqueueTranscriptionTaskService } from '../service/EnqueueTranscriptionTaskService.js'
import { transcriptionTaskValidator } from '../validators/transcriptionTaskValidator.js'

/**
 * Callable entry point: authenticates the caller and enqueues transcription.
 * The Cloud Tasks worker performs the transcription.
 */
export const transcriptionTask = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Task transcription failed'),
    requireAuth,
    validateRequest(transcriptionTaskValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const input = request.data || {}

    const service = new TranscribeTaskService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository: new FirestoreAnswerRepository(db),
      studyRepository: new FirestoreStudyRepository(db),
      transcriptionRepository: new FirestoreTranscriptionRepository(db),
      FieldValue,
      transcriptionApiBaseUrl: process.env.TRANSCRIPTION_API_BASE_URL,
    })

    const ready = await service.resolveContext({
      uid: request.auth.uid,
      input,
    })

    const enqueueService = new EnqueueTranscriptionTaskService({
      jobRepository: new FirestoreJobRepository(db),
      taskQueue: taskQueue('transcriptionTaskWorker'),
      FieldValue,
    })

    return enqueueService.execute({
      uid: request.auth.uid,
      input: {
        answersDocId: ready.answersDocId,
        userDocId: ready.userDocId,
        taskId: ready.taskId,
        provider: ready.provider,
        model: ready.model,
        studyId: ready.studyId,
      },
    })
  },
})
