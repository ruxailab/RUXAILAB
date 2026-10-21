import {
  resolveScreenShareInstructionFamily,
  SCREEN_SHARE_PICKER_FAMILIES,
} from '@/shared/utils/screenShareCapture'

import chromeAv1Video from '@/assets/screen-share/chrome-av1.webm'
import chromeVp9Video from '@/assets/screen-share/chrome-vp9.webm'
import firefoxAv1Video from '@/assets/screen-share/firefox-av1.webm'
import firefoxVp9Video from '@/assets/screen-share/firefox-vp9.webm'
import safariAv1Video from '@/assets/screen-share/safari-av1.webm'
import safariVp9Video from '@/assets/screen-share/safari-vp9.webm'

export const WEBM_AV1_TYPE = 'video/webm; codecs="av01.0.05M.08"'
export const WEBM_VP9_TYPE = 'video/webm; codecs="vp9"'

function createVideoElement() {
  if (typeof document === 'undefined') return null
  return document.createElement('video')
}

export function canPlayVideoType(type, mediaEl = createVideoElement()) {
  if (!mediaEl?.canPlayType || !type) return false
  try {
    return mediaEl.canPlayType(type) !== ''
  } catch {
    return false
  }
}

export function pickFirstPlayableSource(sources = [], mediaEl) {
  if (!sources.length) return null
  const playable = sources.find((source) =>
    canPlayVideoType(source.type, mediaEl),
  )
  return (playable || sources[sources.length - 1]).src
}

function webmAv1Vp9Sources(av1, vp9) {
  return [
    { src: av1, type: WEBM_AV1_TYPE },
    { src: vp9, type: WEBM_VP9_TYPE },
  ]
}

export const SCREEN_SHARE_INSTRUCTION_MEDIA = {
  [SCREEN_SHARE_PICKER_FAMILIES.CHROME]: {
    sources: webmAv1Vp9Sources(chromeAv1Video, chromeVp9Video),
  },
  [SCREEN_SHARE_PICKER_FAMILIES.FIREFOX]: {
    sources: webmAv1Vp9Sources(firefoxAv1Video, firefoxVp9Video),
  },
  [SCREEN_SHARE_PICKER_FAMILIES.SAFARI]: {
    sources: webmAv1Vp9Sources(safariAv1Video, safariVp9Video),
  },
}

export function getScreenShareInstructionMedia(family, mediaEl) {
  const resolved = resolveScreenShareInstructionFamily(family)
  const config = SCREEN_SHARE_INSTRUCTION_MEDIA[resolved]
  if (config.sources) {
    return {
      ...config,
      video: pickFirstPlayableSource(config.sources, mediaEl),
    }
  }
  return config
}
