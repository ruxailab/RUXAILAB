import { FirestoreCollectionRepository } from '../../core/repositories/FirestoreCollectionRepository.js'

/**
 * Shared access to the `users` collection.
 */
export class FirestoreUserRepository extends FirestoreCollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super('users', db)
  }

  /**
   * @param {string} uid
   * @returns {Promise<number|null>}
   */
  async getAccessLevel(uid) {
    const user = await this.get(uid)
    if (!user || user.accessLevel == null) return null
    return user.accessLevel
  }

  /**
   * @param {string} uid
   * @returns {Promise<boolean>}
   */
  async isSuperAdmin(uid) {
    const accessLevel = await this.getAccessLevel(uid)
    return accessLevel === 0
  }
}
