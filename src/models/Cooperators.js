/**
 * Represents the cooperators model.
 */
export default class Cooperators {
  /**
   * @param {Partial<Cooperators>} partial
   */
  constructor({
    userDocId,
    userName,
    userEmail,
    accessLevel,
    invited,
    accepted,
    progress,
    answerStatus,
    updateDate,
  } = {}) {
    /**
     * Defines the user document id.
     *
     * @type {string}
     */
    this.userDocId = userDocId

    /**
     * Defines the user name.
     *
     * @type {string}
     */
    this.userName = userName

    /**
     * Defines the user email.
     *
     * @type {string}
     */
    this.userEmail = userEmail

    /**
     * Defines the cooperator access level.
     *
     * @type {number}
     */
    this.accessLevel = accessLevel

    /**
     * Defines whether the cooperator was invited.
     *
     * @type {boolean}
     */
    this.invited = invited

    /**
     * Defines whether the cooperator was accepted.
     *
     * @type {boolean}
     */
    this.accepted = accepted

    /**
     * Defines the cooperator progress.
     *
     * @type {number}
     */
    this.progress = progress

    /**
     * Defines the answer status.
     *
     * @type {string}
     */
    this.answerStatus = answerStatus

    /**
     * Defines a timestamp of the cooperator last updated date.
     *
     * @type {number}
     */
    this.updateDate = updateDate
  }

  /**
   * Creates a new cooperators model from the given map.
   * @param {Partial<Cooperators>} map the map to be converted.
   * @returns a new cooperators model.
   */
  static toCooperators(map) {
    return new Cooperators(map)
  }
}
