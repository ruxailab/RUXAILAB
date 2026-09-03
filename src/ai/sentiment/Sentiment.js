/**
 * Client model for a per-user/per-task sentiment document.
 */
export default class Sentiment {
  constructor({
    id = null,
    answersDocId = null,
    userDocId = null,
    taskId = null,
    facial = null,
    text = null,
    createdAt = null,
    updatedAt = null,
  } = {}) {
    this.id = id
    this.answersDocId = answersDocId
    this.userDocId = userDocId
    this.taskId = taskId != null ? String(taskId) : null
    this.facial = facial && typeof facial === 'object' ? { ...facial } : null
    this.text = text && typeof text === 'object' ? { ...text } : null
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromFirestore(data = {}, id = null) {
    return new Sentiment({
      id: id ?? data.id ?? null,
      answersDocId: data.answersDocId ?? null,
      userDocId: data.userDocId ?? null,
      taskId: data.taskId ?? null,
      facial: data.facial ?? null,
      text: data.text ?? null,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    })
  }

  toFirestore() {
    return {
      answersDocId: this.answersDocId,
      userDocId: this.userDocId,
      taskId: this.taskId,
      facial: this.facial,
      text: this.text,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
