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
    return `stimulus-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
