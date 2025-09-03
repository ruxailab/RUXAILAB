/**
 * Represents a study admin.
 */
export default class StudyAdmin {
  /**
   * @param {Partial<StudyAdmin>} partial
   */
  constructor({ email, userDocId } = {}) {
    /**
     * Defines the admin email.
     *
     * @type {string}
     */
    this.email = email

    /**
     * Defines the admin document id.
     *
     * @type {string}
     */
    this.userDocId = userDocId
  }

  /**
   * Creates a Firestore map from the current model.
   *
   * @returns a map that represents the current model.
   */
  toFirestore() {
    return {
      email: this.email,
      userDocId: this.userDocId,
    }
  }
}
