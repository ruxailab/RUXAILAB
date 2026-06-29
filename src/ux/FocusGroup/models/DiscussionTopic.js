/**
 * A single topic in a Focus Group discussion guide.
 *
 * @param {string} title - Topic heading shown to the facilitator.
 * @param {string[]} prompts - Optional follow-up questions for the topic.
 * @param {number} durationMinutes - Planned time budget for the topic.
 */
export default class DiscussionTopic {
  constructor({ id, title, prompts, durationMinutes } = {}) {
    this.id = id ?? `topic-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    this.title = title ?? ''
    this.prompts = prompts ?? []
    this.durationMinutes = durationMinutes ?? 5
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
