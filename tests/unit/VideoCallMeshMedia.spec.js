import { shallowMount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { useVideoCallBoard } from '@/shared/components/videoCall/composables/useVideoCallBoard'

jest.mock('vuex', () => ({
  useStore: () => ({ getters: {}, dispatch: async () => {}, commit: () => {} }),
}))
jest.mock('vue-router', () => ({ useRouter: () => ({ push: () => {} }) }))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase/index', () => ({ database: {} }))
const mockUpdates = []
const mockOnValueListeners = []
jest.mock('firebase/database', () => ({
  ref: (_database, path) => ({ path }),
  set: async () => {},
  onValue: (target, callback) => {
    mockOnValueListeners.push({ path: target?.path, callback })
    return jest.fn()
  },
  push: () => ({}),
  get: async () => ({ val: () => null, exists: () => false }),
  onDisconnect: () => ({
    remove: async () => {},
    update: async () => {},
    set: async () => {},
  }),
  remove: async () => {},
  update: async (target, value) => {
    mockUpdates.push({ path: target?.path, value })
  },
  onChildAdded: () => () => {},
}))

const VideoCallMesh =
  require('@/shared/components/videoCall/mesh/VideoCallMesh.vue').default
const VideoCallControlBar =
  require('@/shared/components/videoCall/VideoCallControlBar.vue').default

const track = (kind) => ({ kind, enabled: true, stop: () => {} })
const stream = (...tracks) => ({
  getTracks: () => tracks,
  getVideoTracks: () => tracks.filter((item) => item.kind === 'video'),
  getAudioTracks: () => tracks.filter((item) => item.kind === 'audio'),
})

it('keeps the participant self-camera tile visible after the call starts', () => {
  const localStream = ref(stream(track('video'), track('audio')))
  const board = useVideoCallBoard({
    t: (key) => key,
    isObservator: ref(false),
    callStarted: ref(true),
    isCameraEnabled: ref(true),
    isMicrophoneEnabled: ref(true),
    user: ref({
      id: 'participant-1',
      email: 'participant@example.test',
      accessLevel: 5,
    }),
    localStream,
    remoteEntries: ref([]),
    screenShareFeeds: ref([]),
    staffParticipants: ref([]),
    buildRemoteTile: (remote) => remote,
    buildParticipantItem: (remote) => remote,
  })

  expect(board.tiles.value).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: 'local-camera',
        kind: 'local',
        stream: localStream.value,
      }),
    ]),
  )
})

let wrapper
beforeEach(() => {
  window.HTMLMediaElement.prototype.play = () => Promise.resolve()
})
afterEach(() => wrapper?.unmount())

it('keeps the microphone when the camera cannot be opened', async () => {
  const getUserMedia = jest.fn(async (constraints) => {
    if (constraints.video) {
      throw Object.assign(new Error('busy'), { name: 'NotReadableError' })
    }
    return stream(track('audio'))
  })
  Object.defineProperty(global.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  })
  jest.spyOn(console, 'error').mockImplementation(() => {})

  wrapper = shallowMount(VideoCallMesh, {
    props: {
      roomId: 'room-1',
      isModerator: true,
      user: { id: 'moderator', email: 'moderator@example.test' },
      test: { id: 'study-1', testStructure: { userTasks: [] } },
    },
    global: { mocks: { $t: (key) => key } },
  })
  await flushPromises()

  expect(getUserMedia).toHaveBeenLastCalledWith({ audio: true })
  expect(wrapper.vm.isCameraEnabled).toBe(false)
  expect(wrapper.vm.isMicrophoneEnabled).toBe(true)

  wrapper.vm.toggleMicrophone()
  expect(wrapper.vm.isMicrophoneEnabled).toBe(false)
})

it('turns the camera on after it failed at join, and releases it when off', async () => {
  let cameraBusy = true
  const cameraTrack = { ...track('video'), stop: jest.fn() }
  const getUserMedia = jest.fn(async (constraints) => {
    if (constraints.video && cameraBusy) {
      throw Object.assign(new Error('busy'), { name: 'NotReadableError' })
    }
    return constraints.video ? stream(cameraTrack) : stream(track('audio'))
  })
  Object.defineProperty(global.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  })
  jest.spyOn(console, 'error').mockImplementation(() => {})
  const audioOnly = stream(track('audio'))
  audioOnly.addTrack = jest.fn((item) => audioOnly.getTracks().push(item))
  audioOnly.removeTrack = jest.fn((item) =>
    audioOnly.getTracks().splice(audioOnly.getTracks().indexOf(item), 1),
  )
  const replaceTrack = jest.fn(async () => {})
  const addTransceiver = jest.fn(() => ({ sender: { replaceTrack } }))
  global.RTCPeerConnection = class {
    addTrack() {
      return { replaceTrack: jest.fn() }
    }
    addTransceiver(...args) {
      return addTransceiver(...args)
    }
    close() {}
  }
  getUserMedia.mockImplementationOnce(async () => {
    throw Object.assign(new Error('busy'), { name: 'NotReadableError' })
  })
  getUserMedia.mockImplementationOnce(async () => audioOnly)

  wrapper = shallowMount(VideoCallMesh, {
    props: {
      roomId: 'room-1',
      isModerator: true,
      user: { id: 'moderator', email: 'moderator@example.test' },
      test: { id: 'study-1', testStructure: { userTasks: [] } },
    },
    global: { mocks: { $t: (key) => key } },
  })
  await flushPromises()
  expect(wrapper.vm.isCameraEnabled).toBe(false)

  wrapper.vm.createPeerConnection('participant', true)
  expect(addTransceiver).toHaveBeenCalledWith('video', {
    direction: 'sendrecv',
    streams: [audioOnly],
  })

  cameraBusy = false
  await wrapper.vm.toggleCamera()
  expect(getUserMedia).toHaveBeenLastCalledWith({ video: true })
  expect(audioOnly.addTrack).toHaveBeenCalledWith(cameraTrack)
  expect(replaceTrack).toHaveBeenLastCalledWith(cameraTrack)
  expect(wrapper.vm.isCameraEnabled).toBe(true)

  await wrapper.vm.toggleCamera()
  expect(cameraTrack.stop).toHaveBeenCalled()
  expect(replaceTrack).toHaveBeenLastCalledWith(null)
  expect(wrapper.vm.isCameraEnabled).toBe(false)
})

it('publishes the moderator camera state where other peers read it', async () => {
  const cameraTrack = { ...track('video'), stop: jest.fn() }
  const joined = stream(track('audio'), cameraTrack)
  joined.removeTrack = jest.fn()
  Object.defineProperty(global.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: async () => joined },
  })
  mockUpdates.length = 0

  wrapper = shallowMount(VideoCallMesh, {
    props: {
      roomId: 'room-1',
      isModerator: true,
      user: { id: 'moderator', email: 'moderator@example.test' },
      test: { id: 'study-1', testStructure: { userTasks: [] } },
    },
    global: { mocks: { $t: (key) => key } },
  })
  await flushPromises()
  await wrapper.vm.toggleCamera()

  const status = mockUpdates.filter((item) => item.value?.media).pop()
  expect(status.path).toBe('calls/room-1/staff/moderator')
  expect(status.value.media.cameraEnabled).toBe(false)
})

it('updates the facilitator call state when the shared room flag opens', async () => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: async () => stream(track('audio')) },
  })
  mockOnValueListeners.length = 0

  wrapper = shallowMount(VideoCallMesh, {
    props: {
      roomId: 'room-1',
      isModerator: true,
      user: { id: 'moderator', email: 'moderator@example.test' },
      test: { id: 'study-1', testStructure: { userTasks: [] } },
    },
    global: { mocks: { $t: (key) => key } },
  })
  await flushPromises()

  const roomListener = mockOnValueListeners.find(
    ({ path }) => path === 'rooms/room-1/showVideoCall',
  )
  expect(roomListener).toBeDefined()
  expect(wrapper.findComponent(VideoCallControlBar).props('callStarted')).toBe(
    false,
  )

  roomListener.callback({ val: () => true })
  await flushPromises()

  expect(wrapper.findComponent(VideoCallControlBar).props('callStarted')).toBe(
    true,
  )
})

it('sends the participant back to their current task, not task 1', async () => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: async () => stream(track('audio')) },
  })
  wrapper = shallowMount(VideoCallMesh, {
    props: {
      roomId: 'room-1',
      isModerator: true,
      currentGlobalIndex: 4,
      currentTaskIndex: 3,
      user: { id: 'moderator', email: 'moderator@example.test' },
      test: {
        id: 'study-1',
        testStructure: { userTasks: [{}, {}, {}, { taskName: 'SUS' }] },
      },
    },
    global: { mocks: { $t: (key) => key } },
  })
  await flushPromises()

  wrapper.vm.goToStep('tasks')

  expect(wrapper.emitted('stepSelected').pop()).toEqual([
    { globalIndex: 4, taskIndex: 3, stepType: 'tasks' },
  ])
  expect(wrapper.vm.taskDropdownItems[3].title).toBe('Task 4: SUS')
})
