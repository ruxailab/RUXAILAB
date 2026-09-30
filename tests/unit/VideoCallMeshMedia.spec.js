import { shallowMount, flushPromises } from '@vue/test-utils'

jest.mock('vuex', () => ({
  useStore: () => ({ getters: {}, dispatch: async () => {}, commit: () => {} }),
}))
jest.mock('vue-router', () => ({ useRouter: () => ({ push: () => {} }) }))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase/index', () => ({ database: {} }))
jest.mock('firebase/database', () => ({
  ref: () => ({}),
  set: async () => {},
  onValue: () => () => {},
  push: () => ({}),
  get: async () => ({ val: () => null, exists: () => false }),
  onDisconnect: () => ({
    remove: async () => {},
    update: async () => {},
    set: async () => {},
  }),
  remove: async () => {},
  update: async () => {},
  onChildAdded: () => () => {},
}))

const VideoCallMesh =
  require('@/shared/components/videoCall/mesh/VideoCallMesh.vue').default

const track = (kind) => ({ kind, enabled: true, stop: () => {} })
const stream = (...tracks) => ({
  getTracks: () => tracks,
  getVideoTracks: () => tracks.filter((item) => item.kind === 'video'),
  getAudioTracks: () => tracks.filter((item) => item.kind === 'audio'),
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
