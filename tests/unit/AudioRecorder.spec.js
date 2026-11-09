import { mount, flushPromises } from '@vue/test-utils'
import {
  uploadBytes,
  getDownloadURL,
  ref as storageRef,
} from 'firebase/storage'
import { createMediaRecorder } from '@/ux/UserTest/utils/mediaRecording'

const mockDispatch = jest.fn()

jest.mock('vuex', () => ({
  useStore: () => ({ getters: {}, dispatch: mockDispatch }),
}))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}))
jest.mock('@/app/plugins/firebase', () => ({ storage: {} }))
jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
  showWarning: jest.fn(),
}))
jest.mock('@/shared/utils/screenShareCapture', () => ({
  stopMediaStream: jest.fn(),
}))
jest.mock('@/ux/UserTest/utils/mediaRecording', () => ({
  createMediaRecorder: jest.fn(),
  saveRecordedMedia: jest.fn(),
}))

class FakeMediaStream {
  constructor(tracks = []) {
    this.tracks = tracks
  }
  getAudioTracks() {
    return this.tracks
  }
  getTracks() {
    return this.tracks
  }
}

class FakeMediaRecorder {
  constructor() {
    this.state = 'inactive'
  }
  start() {
    this.state = 'recording'
  }
  stop() {
    this.state = 'inactive'
    this.ondataavailable({ data: { size: 4 } })
    return this.onstop()
  }
}

// The component declares a MediaStream prop type, so the global must exist
// before it is loaded.
global.MediaStream = FakeMediaStream
const AudioRecorder = require('@/shared/components/AudioRecorder.vue').default

beforeEach(() => {
  jest.clearAllMocks()
  storageRef.mockImplementation((storage, path) => ({ path }))
  uploadBytes.mockResolvedValue()
  getDownloadURL.mockResolvedValue('https://example.com/a.webm')
  createMediaRecorder.mockImplementation(() => ({
    state: 'inactive',
    start: jest.fn(),
    stop: jest.fn(),
  }))
  global.MediaRecorder = FakeMediaRecorder
  global.Blob = class {
    constructor(parts, { type }) {
      this.size = 4
      this.type = type
    }
  }
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      enumerateDevices: jest.fn(() =>
        Promise.resolve([{ kind: 'audioinput' }]),
      ),
      getUserMedia: jest.fn(() =>
        Promise.resolve(new FakeMediaStream([{ readyState: 'live' }])),
      ),
    },
  })
})

const mountRecorder = () =>
  mount(AudioRecorder, {
    props: {
      testId: 'test-1',
      taskIndex: 2,
      userDocId: 'user-1',
      shouldRecordModerator: true,
      remoteStream: new FakeMediaStream([{ readyState: 'live' }]),
    },
  })

it('uploads the moderator audio when the recording stops', async () => {
  const wrapper = mountRecorder()

  await wrapper.vm.startAudioRecording()
  wrapper.vm.stopAudioRecording()
  await flushPromises()

  expect(storageRef).toHaveBeenCalledWith(
    expect.anything(),
    expect.stringMatching(
      /^tests\/test-1\/user-1\/task_2_moderator\/\d+\.webm$/,
    ),
  )
  expect(uploadBytes).toHaveBeenCalledTimes(1)
  expect(getDownloadURL).toHaveBeenCalledTimes(1)
  expect(mockDispatch).toHaveBeenCalledWith('updateTaskMediaUrl', {
    taskIndex: 2,
    mediaType: 'moderatorAudioURL',
    url: 'https://example.com/a.webm',
    size: 4,
    userId: 'user-1',
  })
})
