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
   * @param {string} transcriptionDocId
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
}
