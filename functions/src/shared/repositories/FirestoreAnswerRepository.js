import { FirestoreCollectionRepository } from '../../core/repositories/FirestoreCollectionRepository.js'

/**
 * Shared access to the `answers` collection.
 */
export class FirestoreAnswerRepository extends FirestoreCollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super('answers', db)
  }

  /**
   * @param {string} answersDocId
   * @param {string} userDocId
   * @param {string} taskId
   * @param {string|null} transcriptionDocId
   * @returns {Promise<void>}
   */
  async setTranscriptionDocId(
    answersDocId,
    userDocId,
    taskId,
    transcriptionDocId,
  ) {
    await this.update(answersDocId, {
      [`taskAnswers.${userDocId}.tasks.${taskId}.transcriptionDocId`]:
        transcriptionDocId,
    })
  }

  /**
   * Pointer to the sentiment document for a task answer (facial + text).
   *
   * @param {string} answersDocId
   * @param {string} userDocId
   * @param {string} taskId
   * @param {string|null} sentimentDocId
   * @returns {Promise<void>}
   */
  async setSentimentDocId(answersDocId, userDocId, taskId, sentimentDocId) {
    await this.update(answersDocId, {
      [`taskAnswers.${userDocId}.tasks.${taskId}.sentimentDocId`]:
        sentimentDocId,
    })
  }
}
