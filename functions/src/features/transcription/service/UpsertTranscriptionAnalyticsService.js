import { computeTranscriptMetrics } from './computeTranscriptMetrics.js'
import { extractKeywords } from './extractKeywords.js'
import {
  buildTranscriptionAnalytics,
  collectTranscriptionDocIds,
} from './buildTranscriptionAnalytics.js'

/**
 * Persist per-transcription analytics and rebuild answer-level aggregates.
 */
export class UpsertTranscriptionAnalyticsService {
  /**
   * @param {object} deps
   * @param {import('../repositories/FirestoreTranscriptionAnalyticsRepository.js').FirestoreTranscriptionAnalyticsRepository} deps.analyticsRepository
   * @param {import('../repositories/FirestoreTranscriptionRepository.js').FirestoreTranscriptionRepository} deps.transcriptionRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {object} deps.FieldValue
   */
  constructor({
    analyticsRepository,
    transcriptionRepository,
    answerRepository,
    FieldValue,
  }) {
    this.analyticsRepository = analyticsRepository
    this.transcriptionRepository = transcriptionRepository
    this.answerRepository = answerRepository
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {object} params.transcription - Transcription toJSON() or domain-like object
   * @returns {Promise<object>}
   */
  async execute({ transcription }) {
    const metrics = computeTranscriptMetrics(transcription)
    const keywords = extractKeywords(transcription)
    
    const analyticsFields = {
      sessionDuration: metrics.sessionDuration,
      wordsSpoken: metrics.wordsSpoken,
      speakingTime: metrics.speakingTime,
      speechRate: metrics.speechRate,
      keywords,
    }

    await this.transcriptionRepository.update(transcription.id, {
      ...analyticsFields,
      updatedAt: this.FieldValue.serverTimestamp(),
    })

    const answer = await this.answerRepository.get(transcription.answersDocId)
    const transcriptionIds = new Set(collectTranscriptionDocIds(answer))
    transcriptionIds.add(String(transcription.id))

    const loaded = await Promise.all(
      [...transcriptionIds].map((id) => this.transcriptionRepository.get(id)),
    )

    const byId = new Map()
    for (const doc of loaded) {
      if (doc?.id) byId.set(String(doc.id), doc)
    }

    // Prefer in-memory analytics for the transcription just updated.
    const current = byId.get(String(transcription.id))
    byId.set(String(transcription.id), {
      ...(current || transcription),
      ...analyticsFields,
      id: transcription.id,
      answersDocId: transcription.answersDocId,
      userDocId: transcription.userDocId,
      taskId: transcription.taskId,
    })

    const analytics = buildTranscriptionAnalytics([...byId.values()])
    analytics.updatedAt = this.FieldValue.serverTimestamp()
    return await this.analyticsRepository.set(analytics)
  }
}
