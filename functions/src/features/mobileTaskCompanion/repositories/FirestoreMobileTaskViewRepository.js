import { FirestoreSubcollectionRepository } from '../../../core/repositories/FirestoreSubcollectionRepository.js'

/**
 * Public phone projection at tests/{studyId}/mobileTaskViews/{token}.
 * The document id is the pairing token, so the phone can listen without
 * auth. Writes only happen inside companion transactions.
 *
 * @extends {FirestoreSubcollectionRepository<object>}
 */
export class FirestoreMobileTaskViewRepository extends FirestoreSubcollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super(
      'tests',
      'mobileTaskViews',
      db,
      (data, id) => ({ id, ...(data || {}) }),
      (item) => item,
    )
  }

  /**
   * @param {FirebaseFirestore.Transaction} tx
   * @param {{ studyId?: string, token?: string, payload?: object, delete?: boolean }|null|undefined} view
   */
  applyInTransaction(tx, view) {
    if (!view?.studyId || !view.token) return
    const ref = this.doc(view.studyId, view.token)
    if (view.delete) {
      tx.delete(ref)
      return
    }
    if (view.payload) tx.set(ref, view.payload)
  }
}
