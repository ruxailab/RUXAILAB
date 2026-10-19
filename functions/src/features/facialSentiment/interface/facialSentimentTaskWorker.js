import { admin, functions } from '../../../core/firebase/index.js'
import { FirestoreJobRepository } from '../../../core/repositories/FirestoreJobRepository.js'
import { runQueuedJob } from '../../../core/tasks/index.js'
import {
  FirestoreUserRepository,
  FirestoreAnswerRepository,
  FirestoreStudyRepository,
  FirestoreSentimentRepository,
} from '../../../shared/repositories/index.js'
import { FirestoreSentimentAnalyticsRepository } from '../repositories/FirestoreSentimentAnalyticsRepository.js'
import { AnalyzeFacialSentimentTaskService } from '../service/AnalyzeFacialSentimentTaskService.js'
import { ProcessFacialSentimentTaskService } from '../service/ProcessFacialSentimentTaskService.js'
import { UpsertSentimentAnalyticsService } from '../service/UpsertSentimentAnalyticsService.js'

/**
 * Cloud Tasks worker for facialSentimentTask.
 */
export const facialSentimentTaskWorker = functions.onTaskDispatched({
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
    const sentimentRepository = new FirestoreSentimentRepository(db)

    const processService = new ProcessFacialSentimentTaskService({
      analyzeService: new AnalyzeFacialSentimentTaskService({
        userRepository: new FirestoreUserRepository(db),
        answerRepository,
        studyRepository: new FirestoreStudyRepository(db),
        sentimentRepository,
        FieldValue,
        facialSentimentApiBaseUrl: process.env.FACIAL_SENTIMENT_API_BASE_URL,
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
      maxAttempts: 3,
      failureMessage: 'Facial sentiment analysis failed',
      work: () => processService.execute({ uid, input }),
      resultFields: (saved) => ({ sentimentDocId: saved.sentimentDocId }),
    })
  },
})
