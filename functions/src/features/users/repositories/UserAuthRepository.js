/**
 * Adapter for Firebase Authentication user operations.
 */
export class UserAuthRepository {
  /**
   * @param {import('firebase-admin').auth.Auth} auth
   */
  constructor(auth) {
    this.auth = auth
  }

  /**
   * Deletes a user account from Firebase Auth.
   * Catches and ignores 'auth/user-not-found' so that pre-deleted Auth accounts
   * do not interrupt Firestore document and Storage cleanup.
   *
   * @param {string} uid
   * @returns {Promise<void>}
   */
  async deleteUser(uid) {
    if (!this.auth) return
    try {
      await this.auth.deleteUser(uid)
    } catch (authErr) {
      if (authErr?.code !== 'auth/user-not-found') {
        throw authErr
      }
    }
  }
}

