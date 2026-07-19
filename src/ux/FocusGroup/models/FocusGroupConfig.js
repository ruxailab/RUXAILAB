/**
 * Session configuration for a Focus Group study.
 *
 * Holds the capabilities a facilitator selects before starting a session, so two
 * studies can run the same discussion guide with different setups (for example
 * audio only versus audio and video).
 *
 * @param {boolean} enableWaitingRoom - Hold participants before admitting them.
 * @param {boolean} requireConsent - Require consent before joining a session.
 * @param {boolean} hideObservers - Keep observers invisible to participants (backroom).
 * @param {number} maxParticipants - Maximum active participants per session.
 * @param {boolean} allowParticipantChat - Let participants post in the discussion.
 * @param {boolean} recordAudio - Capture session audio.
 * @param {boolean} recordVideo - Capture session video.
 * @param {string} consentText - Rich text shown on the consent screen.
 */
export default class FocusGroupConfig {
  constructor({
    enableWaitingRoom,
    requireConsent,
    hideObservers,
    maxParticipants,
    allowParticipantChat,
    recordAudio,
    recordVideo,
    consentText,
  } = {}) {
    this.enableWaitingRoom = enableWaitingRoom ?? true
    this.requireConsent = requireConsent ?? true
    this.hideObservers = hideObservers ?? true
    this.maxParticipants = maxParticipants ?? 8
    this.allowParticipantChat = allowParticipantChat ?? true
    this.recordAudio = recordAudio ?? false
    this.recordVideo = recordVideo ?? false
    this.consentText = consentText ?? ''
  }

  toFirestore() {
    return {
      enableWaitingRoom: this.enableWaitingRoom,
      requireConsent: this.requireConsent,
      hideObservers: this.hideObservers,
      maxParticipants: this.maxParticipants,
      allowParticipantChat: this.allowParticipantChat,
      recordAudio: this.recordAudio,
      recordVideo: this.recordVideo,
      consentText: this.consentText,
    }
  }

  static fromFirestore(data = {}) {
    return new FocusGroupConfig(data)
  }
}
