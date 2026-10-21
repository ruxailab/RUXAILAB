import {
  FALLBACK_DISPLAY_MEDIA_OPTIONS,
  PREFERRED_DISPLAY_MEDIA_OPTIONS,
  SCREEN_SHARE_REASONS,
  getDisplaySurface,
  getScreenSharePickerFamily,
  isBrowserTabSurface,
  isMacOS,
  isUserCancellation,
  resolveScreenShareInstructionFamily,
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

  describe('getScreenSharePickerFamily', () => {
    it('maps Edge to the Chrome picker video', () => {
      expect(
        getScreenSharePickerFamily({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
        }),
      ).toBe('chrome')
      expect(
        getScreenSharePickerFamily({
          userAgent: 'Mozilla/5.0 Chrome/129.0.0.0 Safari/537.36',
          userAgentData: {
            brands: [
              { brand: 'Chromium', version: '129' },
              { brand: 'Microsoft Edge', version: '129' },
            ],
          },
        }),
      ).toBe('chrome')
    })

    it('detects Firefox from desktop and iOS user agents', () => {
      expect(
        getScreenSharePickerFamily({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
        }),
      ).toBe('firefox')
      expect(
        getScreenSharePickerFamily({
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) FxiOS/131.0',
        }),
      ).toBe('firefox')
    })

    it('detects Safari without matching Chrome-family browsers', () => {
      expect(
        getScreenSharePickerFamily({
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
        }),
      ).toBe('safari')
    })

    it('maps Chrome, Brave, and Opera to the Chrome picker video', () => {
      expect(
        getScreenSharePickerFamily({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        }),
      ).toBe('chrome')
      expect(
        getScreenSharePickerFamily({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          userAgentData: {
            brands: [
              { brand: 'Not.A/Brand', version: '8' },
              { brand: 'Chromium', version: '129' },
              { brand: 'Brave', version: '129' },
            ],
          },
        }),
      ).toBe('chrome')
      expect(
        getScreenSharePickerFamily({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 OPR/114.0.0.0',
        }),
      ).toBe('chrome')
    })

    it('returns unknown when the browser cannot be identified', () => {
      expect(getScreenSharePickerFamily(null)).toBe('unknown')
      expect(getScreenSharePickerFamily({ userAgent: '' })).toBe('unknown')
    })
  })

  describe('resolveScreenShareInstructionFamily', () => {
    it('falls back to Chrome for unknown browsers', () => {
      expect(resolveScreenShareInstructionFamily('unknown')).toBe('chrome')
      expect(resolveScreenShareInstructionFamily('chrome')).toBe('chrome')
      expect(resolveScreenShareInstructionFamily('edge')).toBe('chrome')
      expect(resolveScreenShareInstructionFamily('firefox')).toBe('firefox')
      expect(resolveScreenShareInstructionFamily('safari')).toBe('safari')
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
