import { RebuildSentimentAnalyticsService } from './RebuildSentimentAnalyticsService.js'

/**
 * Rebuild answer-level sentiment aggregates after a facial (or text) result save.
 */
export class UpsertSentimentAnalyticsService {
  /**
   * @param {object} deps
   * @param {import('../repositories/FirestoreSentimentAnalyticsRepository.js').FirestoreSentimentAnalyticsRepository} deps.analyticsRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {import('../../../shared/repositories/FirestoreSentimentRepository.js').FirestoreSentimentRepository} deps.sentimentRepository
   * @param {object} deps.FieldValue
   */
  constructor({
    analyticsRepository,
    answerRepository,
    sentimentRepository,
    FieldValue,
  }) {
    this.rebuildService = new RebuildSentimentAnalyticsService({
      analyticsRepository,
      answerRepository,
      sentimentRepository,
      FieldValue,
    })
  }

  /**
   * @param {object} params
   * @param {string} params.answersDocId
   * @param {string} params.userDocId
   * @param {string|number} params.taskId
   * @param {string} [params.sentimentDocId]
   * @param {object} [params.emotions]
   * @param {object} [params.text]
   * @returns {Promise<object>}
   */
  async execute({
    answersDocId,
    userDocId,
    taskId,
    sentimentDocId = null,
    emotions = null,
    text = null,
  }) {
    return this.rebuildService.execute({
      answersDocId,
      preferResult: {
        id: sentimentDocId,
        userDocId,
        taskId,
        emotions,
        text,
      },
    })
  }
}
