/**
 * A stimulus (image, video, or link) a facilitator can present during a
 * Focus Group session.
 *
 * @param {string} type - 'image' | 'video' | 'url'.
 * @param {string} name - Display name shown in the library and stage.
 * @param {string} url - Download URL (Storage) or the raw link (type 'url').
 * @param {string|null} storagePath - Firebase Storage path, null for 'url' stimuli.
 * @param {string|null} topicId - Optional discussion topic this stimulus is tagged to.
 */
export default class Stimulus {
  constructor({ id, type, name, url, storagePath, topicId, createdAt } = {}) {
    this.id = id ?? Stimulus.generateId()
    this.type = type ?? 'image'
    this.name = name ?? ''
    this.url = url ?? ''
    this.storagePath = storagePath ?? null
    this.topicId = topicId ?? null
    this.createdAt = createdAt ?? Date.now()
  }

  static generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `stimulus-${crypto.randomUUID()}`
    }
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(2)
      crypto.getRandomValues(array)
      return `stimulus-${Date.now()}-${array[0].toString(36)}${array[1].toString(36)}`
    }
    // No Web Crypto available (e.g. the Jest test environment). This id is
    // never security-sensitive, only unique-per-session, so a counter is a
    // fine last resort and avoids reaching for a non-cryptographic PRNG.
    Stimulus.fallbackIdCounter = (Stimulus.fallbackIdCounter ?? 0) + 1
    return `stimulus-${Date.now()}-${Stimulus.fallbackIdCounter.toString(36)}`
  }

  toFirestore() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      url: this.url,
      storagePath: this.storagePath,
      topicId: this.topicId,
      createdAt: this.createdAt,
    }
  }

  static fromFirestore(data = {}) {
    return new Stimulus(data)
  }
}
