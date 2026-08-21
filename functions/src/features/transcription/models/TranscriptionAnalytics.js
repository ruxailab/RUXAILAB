import { toTaskAnalyticsKey } from './computeTranscriptMetrics.js'

/**
 * @returns {{
 *   sessionDuration: number,
 *   wordsSpoken: number,
 *   speakingTime: number,
 *   speechRate: number,
 *   keywords: Array,
 * }}
 */
const emptyGeneral = () => ({
  sessionDuration: 0,
  wordsSpoken: 0,
  speakingTime: 0,
  speechRate: 0,
  keywords: [],
})

/**
 * Aggregated transcription analytics stored under answers/{id}/analytics/transcription.
 */
export class TranscriptionAnalytics {
  /**
   * @param {object} params
   * @param {object} [params.general]
   * @param {Record<string, object>} [params.tasks]
   * @param {unknown} [params.updatedAt]
   */
  constructor({ general = null, tasks = {}, updatedAt = null } = {}) {
    this.general = general ? { ...emptyGeneral(), ...general } : emptyGeneral()
    this.tasks = tasks && typeof tasks === 'object' ? { ...tasks } : {}
    this.updatedAt = updatedAt
  }

  /**
   * @returns {TranscriptionAnalytics}
   */
  static empty() {
    return new TranscriptionAnalytics()
  }

  /**
   * @param {object} [data]
   * @returns {TranscriptionAnalytics}
   */
  static fromFirestore(data = {}) {
    return new TranscriptionAnalytics({
      general: data.general ?? null,
      tasks: data.tasks ?? {},
      updatedAt: data.updatedAt ?? null,
    })
  }

  /**
   * @param {string|number} taskId
   * @param {object} taskMetrics
   * @returns {TranscriptionAnalytics}
   */
  upsertTask(taskId, taskMetrics) {
    const key = toTaskAnalyticsKey(taskId)
    this.tasks[key] = {
      transcriptionDocId: taskMetrics.transcriptionDocId ?? null,
      userDocId: taskMetrics.userDocId ?? null,
      sessionDuration: Number(taskMetrics.sessionDuration) || 0,
      wordsSpoken: Number(taskMetrics.wordsSpoken) || 0,
      speakingTime: Number(taskMetrics.speakingTime) || 0,
      speechRate: Number(taskMetrics.speechRate) || 0,
      keywords: Array.isArray(taskMetrics.keywords) ? taskMetrics.keywords : [],
    }
    this.recomputeGeneral()
    return this
  }

  /**
   * Recompute general metrics from all task entries.
   * @returns {TranscriptionAnalytics}
   */
  recomputeGeneral() {
    const entries = Object.values(this.tasks)
    let sessionDuration = 0
    let wordsSpoken = 0
    let speakingTime = 0

    for (const entry of entries) {
      sessionDuration += Number(entry?.sessionDuration) || 0
      wordsSpoken += Number(entry?.wordsSpoken) || 0
      speakingTime += Number(entry?.speakingTime) || 0
    }

    sessionDuration = Math.round(sessionDuration * 100) / 100
    speakingTime = Math.round(speakingTime * 100) / 100
    const speechRate =
      speakingTime > 0 ? Math.round(wordsSpoken / (speakingTime / 60)) : 0

    this.general = {
      sessionDuration,
      wordsSpoken,
      speakingTime,
      speechRate,
      keywords: Array.isArray(this.general?.keywords) ? this.general.keywords : [],
    }
    return this
  }

  /**
   * @returns {object}
   */
  toFirestore() {
    return {
      general: {
        sessionDuration: this.general.sessionDuration,
        wordsSpoken: this.general.wordsSpoken,
        speakingTime: this.general.speakingTime,
        speechRate: this.general.speechRate,
        keywords: this.general.keywords,
      },
      tasks: this.tasks,
      updatedAt: this.updatedAt,
    }
  }
}
