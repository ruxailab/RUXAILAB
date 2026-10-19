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

  /**
   * Moves a queued job to processing when it is still the current job.
   * Cancelled and finished jobs are left untouched.
   *
   * @param {string} id
   * @param {string} jobId
   * @param {{ serverTimestamp: Function }} FieldValue
   * @returns {Promise<boolean>}
   */
  async claimProcessing(id, jobId, FieldValue) {
    return this.db.runTransaction(async (transaction) => {
      const ref = this.doc(id)
      const snap = await transaction.get(ref)
      if (!snap.exists) return false

      const data = snap.data() || {}
      if (data.jobId !== jobId) return false
      if (data.status === 'done' || data.status === 'cancelled') return false
      if (data.status === 'processing') return true
      if (data.status !== 'queued') return false

      transaction.update(ref, {
        status: 'processing',
        error: null,
        updatedAt: FieldValue.serverTimestamp(),
      })
      return true
    })
  }

  /**
   * Marks a job cancelled only while it is still queued.
   *
   * @param {string} id
   * @param {{ serverTimestamp: Function }} FieldValue
   * @returns {Promise<boolean>}
   */
  async cancelIfQueued(id, FieldValue) {
    return this.db.runTransaction(async (transaction) => {
      const ref = this.doc(id)
      const snap = await transaction.get(ref)
      if (!snap.exists) return false

      const data = snap.data() || {}
      if (data.status !== 'queued') return false

      transaction.update(ref, {
        status: 'cancelled',
        error: null,
        updatedAt: FieldValue.serverTimestamp(),
      })
      return true
    })
  }
}
