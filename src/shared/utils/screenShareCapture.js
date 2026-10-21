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

export const SCREEN_SHARE_PICKER_FAMILIES = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  UNKNOWN: 'unknown',
}

export function isMacOS(navigatorLike = navigator) {
  const uaDataPlatform = navigatorLike?.userAgentData?.platform || ''
  const platform = navigatorLike?.platform || ''
  return /mac/i.test(uaDataPlatform) || /mac/i.test(platform)
}

function getUserAgent(navigatorLike) {
  return String(navigatorLike?.userAgent || '')
}

function getBrandNames(navigatorLike) {
  const brands = navigatorLike?.userAgentData?.brands || []
  return brands.map((entry) => String(entry?.brand || '').toLowerCase())
}

export function getScreenSharePickerFamily(navigatorLike = navigator) {
  if (!navigatorLike) {
    return SCREEN_SHARE_PICKER_FAMILIES.UNKNOWN
  }

  const ua = getUserAgent(navigatorLike)
  const brands = getBrandNames(navigatorLike)
  const brandText = brands.join(' ')

  if (
    /firefox\//i.test(ua) ||
    /fxios\//i.test(ua) ||
    brandText.includes('firefox')
  ) {
    return SCREEN_SHARE_PICKER_FAMILIES.FIREFOX
  }

  const looksLikeSafari =
    /safari/i.test(ua) &&
    !/chrome|chromium|crios|android|edg|opr|opt|fxios/i.test(ua)
  if (looksLikeSafari) {
    return SCREEN_SHARE_PICKER_FAMILIES.SAFARI
  }

  if (
    /chrome|chromium|crios|edg(e|a|ios)?\/|opr\/|opt\//i.test(ua) ||
    brandText.includes('google chrome') ||
    brandText.includes('chromium') ||
    brandText.includes('microsoft edge') ||
    brandText.includes('brave') ||
    brandText.includes('opera')
  ) {
    return SCREEN_SHARE_PICKER_FAMILIES.CHROME
  }

  return SCREEN_SHARE_PICKER_FAMILIES.UNKNOWN
}

export function resolveScreenShareInstructionFamily(family) {
  if (
    family === SCREEN_SHARE_PICKER_FAMILIES.FIREFOX ||
    family === SCREEN_SHARE_PICKER_FAMILIES.SAFARI
  ) {
    return family
  }
  return SCREEN_SHARE_PICKER_FAMILIES.CHROME
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
