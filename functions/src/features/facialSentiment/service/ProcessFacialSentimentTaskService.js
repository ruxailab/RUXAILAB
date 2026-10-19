/**
 * Analyzes facial sentiment and rebuilds answer-level analytics.
 */
export class ProcessFacialSentimentTaskService {
  /**
   * @param {object} deps
   * @param {import('./AnalyzeFacialSentimentTaskService.js').AnalyzeFacialSentimentTaskService} deps.analyzeService
   * @param {import('./UpsertSentimentAnalyticsService.js').UpsertSentimentAnalyticsService} deps.analyticsService
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
      emotions: saved.emotions,
    })
    return saved
  }
}
