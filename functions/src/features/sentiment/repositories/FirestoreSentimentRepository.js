import { FirestoreCollectionRepository } from '../../../core/repositories/FirestoreCollectionRepository.js'
import { Sentiment } from '../models/Sentiment.js'

/**
 * Persistence for per-user/per-task sentiment documents.
 *
 * @extends {FirestoreCollectionRepository<Sentiment>}
 */
export class FirestoreSentimentRepository extends FirestoreCollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super(
      'sentiment',
      db,
      (data, id) => Sentiment.fromFirestore(data, id),
      (item) => item.toFirestore(),
    )
  }

  /**
   * @param {string} answersDocId
   * @returns {Promise<Sentiment[]>}
   */
  async listByAnswersDocId(answersDocId) {
    const snap = await this.collectionRef
      .where('answersDocId', '==', answersDocId)
      .get()

    return snap.docs.map((docSnap) => this.fromFirestore(docSnap.data(), docSnap.id))
  }
}
