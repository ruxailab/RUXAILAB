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
   * Persist facial sentiment emotions on a task answer.
   *
   * @param {string} answersDocId
   * @param {string} userDocId
   * @param {string} taskId
   * @param {Record<string, number>|null} facialSentimentResults
   * @returns {Promise<void>}
   */
  async setFacialSentimentResults(
    answersDocId,
    userDocId,
    taskId,
    facialSentimentResults,
  ) {
    await this.update(answersDocId, {
      [`taskAnswers.${userDocId}.tasks.${taskId}.facialSentimentResults`]:
        facialSentimentResults,
    })
  }
}
