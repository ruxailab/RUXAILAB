import {
  buildSentimentAnalytics,
  collectSentimentContributions,
  collectSentimentDocIds,
} from './buildSentimentAnalytics.js'

/**
 * Rebuild answer-level sentiment analytics from sentiment documents.
 */
export class RebuildSentimentAnalyticsService {
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
    this.analyticsRepository = analyticsRepository
    this.answerRepository = answerRepository
    this.sentimentRepository = sentimentRepository
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {string} params.answersDocId
   * @param {{ id?: string, userDocId: string, taskId: string|number, emotions?: object, facial?: object, text?: object }|null} [params.preferResult]
   * @returns {Promise<object>}
   */
  async execute({ answersDocId, preferResult = null }) {
    const answer = await this.answerRepository.get(answersDocId)
    const sentimentIds = new Set(collectSentimentDocIds(answer))

    if (preferResult?.id) {
      sentimentIds.add(String(preferResult.id))
    }

    const loaded = await Promise.all(
      [...sentimentIds].map((id) => this.sentimentRepository.get(id)),
    )

    const contributions = collectSentimentContributions(loaded, preferResult)
    const analytics = buildSentimentAnalytics(contributions)
    analytics.updatedAt = this.FieldValue.serverTimestamp()
    // Full replace so removed tasks do not linger under merge.
    await this.analyticsRepository.set(analytics, { merge: false })
    return analytics.toFirestore()
  }
}
