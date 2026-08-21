import { TranscriptSide } from './TranscriptSide.js'

/**
 * Domain model for a moderated-task transcription document.
 */
export class Transcription {
  /**
   * @param {object} params
   * @param {string|null} [params.id]
   * @param {string} params.answersDocId
   * @param {string} params.userDocId
   * @param {string} params.taskId
   * @param {string} params.provider
   * @param {string} params.model
   * @param {TranscriptSide|object} params.evaluator
   * @param {TranscriptSide|object} params.moderator
   * @param {unknown} [params.createdAt]
   * @param {unknown} [params.updatedAt]
   */
  constructor({
    id = null,
    answersDocId,
    userDocId,
    taskId,
    provider,
    model,
    evaluator,
    moderator,
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id
    this.answersDocId = answersDocId
    this.userDocId = userDocId
    this.taskId = String(taskId)
    this.provider = provider
    this.model = model
    this.evaluator =
      evaluator instanceof TranscriptSide
        ? evaluator
        : TranscriptSide.create(evaluator)
    this.moderator =
      moderator instanceof TranscriptSide
        ? moderator
        : TranscriptSide.create(moderator)
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * @param {object} params
   * @returns {Transcription}
   */
  static create(params) {
    return new Transcription(params)
  }

  /**
   * Hydrate from a Firestore document.
   *
   * @param {object} data
   * @param {string|null} [id]
   * @returns {Transcription}
   */
  static fromFirestore(data, id = null) {
    return Transcription.create({
      id,
      answersDocId: data.answersDocId,
      userDocId: data.userDocId,
      taskId: data.taskId,
      provider: data.provider,
      model: data.model,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      evaluator: TranscriptSide.fromFirestore(data.evaluator),
      moderator: TranscriptSide.fromFirestore(data.moderator),
    })
  }

  /**
   * Persistable Firestore document (without id).
   * @returns {object}
   */
  toFirestore() {
    return {
      answersDocId: this.answersDocId,
      userDocId: this.userDocId,
      taskId: this.taskId,
      provider: this.provider,
      model: this.model,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      evaluator: this.evaluator.toFirestore(),
      moderator: this.moderator.toFirestore(),
    }
  }

  /**
   * Response DTO for the callable client.
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      answersDocId: this.answersDocId,
      userDocId: this.userDocId,
      taskId: this.taskId,
      provider: this.provider,
      model: this.model,
      evaluator: this.evaluator.toJSON(),
      moderator: this.moderator.toJSON(),
    }
  }

  /**
   * @param {string} id
   * @returns {Transcription}
   */
  withId(id) {
    return Transcription.create({
      ...this,
      id,
      evaluator: this.evaluator,
      moderator: this.moderator,
    })
  }
}
