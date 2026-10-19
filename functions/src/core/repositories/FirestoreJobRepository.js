import { FirestoreCollectionRepository } from './FirestoreCollectionRepository.js'

/**
 * Persistence for queued background jobs.
 */
export class FirestoreJobRepository extends FirestoreCollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super('jobs', db)
  }
}
