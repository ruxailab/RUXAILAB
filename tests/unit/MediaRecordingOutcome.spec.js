import { shallowMount, flushPromises } from '@vue/test-utils'
import {
  uploadBytes,
  getDownloadURL,
  ref as storageRef,
} from 'firebase/storage'
import { startScreenShareStream } from '@/shared/utils/screenShareCapture'

const mockStore = { getters: {}, dispatch: jest.fn() }
jest.mock('vuex', () => ({ useStore: () => mockStore }))
jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/app/plugins/firebase', () => ({ storage: {} }))
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}))
jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
  showWarning: jest.fn(),
}))
jest.mock('@/shared/utils/screenShareCapture', () => ({
  ...jest.requireActual('@/shared/utils/screenShareCapture'),
  startScreenShareStream: jest.fn(),
}))

global.MediaStream = class MediaStream {}
const AudioRecorder =
  require('@/ux/UserTest/components/AudioRecorder.vue').default
const VideoRecorder =
  require('@/ux/UserTest/components/VideoRecorder.vue').default
const ScreenRecorder =
  require('@/ux/UserTest/components/ScreenRecorder.vue').default

const cases = [
  ['audio', AudioRecorder, 'startAudioRecording', 'stopAudioRecording'],
  ['webcam', VideoRecorder, 'startRecording', 'stopRecording'],
  ['screen', ScreenRecorder, 'captureScreen', 'stopRecording'],
]
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

describe.each(cases)(
  '%s recorder outcome',
  (mediaType, Component, start, stop) => {
    let wrapper, stream, track, recorders
    beforeEach(() => {
      track = { stop: jest.fn() }
      stream = { getTracks: () => [track], getVideoTracks: () => [track] }
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          enumerateDevices: jest
            .fn()
            .mockResolvedValue([
              { kind: 'audioinput' },
              { kind: 'videoinput' },
            ]),
          getUserMedia: jest.fn().mockResolvedValue(stream),
        },
      })
      recorders = []
      global.MediaRecorder = jest.fn().mockImplementation(() => {
        const recorder = {
          state: 'inactive',
          start: jest.fn(() => {
            recorder.state = 'recording'
          }),
          stop: jest.fn(() => {
            recorder.state = 'inactive'
            return recorder.onstop?.()
          }),
        }
        recorders.push(recorder)
        return recorder
      })
      startScreenShareStream.mockResolvedValue({ ok: true, stream })
      mockStore.getters = { currentUserTestAnswer: { tasks: [{}] } }
      mockStore.dispatch.mockResolvedValue()
      storageRef.mockImplementation((_storage, path) => ({ path }))
      uploadBytes.mockResolvedValue()
      getDownloadURL.mockResolvedValue('https://private-media.example/token')
      wrapper = shallowMount(Component, {
        props: { taskIndex: 0, testId: 'study-1', userDocId: 'private-user' },
      })
    })
    afterEach(() => wrapper.unmount())
    const results = () =>
      wrapper.emitted('recording-result')?.map(([result]) => result) || []
    const data = () =>
      recorders[0].ondataavailable({ data: new Blob(['private recording']) })

    it('emits one upload result only after upload and the reference update, with the original task context', async () => {
      const upload = deferred()
      const referenceSave = deferred()
      uploadBytes.mockReturnValue(upload.promise)
      mockStore.dispatch.mockReturnValue(referenceSave.promise)
      await wrapper.vm[start]()
      data()
      await wrapper.setProps({ taskIndex: 4, userDocId: 'another-user' })
      wrapper.vm[stop]()
      await flushPromises()
      expect(results()).toEqual([])
      upload.resolve()
      await flushPromises()
      expect(results()).toEqual([])
      referenceSave.resolve()
      await flushPromises()
      await recorders[0].onstop()
      expect(results()).toEqual([
        { taskRef: 'task:0', mediaType, outcome: 'completed', stage: 'upload' },
      ])
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        'updateTaskMediaUrl',
        expect.objectContaining({ taskIndex: 0, userId: 'private-user' }),
      )
      expect(storageRef.mock.calls[0][1]).toContain('/private-user/task_0')
      expect(JSON.stringify(results())).not.toMatch(/private|https|token|url/i)
      expect(track.stop).toHaveBeenCalled()
      expect(wrapper.emitted('showLoading')).toHaveLength(1)
      expect(wrapper.emitted('stopShowLoading')).toHaveLength(1)
    })

    it('reports permission refusal without creating a recorder, then allows a genuine retry', async () => {
      if (mediaType === 'screen')
        startScreenShareStream.mockResolvedValueOnce({
          ok: false,
          reason: 'cancelled',
        })
      else
        navigator.mediaDevices.getUserMedia.mockRejectedValueOnce({
          name: 'NotAllowedError',
          message: 'private error',
        })
      await wrapper.vm[start]()
      expect(results()).toEqual([
        {
          taskRef: 'task:0',
          mediaType,
          outcome: mediaType === 'screen' ? 'cancelled' : 'permission_denied',
          stage: 'permission',
          reason: mediaType === 'screen' ? 'cancelled' : 'permissionDenied',
        },
      ])
      expect(MediaRecorder).not.toHaveBeenCalled()
      await wrapper.vm[start]()
      data()
      wrapper.vm[stop]()
      await flushPromises()
      expect(results()).toHaveLength(2)
      expect(results()[1].outcome).toBe('completed')
    })

    it('reports an unavailable device or capture API', async () => {
      if (mediaType === 'screen')
        startScreenShareStream.mockResolvedValueOnce({
          ok: false,
          reason: 'unsupported',
        })
      else navigator.mediaDevices.enumerateDevices.mockResolvedValue([])
      await wrapper.vm[start]()
      expect(results()[0]).toMatchObject({
        outcome: 'failed',
        stage: 'permission',
        reason: mediaType === 'screen' ? 'unsupported' : 'deviceUnavailable',
      })
      expect(uploadBytes).not.toHaveBeenCalled()
    })

    it('contains capture construction errors and releases the acquired stream', async () => {
      MediaRecorder.mockImplementationOnce(() => {
        throw new Error('private device details')
      })
      await wrapper.vm[start]()
      expect(results()[0]).toMatchObject({
        outcome: 'failed',
        stage: 'capture',
        reason: 'captureError',
      })
      expect(track.stop).toHaveBeenCalled()
      expect(uploadBytes).not.toHaveBeenCalled()
    })

    it('does not upload or complete after a recorder error, even if stop fires repeatedly', async () => {
      await wrapper.vm[start]()
      data()
      recorders[0].onerror({ error: new Error('private error') })
      await recorders[0].onstop()
      await recorders[0].onstop()
      expect(results()).toHaveLength(1)
      expect(results()[0]).toMatchObject({
        outcome: 'failed',
        reason: 'captureError',
      })
      expect(uploadBytes).not.toHaveBeenCalled()
      expect(track.stop).toHaveBeenCalled()
    })

    it('contains recorder startup failures and releases tracks', async () => {
      MediaRecorder.mockImplementationOnce(() => ({
        state: 'inactive',
        start: () => {
          throw new Error('private startup details')
        },
      }))
      await wrapper.vm[start]()
      expect(results()).toEqual([
        {
          taskRef: 'task:0',
          mediaType,
          outcome: 'failed',
          stage: 'capture',
          reason: 'captureError',
        },
      ])
      expect(track.stop).toHaveBeenCalled()
      expect(uploadBytes).not.toHaveBeenCalled()
    })

    it('normalizes capture cancellation without retaining browser error details', async () => {
      if (mediaType === 'screen')
        startScreenShareStream.mockResolvedValueOnce({
          ok: false,
          reason: 'cancelled',
        })
      else
        navigator.mediaDevices.getUserMedia.mockRejectedValueOnce({
          name: 'AbortError',
          message: 'private details',
        })
      await wrapper.vm[start]()
      expect(results()).toEqual([
        {
          taskRef: 'task:0',
          mediaType,
          outcome: mediaType === 'screen' ? 'cancelled' : 'failed',
          stage: 'permission',
          reason: mediaType === 'screen' ? 'cancelled' : 'captureError',
        },
      ])
    })

    if (mediaType === 'screen') {
      it.each(['wrongSurface', 'error'])(
        'retains the screen helper reason %s',
        async (reason) => {
          startScreenShareStream.mockResolvedValueOnce({ ok: false, reason })
          await wrapper.vm[start]()
          expect(results()).toEqual([
            {
              taskRef: 'task:0',
              mediaType,
              outcome: 'failed',
              stage: 'permission',
              reason,
            },
          ])
        },
      )
      it('stops and uploads when browser screen sharing ends', async () => {
        await wrapper.vm[start]()
        data()
        track.onended()
        await flushPromises()
        expect(results()).toEqual([
          {
            taskRef: 'task:0',
            mediaType,
            outcome: 'completed',
            stage: 'upload',
          },
        ])
      })
      it('discards an explicitly aborted capture without uploading or inventing an outcome', async () => {
        await wrapper.vm[start]()
        data()
        wrapper.vm.abortCapture()
        await flushPromises()
        expect(results()).toEqual([])
        expect(uploadBytes).not.toHaveBeenCalled()
        expect(track.stop).toHaveBeenCalled()
      })
    }

    it('stops paused captures and processes the final data', async () => {
      await wrapper.vm[start]()
      data()
      recorders[0].state = 'paused'
      wrapper.vm[stop]()
      await flushPromises()
      expect(results()[0]).toMatchObject({
        outcome: 'completed',
        stage: 'upload',
      })
    })

    it('ignores delayed terminal errors from an earlier attempt during a new capture', async () => {
      await wrapper.vm[start]()
      data()
      wrapper.vm[stop]()
      await flushPromises()
      await wrapper.vm[start]()
      recorders[0].onerror({ error: new Error('late callback') })
      expect(
        mediaType === 'audio'
          ? wrapper.vm.recordingAudio
          : mediaType === 'webcam'
            ? wrapper.vm.recording
            : wrapper.vm.isCapturing,
      ).toBe(true)
      await wrapper.vm[start]()
      expect(MediaRecorder).toHaveBeenCalledTimes(2)
      expect(results()).toHaveLength(1)
      recorders[1].ondataavailable({ data: new Blob(['next capture']) })
      wrapper.vm[stop]()
      await flushPromises()
      expect(results()).toHaveLength(2)
    })

    it('rejects empty capture before uploading', async () => {
      await wrapper.vm[start]()
      wrapper.vm[stop]()
      await flushPromises()
      expect(results()[0]).toMatchObject({
        outcome: 'failed',
        stage: 'capture',
        reason: 'emptyRecording',
      })
      expect(uploadBytes).not.toHaveBeenCalled()
    })

    it.each(['upload', 'reference'])(
      'reports %s failure instead of successful completion and balances loading',
      async (failure) => {
        if (failure === 'upload')
          uploadBytes.mockRejectedValue(new Error('private URL'))
        else mockStore.dispatch.mockRejectedValue(new Error('private URL'))
        await wrapper.vm[start]()
        data()
        wrapper.vm[stop]()
        await flushPromises()
        expect(results()).toEqual([
          {
            taskRef: 'task:0',
            mediaType,
            outcome: 'failed',
            stage: 'upload',
            reason: 'uploadError',
          },
        ])
        expect(wrapper.emitted('showLoading')).toHaveLength(1)
        expect(wrapper.emitted('stopShowLoading')).toHaveLength(1)
        expect(track.stop).toHaveBeenCalled()
      },
    )

    it('does not start a second capture while acquisition or upload is pending', async () => {
      const acquire = deferred()
      if (mediaType === 'screen')
        startScreenShareStream.mockReturnValue(acquire.promise)
      else navigator.mediaDevices.getUserMedia.mockReturnValue(acquire.promise)
      const first = wrapper.vm[start]()
      await flushPromises()
      await wrapper.vm[start]()
      acquire.resolve(mediaType === 'screen' ? { ok: true, stream } : stream)
      await first
      expect(MediaRecorder).toHaveBeenCalledTimes(1)
      data()
      wrapper.vm[stop]()
      await flushPromises()
    })

    it('stops a stream that resolves after the recorder is unmounted', async () => {
      const acquire = deferred()
      if (mediaType === 'screen')
        startScreenShareStream.mockReturnValue(acquire.promise)
      else navigator.mediaDevices.getUserMedia.mockReturnValue(acquire.promise)

      const first = wrapper.vm[start]()
      await flushPromises()
      wrapper.unmount()
      acquire.resolve(mediaType === 'screen' ? { ok: true, stream } : stream)
      await first

      expect(MediaRecorder).not.toHaveBeenCalled()
      expect(track.stop).toHaveBeenCalled()
    })
  },
)
