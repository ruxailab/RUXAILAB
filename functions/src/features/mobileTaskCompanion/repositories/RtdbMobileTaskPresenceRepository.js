import { RtdbCollectionRepository } from '../../../core/repositories/RtdbCollectionRepository.js'

/**
 * Phone presence at mobileTaskPresence/{token}.
 * The phone writes this node; Functions only remove it when the session ends.
 *
 * @extends {RtdbCollectionRepository<object>}
 */
export class RtdbMobileTaskPresenceRepository extends RtdbCollectionRepository {
  /**
   * @param {{ ref: Function }|null} [rtdb]
   */
  constructor(rtdb = null) {
    super('mobileTaskPresence', rtdb)
  }

  /**
   * @param {string|null|undefined} token
   * @returns {Promise<void>}
   */
  remove(token) {
    return this.delete(token)
  }
}
