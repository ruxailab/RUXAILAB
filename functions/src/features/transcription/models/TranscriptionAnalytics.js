/**
 * Aggregated transcription analytics stored under answers/{id}/analytics/transcription.
 * Per-user detail lives on each transcriptions/{id} document.
 */
export class TranscriptionAnalytics {
  /**
   * @param {object} params
   * @param {object} [params.general]
   * @param {Record<string, object>} [params.tasks]
   * @param {unknown} [params.updatedAt]
   */
  constructor({ general = null, tasks = {}, updatedAt = null } = {}) {
    this.general = general
      ? {
          sessionDuration: Number(general.sessionDuration) || 0,
          wordsSpoken: Number(general.wordsSpoken) || 0,
          speakingTime: Number(general.speakingTime) || 0,
          speechRate: Number(general.speechRate) || 0,
          keywords:
            general.keywords &&
            typeof general.keywords === 'object' &&
            !Array.isArray(general.keywords)
              ? { ...general.keywords }
              : {},
        }
      : {
          sessionDuration: 0,
          wordsSpoken: 0,
          speakingTime: 0,
          speechRate: 0,
          keywords: {},
        }
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
   * @returns {object}
   */
  toFirestore() {
    return {
      general: {
        sessionDuration: this.general.sessionDuration,
        wordsSpoken: this.general.wordsSpoken,
        speakingTime: this.general.speakingTime,
        speechRate: this.general.speechRate,
        keywords: this.general.keywords || {},
      },
      tasks: this.tasks,
      updatedAt: this.updatedAt,
    }
  }
}
