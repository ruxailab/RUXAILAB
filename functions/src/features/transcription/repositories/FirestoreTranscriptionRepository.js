import { FirestoreCollectionRepository } from '../../../core/repositories/FirestoreCollectionRepository.js'
import { Transcription } from '../models/Transcription.js'

/**
 * Persistence for moderated-task transcription documents.
 *
 * @extends {FirestoreCollectionRepository<Transcription>}
 */
export class FirestoreTranscriptionRepository extends FirestoreCollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super(
      'transcriptions',
      db,
      (data, id) => Transcription.fromFirestore(data, id),
      (item) => item.toFirestore(),
    )
  }
}
