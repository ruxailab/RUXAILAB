import { FirestoreDocumentRepository } from '../../../core/repositories/FirestoreDocumentRepository.js'
import { SentimentAnalytics } from '../models/SentimentAnalytics.js'

export const SENTIMENT_ANALYTICS_DOC_ID = 'sentiment'

/**
 * Persistence for answers/{answersDocId}/analytics/sentiment.
 *
 * @extends {FirestoreDocumentRepository<SentimentAnalytics>}
 */
export class FirestoreSentimentAnalyticsRepository extends FirestoreDocumentRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   * @param {string} answersDocId
   */
  constructor(db, answersDocId) {
    super(
      `answers/${answersDocId}/analytics/${SENTIMENT_ANALYTICS_DOC_ID}`,
      db,
      (data) => SentimentAnalytics.fromFirestore(data),
      (item) => item.toFirestore(),
    )
  }
}
