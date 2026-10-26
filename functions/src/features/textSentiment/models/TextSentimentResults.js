/**
 * Positive / Neutral / Negative bucket + utterance regions
 * stored on a sentiment document as text.
 */
export class TextSentimentResults {
  /**
   * @param {object} [params]
   * @param {number} [params.Positive]
   * @param {number} [params.Neutral]
   * @param {number} [params.Negative]
   * @param {number} [params.sampleCount]
   * @param {number} [params.regionsCount]
   * @param {Array<object>} [params.regions]
   */
  constructor({
    Positive = 0,
    Neutral = 0,
    Negative = 0,
    sampleCount = 0,
    regionsCount = 0,
    regions = [],
  } = {}) {
    this.Positive = Number(Positive) || 0
    this.Neutral = Number(Neutral) || 0
    this.Negative = Number(Negative) || 0
    this.sampleCount = Number(sampleCount) || 0
    this.regions = Array.isArray(regions) ? regions.map(normalizeRegion) : []
    this.regionsCount =
      Number(regionsCount) || this.regions.length || 0
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
   * @returns {object}
   */
  toFirestore() {
    return {
      Positive: this.Positive,
      Neutral: this.Neutral,
      Negative: this.Negative,
      sampleCount: this.sampleCount,
      regionsCount: this.regionsCount,
      regions: this.regions,
    }
  }

  /**
   * @returns {object}
   */
  toJSON() {
    return this.toFirestore()
  }
}

/**
 * @param {object} region
 * @returns {{
 *   idx: number,
 *   start: number,
 *   end: number,
 *   transcript: string,
 *   sentiment: string,
 *   confidence: number,
 * }}
 */
function normalizeRegion(region = {}) {
  return {
    idx: Number(region.idx) || 0,
    start: Number(region.start) || 0,
    end: Number(region.end) || 0,
    transcript: region.transcript != null ? String(region.transcript) : '',
    sentiment: region.sentiment != null ? String(region.sentiment) : '',
    confidence: Number(region.confidence) || 0,
  }
}
