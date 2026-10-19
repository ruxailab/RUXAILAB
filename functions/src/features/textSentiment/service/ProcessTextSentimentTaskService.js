/**
 * Analyzes text sentiment and rebuilds answer-level analytics.
 */
export class ProcessTextSentimentTaskService {
  /**
   * @param {object} deps
   * @param {import('./AnalyzeTextSentimentTaskService.js').AnalyzeTextSentimentTaskService} deps.analyzeService
   * @param {import('../../facialSentiment/service/UpsertSentimentAnalyticsService.js').UpsertSentimentAnalyticsService} deps.analyticsService
   */
  constructor({ analyzeService, analyticsService }) {
    this.analyzeService = analyzeService
    this.analyticsService = analyticsService
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @returns {Promise<object>}
   */
  async execute({ uid, input }) {
    const saved = await this.analyzeService.execute({ uid, input })
    await this.analyticsService.execute({
      answersDocId: saved.answersDocId,
      userDocId: saved.userDocId,
      taskId: saved.taskId,
      sentimentDocId: saved.sentimentDocId,
      text: saved.text,
    })
    return saved
  }
}
