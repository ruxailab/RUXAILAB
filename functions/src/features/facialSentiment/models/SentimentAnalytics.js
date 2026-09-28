/**
 * Positive / Neutral / Negative intensity bucket used in sentiment analytics.
 */
export class SentimentBucket {
  /**
   * @param {object} [params]
   * @param {number} [params.Positive]
   * @param {number} [params.Neutral]
   * @param {number} [params.Negative]
   * @param {string|null} [params.dominant]
   * @param {number} [params.sampleCount]
   */
  constructor({
    Positive = 0,
    Neutral = 0,
    Negative = 0,
    dominant = null,
    sampleCount = 0,
  } = {}) {
    this.Positive = Number(Positive) || 0
    this.Neutral = Number(Neutral) || 0
    this.Negative = Number(Negative) || 0
    this.sampleCount = Number(sampleCount) || 0
    this.dominant =
      dominant ||
      SentimentBucket.computeDominant({
        Positive: this.Positive,
        Neutral: this.Neutral,
        Negative: this.Negative,
      })
  }

  /**
   * @param {{ Positive: number, Neutral: number, Negative: number }} scores
   * @returns {'Positive'|'Neutral'|'Negative'|null}
   */
  static computeDominant(scores) {
    const entries = [
      ['Positive', Number(scores.Positive) || 0],
      ['Neutral', Number(scores.Neutral) || 0],
      ['Negative', Number(scores.Negative) || 0],
    ]
    const total = entries.reduce((sum, [, value]) => sum + value, 0)
    if (total <= 0) return null
    entries.sort((a, b) => b[1] - a[1])
    return entries[0][0]
  }

  /**
   * @returns {SentimentBucket}
   */
  static empty() {
    return new SentimentBucket()
  }

  /**
   * @param {object} [data]
   * @returns {SentimentBucket}
   */
  static fromFirestore(data = {}) {
    return new SentimentBucket(data)
  }

  /**
   * @returns {object}
   */
  toFirestore() {
    return {
      Positive: this.Positive,
      Neutral: this.Neutral,
      Negative: this.Negative,
      dominant: this.dominant,
      sampleCount: this.sampleCount,
    }
  }
}

/**
 * Signal slice: facial + text + combined rollup.
 */
export class SentimentSignalSlice {
  /**
   * @param {object} [params]
   * @param {SentimentBucket|object} [params.combined]
   * @param {SentimentBucket|object} [params.facial]
   * @param {SentimentBucket|object} [params.text]
   */
  constructor({ combined = null, facial = null, text = null } = {}) {
    this.facial =
      facial instanceof SentimentBucket
        ? facial
        : SentimentBucket.fromFirestore(facial || {})
    this.text =
      text instanceof SentimentBucket
        ? text
        : SentimentBucket.fromFirestore(text || {})
    this.combined =
      combined instanceof SentimentBucket
        ? combined
        : combined
          ? SentimentBucket.fromFirestore(combined)
          : SentimentSignalSlice.mergeBuckets([this.facial, this.text])
  }

  /**
   * Weighted average of buckets by sampleCount.
   *
   * @param {SentimentBucket[]} buckets
   * @returns {SentimentBucket}
   */
  static mergeBuckets(buckets = []) {
    let positive = 0
    let neutral = 0
    let negative = 0
    let sampleCount = 0

    for (const bucket of buckets) {
      const count = Number(bucket?.sampleCount) || 0
      if (count <= 0) continue
      positive += (Number(bucket.Positive) || 0) * count
      neutral += (Number(bucket.Neutral) || 0) * count
      negative += (Number(bucket.Negative) || 0) * count
      sampleCount += count
    }

    if (sampleCount <= 0) {
      return SentimentBucket.empty()
    }

    return new SentimentBucket({
      Positive: Math.round(positive / sampleCount),
      Neutral: Math.round(neutral / sampleCount),
      Negative: Math.round(negative / sampleCount),
      sampleCount,
    })
  }

  /**
   * @param {object} [data]
   * @returns {SentimentSignalSlice}
   */
  static fromFirestore(data = {}) {
    return new SentimentSignalSlice({
      combined: data.combined,
      facial: data.bySignal?.facial ?? data.facial,
      text: data.bySignal?.text ?? data.text,
    })
  }

  /**
   * @returns {object}
   */
  toFirestore() {
    return {
      combined: this.combined.toFirestore(),
      bySignal: {
        facial: this.facial.toFirestore(),
        text: this.text.toFirestore(),
      },
    }
  }
}

/**
 * Aggregated sentiment analytics under answers/{id}/analytics/sentiment.
 * Only general + tasks (no per-user map) to keep the document bounded.
 */
export class SentimentAnalytics {
  /**
   * @param {object} params
   * @param {SentimentSignalSlice|object} [params.general]
   * @param {Record<string, SentimentSignalSlice|object>} [params.tasks]
   * @param {unknown} [params.updatedAt]
   */
  constructor({ general = null, tasks = {}, updatedAt = null } = {}) {
    this.general =
      general instanceof SentimentSignalSlice
        ? general
        : SentimentSignalSlice.fromFirestore(general || {})
    this.tasks = {}
    if (tasks && typeof tasks === 'object') {
      for (const [key, value] of Object.entries(tasks)) {
        this.tasks[key] =
          value instanceof SentimentSignalSlice
            ? value
            : SentimentSignalSlice.fromFirestore(value || {})
      }
    }
    this.updatedAt = updatedAt
  }

  /**
   * @returns {SentimentAnalytics}
   */
  static empty() {
    return new SentimentAnalytics()
  }

  /**
   * @param {object} [data]
   * @returns {SentimentAnalytics}
   */
  static fromFirestore(data = {}) {
    return new SentimentAnalytics({
      general: data.general ?? null,
      tasks: data.tasks ?? {},
      updatedAt: data.updatedAt ?? null,
    })
  }

  /**
   * @returns {object}
   */
  toFirestore() {
    const tasks = {}
    for (const [key, slice] of Object.entries(this.tasks)) {
      tasks[key] = slice.toFirestore()
    }
    return {
      general: this.general.toFirestore(),
      tasks,
      updatedAt: this.updatedAt,
    }
  }
}
