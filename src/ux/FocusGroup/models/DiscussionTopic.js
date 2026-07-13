/**
 * A single topic in a Focus Group discussion guide.
 *
 * @param {string} title - Topic heading shown to the facilitator.
 * @param {string[]} prompts - Optional follow-up questions for the topic.
 * @param {number} durationMinutes - Planned time budget for the topic.
 */
export default class DiscussionTopic {
  constructor({ id, title, prompts, durationMinutes } = {}) {
    this.id = id ?? DiscussionTopic.generateId()
    this.title = title ?? ''
    this.prompts = prompts ?? []
    this.durationMinutes = durationMinutes ?? 5
  }

  static generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `topic-${crypto.randomUUID()}`
    }
    const array = new Uint32Array(2)
    crypto.getRandomValues(array)
    return `topic-${Date.now()}-${array[0].toString(36)}${array[1].toString(36)}`
  }

  toFirestore() {
    return {
      id: this.id,
      title: this.title,
      prompts: this.prompts,
      durationMinutes: this.durationMinutes,
    }
  }

  static fromFirestore(data = {}) {
    return new DiscussionTopic(data)
  }
}
