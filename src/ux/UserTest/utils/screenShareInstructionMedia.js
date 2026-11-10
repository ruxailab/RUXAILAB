import {
  resolveScreenShareInstructionFamily,
  SCREEN_SHARE_PICKER_FAMILIES,
} from '@/shared/utils/screenShareCapture'

import chromeVp9Video from '@/assets/screen-share/chrome-vp9.webm'
import firefoxVp9Video from '@/assets/screen-share/firefox-vp9.webm'
import safariVp9Video from '@/assets/screen-share/safari-vp9.webm'

export const WEBM_VP9_TYPE = 'video/webm; codecs="vp9"'

const createSources = (vp9) => [{ src: vp9, type: WEBM_VP9_TYPE }]

export const SCREEN_SHARE_INSTRUCTION_MEDIA = {
  [SCREEN_SHARE_PICKER_FAMILIES.CHROME]: {
    sources: createSources(chromeVp9Video),
  },
  [SCREEN_SHARE_PICKER_FAMILIES.FIREFOX]: {
    sources: createSources(firefoxVp9Video),
  },
  [SCREEN_SHARE_PICKER_FAMILIES.SAFARI]: {
    sources: createSources(safariVp9Video),
  },
}

export function pickFirstPlayableSource(sources = [], { canPlayType } = {}) {
  if (typeof canPlayType === 'function') {
    const playable = sources.find(
      (source) => source?.type && canPlayType(source.type),
    )
    if (playable?.src) return playable.src
  }

  const vp9 = sources.find((source) => source?.type === WEBM_VP9_TYPE)
  return vp9?.src || sources[0]?.src
}

export function getScreenShareInstructionMedia(family, options = {}) {
  const resolved = resolveScreenShareInstructionFamily(family)
  const config =
    SCREEN_SHARE_INSTRUCTION_MEDIA[resolved] ||
    SCREEN_SHARE_INSTRUCTION_MEDIA[SCREEN_SHARE_PICKER_FAMILIES.CHROME] ||
    {}
  const video = pickFirstPlayableSource(config.sources || [], options)

  return {
    ...config,
    video,
  }
}
