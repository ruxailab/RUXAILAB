import { RebuildTranscriptionAnalyticsService } from './RebuildTranscriptionAnalyticsService.js'

/**
 * Rebuild answer-level aggregates from a transcription that already carries metrics.
 * Per-doc analytics are persisted by TranscribeTaskService before this runs.
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
    this.rebuildService = new RebuildTranscriptionAnalyticsService({
      analyticsRepository,
      transcriptionRepository,
      answerRepository,
      FieldValue,
    })
  }

  /**
   * @param {object} params
   * @param {object} params.transcription - Transcription toJSON() already including analytics fields
   * @returns {Promise<object>}
   */
  async execute({ transcription }) {
    return this.rebuildService.execute({
      answersDocId: transcription.answersDocId,
      preferTranscription: {
        ...transcription,
        id: transcription.id,
        answersDocId: transcription.answersDocId,
        userDocId: transcription.userDocId,
        taskId: transcription.taskId,
      },
    })
  }
}
