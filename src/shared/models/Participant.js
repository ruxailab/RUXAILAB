/**
 * Represents the Participant model.
 */
export default class Participant {
  constructor({
    userDocId,
    email,
    accessLevel,
    updateDate,
    testAuthorEmail,
    token,
    inviteMessage,
    acceptedDate,
    rejectedDate,
    expirationDate,
    status,
  } = {}) {
    /**
     * Defines the user document id.
     *
     * @type {string}
     */
    this.userDocId = userDocId

    /**
     * Defines the user email.
     *
     * @type {string}
     */
    this.email = email

    /**
     * Defines the participant access level.
     *
     * @type {number}
     */
    this.accessLevel = accessLevel

    /**
     * Defines a timestamp of the participant last updated date.
     *
     * @type {number}
     */
    this.updateDate = updateDate

    /**
     * Defines the study author's email.
     *
     * @type {string}
     */
    this.testAuthorEmail = testAuthorEmail

    /**
     * Defines the invitation token.
     *
     * @type {string}
     */
    this.token = token

    /**
     * Defines the invitation message.
     *
     * @type {string}
     */
    this.inviteMessage = inviteMessage

    /**
     * Defines the accepted date.
     *
     * @type {number}
     */
    this.acceptedDate = acceptedDate

    /**
     * Defines the reject date.
     *
     * @type {number}
     */
    this.rejectedDate = rejectedDate

    /**
     * Defines the expiration date.
     *
     * @type {number}
     */
    this.expirationDate = expirationDate

    /**
     * Defines status
     *
     * @type {string}
     */
    this.status = status
  }

  /**
   * Creates a new Participant model from the given map.
   *
   * @param {Partial<Participant>} map the map to be converted.
   * @returns a new Participant model.
   */
  static toParticipant(map) {
    return new Participant(map)
  }

  /**
   * Creates a Firestore map from the current model.
   *
   * @returns a map that represents the current model.
   */
  toFirestore() {
    return {
      userDocId: this.userDocId ?? null,
      email: this.email ?? null,
      accessLevel: this.accessLevel ?? null,
      updateDate: this.updateDate ?? null,
      testAuthorEmail: this.testAuthorEmail ?? null,
      token: this.token ?? null,
      inviteMessage: this.inviteMessage ?? null,
      acceptedDate: this.acceptedDate ?? null,
      rejectedDate: this.rejectedDate ?? null,
      expirationDate: this.expirationDate ?? null,
      status: this.status ?? 'pending',
    }
  }
}
