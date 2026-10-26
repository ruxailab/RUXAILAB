import { admin, functions } from '../../../core/firebase/index.js'
import { FirestoreJobRepository } from '../../../core/repositories/FirestoreJobRepository.js'
import { runQueuedJob } from '../../../core/tasks/index.js'
import {
  FirestoreUserRepository,
  FirestoreAnswerRepository,
  FirestoreStudyRepository,
} from '../../../shared/repositories/index.js'
import { FirestoreTranscriptionRepository } from '../repositories/FirestoreTranscriptionRepository.js'
import { FirestoreTranscriptionAnalyticsRepository } from '../repositories/FirestoreTranscriptionAnalyticsRepository.js'
import { ProcessTranscriptionTaskService } from '../service/ProcessTranscriptionTaskService.js'
import { TranscribeTaskService } from '../service/TranscribeTaskService.js'
import { UpsertTranscriptionAnalyticsService } from '../service/UpsertTranscriptionAnalyticsService.js'

/**
 * Cloud Tasks worker for transcriptionTask.
 */
export const transcriptionTaskWorker = functions.onTaskDispatched({
  options: {
    timeoutSeconds: 540,
    memory: '256MiB',
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 30,
    },
    rateLimits: {
      maxConcurrentDispatches: 1,
    },
  },
  handler: async (request) => {
    const data = request.data || {}
    const { uid, jobId, type: _type, ...input } = data
    const db = admin.firestore()
    const FieldValue = admin.firestore.FieldValue
    const answerRepository = new FirestoreAnswerRepository(db)
    const transcriptionRepository = new FirestoreTranscriptionRepository(db)

    const processService = new ProcessTranscriptionTaskService({
      transcribeTaskService: new TranscribeTaskService({
        userRepository: new FirestoreUserRepository(db),
        answerRepository,
        studyRepository: new FirestoreStudyRepository(db),
        transcriptionRepository,
        FieldValue,
        transcriptionApiBaseUrl: process.env.TRANSCRIPTION_API_BASE_URL,
      }),
      analyticsService: new UpsertTranscriptionAnalyticsService({
        analyticsRepository: new FirestoreTranscriptionAnalyticsRepository(
          db,
          input.answersDocId,
        ),
        transcriptionRepository,
        answerRepository,
        FieldValue,
      }),
    })

    await runQueuedJob({
      repository: new FirestoreJobRepository(db),
      FieldValue,
      jobDocId: jobId,
      jobId,
      retryCount: request.retryCount ?? 0,
      maxAttempts: 3,
      failureMessage: 'Task transcription failed',
      work: () => processService.execute({ uid, input }),
      resultFields: (saved) => ({ transcriptionId: saved.id }),
    })
  },
})
