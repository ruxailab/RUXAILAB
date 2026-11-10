import { FirestoreCollectionRepository } from '../../core/repositories/FirestoreCollectionRepository.js'

/**
 * Shared access to the `tests` collection (studies).
 */
export class FirestoreStudyRepository extends FirestoreCollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super('tests', db)
  }

  /**
   * @param {string} answersDocId
   * @returns {Promise<{ id: string } & object | null>}
   */
  async findByAnswersDocId(answersDocId) {
    const querySnap = await this.collectionRef
      .where('answersDocId', '==', answersDocId)
      .limit(1)
      .get()

    if (querySnap.empty) return null

    const doc = querySnap.docs[0]
    return { id: doc.id, ...doc.data() }
  }

  /**
   * List all studies where the given user is the testAdmin.
   *
   * @param {string} adminUid
   * @returns {Promise<Array<{ id: string, answersDocId?: string } & object>>}
   */
  async listByAdmin(adminUid) {
    const querySnap = await this.collectionRef
      .where('testAdmin.userDocId', '==', adminUid)
      .get()

    return querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }
}
