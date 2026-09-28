import FocusGroupConfig from '@/ux/FocusGroup/models/FocusGroupConfig'

describe('FocusGroupConfig', () => {
  it('applies documented defaults when constructed empty', () => {
    const config = new FocusGroupConfig()
    expect(config).toMatchObject({
      enableWaitingRoom: true,
      requireConsent: true,
      hideObservers: true,
      maxParticipants: 8,
      allowParticipantChat: true,
      recordAudio: false,
      recordVideo: false,
      enableVideoCall: false,
      consentText: '',
    })
  })

  it('round-trips through Firestore', () => {
    const config = new FocusGroupConfig({
      enableWaitingRoom: false,
      requireConsent: false,
      hideObservers: false,
      maxParticipants: 6,
      allowParticipantChat: false,
      recordAudio: true,
      recordVideo: true,
      enableVideoCall: true,
      consentText: 'By joining you agree to be recorded.',
    })
    const restored = FocusGroupConfig.fromFirestore(config.toFirestore())

    expect(restored).toMatchObject({
      enableWaitingRoom: false,
      requireConsent: false,
      hideObservers: false,
      maxParticipants: 6,
      allowParticipantChat: false,
      recordAudio: true,
      recordVideo: true,
      enableVideoCall: true,
      consentText: 'By joining you agree to be recorded.',
    })
  })
})
