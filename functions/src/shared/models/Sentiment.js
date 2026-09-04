/**
 * Domain model for a per-user/per-task sentiment document.
 * Holds both facial and text signals in one Firestore document.
 */
export class Sentiment {
  /**
   * @param {object} params
   * @param {string|null} [params.id]
   * @param {string} params.answersDocId
   * @param {string} params.userDocId
   * @param {string|number} params.taskId
   * @param {object|null} [params.facial]
   * @param {object|null} [params.text]
   * @param {unknown} [params.createdAt]
   * @param {unknown} [params.updatedAt]
   */
  constructor({
    id = null,
    answersDocId,
    userDocId,
    taskId,
    facial = null,
    text = null,
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id
    this.answersDocId = answersDocId
    this.userDocId = userDocId
    this.taskId = String(taskId)
    this.facial =
      facial && typeof facial === 'object' ? { ...facial } : null
    this.text = text && typeof text === 'object' ? { ...text } : null
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * @param {object} params
   * @returns {Sentiment}
   */
  static create(params) {
    return new Sentiment(params)
  }

  /**
   * @param {object} data
   * @param {string|null} [id]
   * @returns {Sentiment}
   */
  static fromFirestore(data = {}, id = null) {
    return Sentiment.create({
      id: id ?? data.id ?? null,
      answersDocId: data.answersDocId,
      userDocId: data.userDocId,
      taskId: data.taskId,
      facial: data.facial ?? null,
      text: data.text ?? null,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    })
  }

  /**
   * @param {string} id
   * @returns {Sentiment}
   */
  withId(id) {
    return Sentiment.create({
      ...this.toJSON(),
      id,
    })
  }

  /**
   * @param {object|null} facial
   * @param {unknown} updatedAt
   * @returns {Sentiment}
   */
  withFacial(facial, updatedAt = this.updatedAt) {
    return Sentiment.create({
      ...this.toJSON(),
      facial,
      updatedAt,
    })
  }

  /**
   * @param {object|null} text
   * @param {unknown} updatedAt
   * @returns {Sentiment}
   */
  withText(text, updatedAt = this.updatedAt) {
    return Sentiment.create({
      ...this.toJSON(),
      text,
      updatedAt,
    })
  }

  /**
   * @returns {object}
   */
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

  /**
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      ...this.toFirestore(),
    }
  }
}
