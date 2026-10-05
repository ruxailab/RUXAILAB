import { openCameraStream } from '@/ux/UserTest/utils/mediaRecording'

const failure = (name) => Object.assign(new Error(name), { name })
const camera = (deviceId, label) => ({ kind: 'videoinput', deviceId, label })
const devices = [
  { kind: 'audioinput', deviceId: 'mic', label: 'Microphone' },
  camera('ndi', 'NDI Webcam Video 1'),
  camera('obs', 'OBS Virtual Camera'),
  camera('usb', 'USB2.0 HD UVC WebCam'),
]

const mediaDevices = (opens) => ({
  enumerateDevices: jest.fn(async () => devices),
  getUserMedia: jest.fn(async ({ video }) => {
    const id = video === true ? 'default' : video.deviceId.exact
    const result = opens[id]
    if (result instanceof Error) throw result
    return result
  }),
})

describe('opening the webcam', () => {
  it('uses the default camera when it starts', async () => {
    const media = mediaDevices({ default: 'default-stream' })

    await expect(openCameraStream(media)).resolves.toBe('default-stream')
    expect(media.enumerateDevices).not.toHaveBeenCalled()
  })

  it('falls back to a real camera when the default cannot start', async () => {
    const media = mediaDevices({
      default: failure('AbortError'),
      usb: 'usb-stream',
      ndi: failure('AbortError'),
    })

    await expect(openCameraStream(media)).resolves.toBe('usb-stream')
    // The real camera is tried before the virtual ones.
    expect(media.getUserMedia).toHaveBeenNthCalledWith(2, {
      video: { deviceId: { exact: 'usb' } },
    })
  })

  it('does not look for another camera when permission is denied', async () => {
    const media = mediaDevices({ default: failure('NotAllowedError') })

    await expect(openCameraStream(media)).rejects.toMatchObject({
      name: 'NotAllowedError',
    })
    expect(media.enumerateDevices).not.toHaveBeenCalled()
  })

  it('reports the original error when no camera starts', async () => {
    const media = mediaDevices({
      default: failure('NotReadableError'),
      usb: failure('NotReadableError'),
      ndi: failure('AbortError'),
      obs: failure('AbortError'),
    })

    await expect(openCameraStream(media)).rejects.toMatchObject({
      name: 'NotReadableError',
    })
    expect(media.getUserMedia).toHaveBeenCalledTimes(4)
  })
})
