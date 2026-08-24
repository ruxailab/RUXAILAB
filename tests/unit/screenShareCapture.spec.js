import {
  FALLBACK_DISPLAY_MEDIA_OPTIONS,
  PREFERRED_DISPLAY_MEDIA_OPTIONS,
  SCREEN_SHARE_REASONS,
  getDisplaySurface,
  isBrowserTabSurface,
  isMacOS,
  isUserCancellation,
  startScreenShareStream,
  stopMediaStream,
} from '@/shared/utils/screenShareCapture'

function mockMediaDevices(getDisplayMedia) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: getDisplayMedia
      ? { getDisplayMedia }
      : {},
  })
}

function createStream(displaySurface, { stop = jest.fn() } = {}) {
  const track = {
    getSettings: () => (displaySurface ? { displaySurface } : {}),
    stop,
  }
  return {
    getVideoTracks: () => [track],
    getTracks: () => [track],
    stop,
  }
}

describe('screenShareCapture', () => {
  const originalMediaDevices = navigator.mediaDevices

  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: originalMediaDevices,
    })
  })

  describe('isMacOS', () => {
    it('detects macOS from userAgentData', () => {
      expect(
        isMacOS({ userAgentData: { platform: 'macOS' }, platform: '' }),
      ).toBe(true)
    })

    it('detects macOS from navigator.platform', () => {
      expect(isMacOS({ platform: 'MacIntel' })).toBe(true)
    })

    it('returns false for Windows', () => {
      expect(
        isMacOS({ userAgentData: { platform: 'Windows' }, platform: 'Win32' }),
      ).toBe(false)
    })
  })

  describe('display surface helpers', () => {
    it('reads displaySurface from the video track', () => {
      expect(getDisplaySurface(createStream('monitor'))).toBe('monitor')
    })

    it('identifies browser tab surfaces', () => {
      expect(isBrowserTabSurface('browser')).toBe(true)
      expect(isBrowserTabSurface('monitor')).toBe(false)
      expect(isBrowserTabSurface('window')).toBe(false)
    })
  })

  describe('isUserCancellation', () => {
    it('treats permission and abort errors as cancellation', () => {
      expect(isUserCancellation({ name: 'NotAllowedError' })).toBe(true)
      expect(isUserCancellation({ name: 'AbortError' })).toBe(true)
      expect(isUserCancellation({ name: 'PermissionDeniedError' })).toBe(true)
      expect(isUserCancellation({ name: 'NotFoundError' })).toBe(false)
    })
  })

  describe('stopMediaStream', () => {
    it('stops every track', () => {
      const stream = createStream('monitor')
      stopMediaStream(stream)
      expect(stream.stop).toHaveBeenCalled()
    })
  })

  describe('startScreenShareStream', () => {
    it('returns unsupported when getDisplayMedia is missing', async () => {
      mockMediaDevices(null)
      await expect(startScreenShareStream()).resolves.toEqual({
        ok: false,
        reason: SCREEN_SHARE_REASONS.UNSUPPORTED,
      })
    })

    it('returns cancelled when the participant dismisses the picker', async () => {
      const error = new Error('Permission denied')
      error.name = 'NotAllowedError'
      mockMediaDevices(jest.fn().mockRejectedValue(error))

      const result = await startScreenShareStream()
      expect(result).toEqual({
        ok: false,
        reason: SCREEN_SHARE_REASONS.CANCELLED,
      })
    })

    it('retries with fallback constraints when preferred options fail', async () => {
      const stream = createStream('monitor')
      const getDisplayMedia = jest
        .fn()
        .mockRejectedValueOnce(new TypeError('Invalid constraint'))
        .mockResolvedValueOnce(stream)
      mockMediaDevices(getDisplayMedia)

      const result = await startScreenShareStream()

      expect(getDisplayMedia).toHaveBeenNthCalledWith(
        1,
        PREFERRED_DISPLAY_MEDIA_OPTIONS,
      )
      expect(getDisplayMedia).toHaveBeenNthCalledWith(
        2,
        FALLBACK_DISPLAY_MEDIA_OPTIONS,
      )
      expect(result).toEqual({
        ok: true,
        stream,
        displaySurface: 'monitor',
      })
    })

    it('does not retry after the participant cancels', async () => {
      const error = new Error('Permission denied')
      error.name = 'NotAllowedError'
      const getDisplayMedia = jest.fn().mockRejectedValue(error)
      mockMediaDevices(getDisplayMedia)

      await startScreenShareStream()
      expect(getDisplayMedia).toHaveBeenCalledTimes(1)
    })

    it('rejects a browser tab when the entire screen is required', async () => {
      const stream = createStream('browser')
      mockMediaDevices(jest.fn().mockResolvedValue(stream))

      const result = await startScreenShareStream({ requireEntireScreen: true })

      expect(result).toEqual({
        ok: false,
        reason: SCREEN_SHARE_REASONS.WRONG_SURFACE,
        displaySurface: 'browser',
      })
      expect(stream.stop).toHaveBeenCalled()
    })

    it('accepts a browser tab when the entire screen is not required', async () => {
      const stream = createStream('browser')
      mockMediaDevices(jest.fn().mockResolvedValue(stream))

      const result = await startScreenShareStream({ requireEntireScreen: false })
      expect(result.ok).toBe(true)
      expect(result.displaySurface).toBe('browser')
      expect(stream.stop).not.toHaveBeenCalled()
    })

    it('accepts an entire-screen surface', async () => {
      const stream = createStream('monitor')
      mockMediaDevices(jest.fn().mockResolvedValue(stream))

      const result = await startScreenShareStream({ requireEntireScreen: true })
      expect(result).toEqual({
        ok: true,
        stream,
        displaySurface: 'monitor',
      })
    })
  })
})
