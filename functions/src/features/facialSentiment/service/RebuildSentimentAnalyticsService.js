import {
  buildSentimentAnalytics,
  collectSentimentContributions,
} from './buildSentimentAnalytics.js'

/**
 * Rebuild answer-level sentiment analytics from task facial/text results.
 */
export class RebuildSentimentAnalyticsService {
  /**
   * @param {object} deps
   * @param {import('../repositories/FirestoreSentimentAnalyticsRepository.js').FirestoreSentimentAnalyticsRepository} deps.analyticsRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {object} deps.FieldValue
   */
  constructor({ analyticsRepository, answerRepository, FieldValue }) {
    this.analyticsRepository = analyticsRepository
    this.answerRepository = answerRepository
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {string} params.answersDocId
   * @param {{ userDocId: string, taskId: string|number, emotions: object }|null} [params.preferResult]
   * @returns {Promise<object>}
   */
  async execute({ answersDocId, preferResult = null }) {
    const answer = await this.answerRepository.get(answersDocId)
    const contributions = collectSentimentContributions(answer, preferResult)
    const analytics = buildSentimentAnalytics(contributions)
    analytics.updatedAt = this.FieldValue.serverTimestamp()
    // Full replace so removed tasks do not linger under merge.
    await this.analyticsRepository.set(analytics, { merge: false })
    return analytics.toFirestore()
  }
}
