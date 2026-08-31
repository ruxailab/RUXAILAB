/**
 * Positive / Neutral / Negative bucket stored on a sentiment document as text.
 */
export class TextSentimentResults {
  /**
   * @param {object} [params]
   * @param {number} [params.Positive]
   * @param {number} [params.Neutral]
   * @param {number} [params.Negative]
   * @param {number} [params.sampleCount]
   */
  constructor({
    Positive = 0,
    Neutral = 0,
    Negative = 0,
    sampleCount = 0,
  } = {}) {
    this.Positive = Number(Positive) || 0
    this.Neutral = Number(Neutral) || 0
    this.Negative = Number(Negative) || 0
    this.sampleCount = Number(sampleCount) || 0
  }

  /**
   * @param {object} [params]
   * @returns {TextSentimentResults}
   */
  static create(params = {}) {
    return new TextSentimentResults(params)
  }

  /**
   * @param {object} [data]
   * @returns {TextSentimentResults}
   */
  static fromFirestore(data = {}) {
    return TextSentimentResults.create(data)
  }

  /**
   * @returns {{ Positive: number, Neutral: number, Negative: number, sampleCount: number }}
   */
  toFirestore() {
    return {
      Positive: this.Positive,
      Neutral: this.Neutral,
      Negative: this.Negative,
      sampleCount: this.sampleCount,
    }
  }

  /**
   * @returns {{ Positive: number, Neutral: number, Negative: number, sampleCount: number }}
   */
  toJSON() {
    return this.toFirestore()
  }
}
