import { RebuildSentimentAnalyticsService } from './RebuildSentimentAnalyticsService.js'

/**
 * Rebuild answer-level sentiment aggregates after a facial (or text) result save.
 */
export class UpsertSentimentAnalyticsService {
  /**
   * @param {object} deps
   * @param {import('../repositories/FirestoreSentimentAnalyticsRepository.js').FirestoreSentimentAnalyticsRepository} deps.analyticsRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {object} deps.FieldValue
   */
  constructor({ analyticsRepository, answerRepository, FieldValue }) {
    this.rebuildService = new RebuildSentimentAnalyticsService({
      analyticsRepository,
      answerRepository,
      FieldValue,
    })
  }

  /**
   * @param {object} params
   * @param {string} params.answersDocId
   * @param {string} params.userDocId
   * @param {string|number} params.taskId
   * @param {object} params.emotions
   * @returns {Promise<object>}
   */
  async execute({ answersDocId, userDocId, taskId, emotions }) {
    return this.rebuildService.execute({
      answersDocId,
      preferResult: {
        userDocId,
        taskId,
        emotions,
      },
    })
  }
}
