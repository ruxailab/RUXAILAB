/**
 * A facilitator-defined theme grouping response excerpts pulled from one or
 * more finished sessions. Manual structuring only (WP2) — NLP-suggested
 * theming (WP3) is a separate, later concern and would add a `source` field
 * here when it lands.
 *
 * @param {string} label - Theme name (e.g. "Navigation confusion").
 * @param {Array} responseRefs - [{ sessionId, topicId, messageId, participantId, excerpt }]
 */
export default class Theme {
  constructor({ id, label, responseRefs } = {}) {
    this.id = id ?? Theme.generateId()
    this.label = label ?? ''
    this.responseRefs = Array.isArray(responseRefs) ? responseRefs : []
  }

  static generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `theme-${crypto.randomUUID()}`
    }
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(2)
      crypto.getRandomValues(array)
      return `theme-${Date.now()}-${array[0].toString(36)}${array[1].toString(36)}`
    }
    Theme.fallbackIdCounter = (Theme.fallbackIdCounter ?? 0) + 1
    return `theme-${Date.now()}-${Theme.fallbackIdCounter.toString(36)}`
  }

  toFirestore() {
    return {
      id: this.id,
      label: this.label,
      responseRefs: this.responseRefs,
    }
  }

  static fromFirestore(data = {}) {
    return new Theme(data)
  }
}
