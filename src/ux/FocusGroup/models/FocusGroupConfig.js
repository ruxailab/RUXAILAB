/**
 * Session configuration for a Focus Group study.
 *
 * @param {boolean} enableWaitingRoom - Hold participants before admitting them.
 * @param {boolean} requireConsent - Require consent before joining a session.
 * @param {boolean} hideObservers - Keep observers invisible to participants (backroom).
 * @param {number} maxParticipants - Maximum active participants per session.
 */
export default class FocusGroupConfig {
  constructor({
    enableWaitingRoom,
    requireConsent,
    hideObservers,
    maxParticipants,
  } = {}) {
    this.enableWaitingRoom = enableWaitingRoom ?? true
    this.requireConsent = requireConsent ?? true
    this.hideObservers = hideObservers ?? true
    this.maxParticipants = maxParticipants ?? 8
  }

  toFirestore() {
    return {
      enableWaitingRoom: this.enableWaitingRoom,
      requireConsent: this.requireConsent,
      hideObservers: this.hideObservers,
      maxParticipants: this.maxParticipants,
    }
  }

  static fromFirestore(data = {}) {
    return new FocusGroupConfig(data)
  }
}
