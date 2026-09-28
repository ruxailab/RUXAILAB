const EMOTION_KEYS = [
  'Happy',
  'Sad',
  'Angry',
  'Surprised',
  'Neutral',
  'Disgusted',
  'Fearful',
]

/**
 * Normalize API / Firestore emotion payloads to PascalCase keys used by the UI.
 *
 * @param {object} [data]
 * @returns {Record<string, number>}
 */
function normalizeEmotions(data = {}) {
  const source = data && typeof data === 'object' ? data : {}
  const camelToPascal = {
    happy: 'Happy',
    sad: 'Sad',
    angry: 'Angry',
    surprised: 'Surprised',
    neutral: 'Neutral',
    disgusted: 'Disgusted',
    fearful: 'Fearful',
  }

  const result = {}
  for (const key of EMOTION_KEYS) {
    const camel = key.charAt(0).toLowerCase() + key.slice(1)
    const value = source[key] ?? source[camel] ?? source[camelToPascal[camel]]
    result[key] = Number(value) || 0
  }
  return result
}

/**
 * Emotion intensity map returned by the facial sentiment API.
 */
export class FacialEmotions {
  /**
   * @param {object} [params]
   * @param {number} [params.Happy]
   * @param {number} [params.Sad]
   * @param {number} [params.Angry]
   * @param {number} [params.Surprised]
   * @param {number} [params.Neutral]
   * @param {number} [params.Disgusted]
   * @param {number} [params.Fearful]
   */
  constructor(params = {}) {
    const normalized = normalizeEmotions(params)
    this.Happy = normalized.Happy
    this.Sad = normalized.Sad
    this.Angry = normalized.Angry
    this.Surprised = normalized.Surprised
    this.Neutral = normalized.Neutral
    this.Disgusted = normalized.Disgusted
    this.Fearful = normalized.Fearful
  }

  /**
   * @param {object} [params]
   * @returns {FacialEmotions}
   */
  static create(params = {}) {
    return new FacialEmotions(params)
  }

  /**
   * @param {object} [data]
   * @returns {FacialEmotions}
   */
  static fromFirestore(data = {}) {
    return FacialEmotions.create(data)
  }

  /**
   * @param {object} [data]
   * @returns {FacialEmotions}
   */
  static fromApi(data = {}) {
    return FacialEmotions.create(data)
  }

  /**
   * @returns {Record<string, number>}
   */
  toFirestore() {
    return {
      Happy: this.Happy,
      Sad: this.Sad,
      Angry: this.Angry,
      Surprised: this.Surprised,
      Neutral: this.Neutral,
      Disgusted: this.Disgusted,
      Fearful: this.Fearful,
    }
  }

  /**
   * @returns {Record<string, number>}
   */
  toJSON() {
    return this.toFirestore()
  }
}
