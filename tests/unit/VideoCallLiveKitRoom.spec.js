import { shallowMount, flushPromises } from '@vue/test-utils'
import { get } from 'firebase/database'

const mockConnect = jest.fn()
const mockOnValue = jest.fn()

jest.mock('vue-router', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('livekit-client', () => ({
  Track: {
    Kind: { Video: 'video', Audio: 'audio' },
    Source: { ScreenShare: 'screen', ScreenShareAudio: 'screen-audio' },
  },
}))
jest.mock('@/app/plugins/firebase/index', () => ({ database: {} }))
jest.mock('firebase/database', () => ({
  ref: (_database, path) => ({ path }),
  get: jest.fn(async () => ({ val: () => false })),
  onValue: (...args) => mockOnValue(...args),
  update: jest.fn(),
  remove: jest.fn(),
}))
jest.mock('@/shared/components/videoCall/composables/useLiveKitRoom', () => ({
  useLiveKitRoom: () => ({
    room: { value: null },
    isConnecting: { value: false },
    connectionError: { value: null },
    callStarted: { value: false },
    isObservator: { value: false },
    isCameraEnabled: { value: true },
    isMicrophoneEnabled: { value: true },
    isSharingScreen: { value: false },
    remoteParticipants: { value: [] },
    screenShareFeeds: { value: [] },
    localVideoElement: { value: null },
    connect: mockConnect,
    disconnect: jest.fn(),
    toggleCamera: jest.fn(),
    toggleMicrophone: jest.fn(),
    toggleScreenShare: jest.fn(),
    setRemoteVideoElement: jest.fn(),
    setScreenShareVideoElement: jest.fn(),
  }),
}))
jest.mock(
  '@/shared/components/videoCall/composables/useVideoCallBoard',
  () => ({
    useVideoCallBoard: () => ({
      tiles: { value: [] },
      focusedTile: { value: null },
      otherTiles: { value: [] },
      isFocusMode: { value: false },
      showWaitingMessage: { value: false },
      tileCols: { value: 12 },
      participantsList: { value: [] },
    }),
  }),
)

const VideoCallLiveKit =
  require('@/shared/components/videoCall/livekit/VideoCallLiveKit.vue').default

it('connects the facilitator when the room-open flag changes to true', async () => {
  let roomOpenListener
  mockConnect.mockClear()
  get.mockResolvedValue({ val: () => false })
  mockOnValue.mockImplementation((_reference, listener) => {
    roomOpenListener = listener
    return jest.fn()
  })

  const wrapper = shallowMount(VideoCallLiveKit, {
    props: {
      roomId: 'study-1',
      isModerator: true,
      user: { id: 'facilitator-1', email: 'facilitator@example.test' },
      test: { id: 'study-1', testStructure: {} },
    },
  })
  await flushPromises()

  expect(mockConnect).not.toHaveBeenCalled()

  roomOpenListener({ val: () => true })
  await flushPromises()

  expect(mockConnect).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})
