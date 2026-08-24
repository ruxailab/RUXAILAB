import { FirestoreDocumentRepository } from '../../../core/repositories/FirestoreDocumentRepository.js'
import { TranscriptionAnalytics } from '../models/TranscriptionAnalytics.js'

export const TRANSCRIPTION_ANALYTICS_DOC_ID = 'transcription'

/**
 * Persistence for answers/{answersDocId}/analytics/transcription.
 *
 * @extends {FirestoreDocumentRepository<TranscriptionAnalytics>}
 */
export class FirestoreTranscriptionAnalyticsRepository extends FirestoreDocumentRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   * @param {string} answersDocId
   * @param {string} [docId]
   */
  constructor(db, answersDocId) {
    super(
      `answers/${answersDocId}/analytics/${TRANSCRIPTION_ANALYTICS_DOC_ID}`,
      db,
      (data) => TranscriptionAnalytics.fromFirestore(data),
      (item) => item.toFirestore(),
    )
  }
}
