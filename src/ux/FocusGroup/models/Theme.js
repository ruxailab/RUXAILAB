/**
 * A theme grouping response excerpts pulled from one or more finished
 * sessions — either authored manually by the facilitator, or suggested by
 * the Tier 1 NLP pipeline (`source: 'nlp'`, from theme clustering). Both
 * kinds are edited identically in `ThematicEditor.vue`'s drag-and-drop
 * board; `source` only changes how it's badged.
 *
 * @param {string} label - Theme name (e.g. "Navigation confusion").
 * @param {Array} responseRefs - [{ sessionId, topicId, messageId, participantId, excerpt }]
 * @param {string[]} [keywords] - Top terms backing an NLP-suggested theme.
 * @param {number} [frequency] - Distinct participants touching this theme.
 * @param {'manual'|'nlp'} [source] - Who authored the theme. Defaults to 'manual'.
 */
export default class Theme {
  constructor({ id, label, responseRefs, keywords, frequency, source } = {}) {
    this.id = id ?? Theme.generateId()
    this.label = label ?? ''
    this.responseRefs = Array.isArray(responseRefs) ? responseRefs : []
    this.keywords = Array.isArray(keywords) ? keywords : []
    this.frequency = Number.isFinite(frequency) ? frequency : 0
    this.source = source === 'nlp' ? 'nlp' : 'manual'
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
      keywords: this.keywords,
      frequency: this.frequency,
      source: this.source,
    }
  }

  static fromFirestore(data = {}) {
    return new Theme(data)
  }
}
