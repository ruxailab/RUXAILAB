export const SCREEN_SHARE_REASONS = {
  UNSUPPORTED: 'unsupported',
  CANCELLED: 'cancelled',
  WRONG_SURFACE: 'wrongSurface',
  ERROR: 'error',
}

export const PREFERRED_DISPLAY_MEDIA_OPTIONS = {
  video: {
    displaySurface: 'monitor',
    cursor: 'always',
  },
  audio: false,
  preferCurrentTab: false,
  selfBrowserSurface: 'exclude',
  surfaceSwitching: 'include',
  monitorTypeSurfaces: 'include',
}

export const FALLBACK_DISPLAY_MEDIA_OPTIONS = {
  video: true,
  audio: false,
}

export function isMacOS(navigatorLike = navigator) {
  const uaDataPlatform = navigatorLike?.userAgentData?.platform || ''
  const platform = navigatorLike?.platform || ''
  return /mac/i.test(uaDataPlatform) || /mac/i.test(platform)
}

export function getDisplaySurface(stream) {
  const track = stream?.getVideoTracks?.()[0]
  return track?.getSettings?.()?.displaySurface || null
}

export function isBrowserTabSurface(surface) {
  return surface === 'browser'
}

export function isUserCancellation(error) {
  return (
    error?.name === 'NotAllowedError' ||
    error?.name === 'AbortError' ||
    error?.name === 'PermissionDeniedError'
  )
}

export function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => {
    try {
      track.stop()
    } catch {
      // Ignore tracks that are already stopped.
    }
  })
}

async function requestDisplayMedia(options) {
  return navigator.mediaDevices.getDisplayMedia(options)
}

export async function startScreenShareStream({
  requireEntireScreen = false,
} = {}) {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getDisplayMedia
  ) {
    return { ok: false, reason: SCREEN_SHARE_REASONS.UNSUPPORTED }
  }

  let stream
  try {
    stream = await requestDisplayMedia(PREFERRED_DISPLAY_MEDIA_OPTIONS)
  } catch (error) {
    if (isUserCancellation(error)) {
      return { ok: false, reason: SCREEN_SHARE_REASONS.CANCELLED }
    }

    try {
      stream = await requestDisplayMedia(FALLBACK_DISPLAY_MEDIA_OPTIONS)
    } catch (fallbackError) {
      if (isUserCancellation(fallbackError)) {
        return { ok: false, reason: SCREEN_SHARE_REASONS.CANCELLED }
      }
      return {
        ok: false,
        reason: SCREEN_SHARE_REASONS.ERROR,
        error: fallbackError,
      }
    }
  }

  const displaySurface = getDisplaySurface(stream)
  if (requireEntireScreen && isBrowserTabSurface(displaySurface)) {
    stopMediaStream(stream)
    return {
      ok: false,
      reason: SCREEN_SHARE_REASONS.WRONG_SURFACE,
      displaySurface,
    }
  }

  return { ok: true, stream, displaySurface }
}
