import { admin, functions } from '../../../core/firebase/index.js'
import { FirestoreJobRepository } from '../../../core/repositories/FirestoreJobRepository.js'
import { runQueuedJob } from '../../../core/tasks/index.js'
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
import { ProcessTextSentimentTaskService } from '../service/ProcessTextSentimentTaskService.js'

const MAX_ATTEMPTS = 3

/**
 * Cloud Tasks worker for textSentimentTask.
 */
export const textSentimentTaskWorker = functions.onTaskDispatched({
  options: {
    timeoutSeconds: 540,
    memory: '256MiB',
    retryConfig: {
      maxAttempts: MAX_ATTEMPTS,
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
    const sentimentRepository = new FirestoreSentimentRepository(db)

    const processService = new ProcessTextSentimentTaskService({
      analyzeService: new AnalyzeTextSentimentTaskService({
        userRepository: new FirestoreUserRepository(db),
        answerRepository,
        studyRepository: new FirestoreStudyRepository(db),
        sentimentRepository,
        FieldValue,
        textSentimentApiBaseUrl: process.env.TRANSCRIPTION_SENTIMENT_API_BASE_URL,
      }),
      analyticsService: new UpsertSentimentAnalyticsService({
        analyticsRepository: new FirestoreSentimentAnalyticsRepository(
          db,
          input.answersDocId,
        ),
        answerRepository,
        sentimentRepository,
        FieldValue,
      }),
    })

    await runQueuedJob({
      repository: new FirestoreJobRepository(db),
      FieldValue,
      jobDocId: jobId,
      jobId,
      retryCount: request.retryCount ?? 0,
      maxAttempts: MAX_ATTEMPTS,
      failureMessage: 'Text sentiment analysis failed',
      work: () => processService.execute({ uid, input }),
      resultFields: (saved) => ({ sentimentDocId: saved.sentimentDocId }),
    })
  },
})
