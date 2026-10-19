/**
 * Transcribes a task and rebuilds answer-level analytics.
 */
export class ProcessTranscriptionTaskService {
  /**
   * @param {object} deps
   * @param {import('./TranscribeTaskService.js').TranscribeTaskService} deps.transcribeTaskService
   * @param {import('./UpsertTranscriptionAnalyticsService.js').UpsertTranscriptionAnalyticsService} deps.analyticsService
   */
  constructor({ transcribeTaskService, analyticsService }) {
    this.transcribeTaskService = transcribeTaskService
    this.analyticsService = analyticsService
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @returns {Promise<object>}
   */
  async execute({ uid, input }) {
    const saved = await this.transcribeTaskService.execute({ uid, input })
    await this.analyticsService.execute({ transcription: saved })
    return saved
  }
}
