import { computeTranscriptMetrics } from './computeTranscriptMetrics.js'
import { extractKeywords } from './extractKeywords.js'
import { RebuildTranscriptionAnalyticsService } from './RebuildTranscriptionAnalyticsService.js'

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
    this.transcriptionRepository = transcriptionRepository
    this.FieldValue = FieldValue
    this.rebuildService = new RebuildTranscriptionAnalyticsService({
      analyticsRepository,
      transcriptionRepository,
      answerRepository,
      FieldValue,
    })
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

    return this.rebuildService.execute({
      answersDocId: transcription.answersDocId,
      preferTranscription: {
        ...transcription,
        ...analyticsFields,
        id: transcription.id,
        answersDocId: transcription.answersDocId,
        userDocId: transcription.userDocId,
        taskId: transcription.taskId,
      },
    })
  }
}
