import { fail } from '../../../core/errors.js'
import { TranscriptionAnalytics } from '../models/TranscriptionAnalytics.js'
import { computeTranscriptMetrics } from '../models/computeTranscriptMetrics.js'

/**
 * Create or update answers/{id}/analytics/transcription after a task transcription.
 */
export class UpsertTranscriptionAnalyticsService {
  /**
   * @param {object} deps
   * @param {import('../repositories/FirestoreTranscriptionAnalyticsRepository.js').FirestoreTranscriptionAnalyticsRepository} deps.analyticsRepository
   * @param {object} deps.FieldValue
   */
  constructor({ analyticsRepository, FieldValue }) {
    this.analyticsRepository = analyticsRepository
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {object} params.transcription - Transcription toJSON() or domain-like object
   * @param {number} [params.fallbackSessionDurationSec]
   * @returns {Promise<object>}
   */
  async execute({ transcription }) {
    if (!transcription?.answersDocId) {
      fail('invalid-argument', 'transcription.answersDocId is required')
    }
    if (transcription.taskId == null || transcription.taskId === '') {
      fail('invalid-argument', 'transcription.taskId is required')
    }

    const metrics = computeTranscriptMetrics(transcription)
    const existing = await this.analyticsRepository.get()
    const analytics = existing ?? TranscriptionAnalytics.empty()

    analytics.upsertTask(transcription.taskId, {
      transcriptionDocId: transcription.id ?? null,
      userDocId: transcription.userDocId ?? null,
      sessionDuration: metrics.sessionDuration,
      wordsSpoken: metrics.wordsSpoken,
      speakingTime: metrics.speakingTime,
      speechRate: metrics.speechRate,
      keywords: [],
    })
    
    analytics.updatedAt = this.FieldValue.serverTimestamp()
    return await this.analyticsRepository.set(analytics)
  }
}
