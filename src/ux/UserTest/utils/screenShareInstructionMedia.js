import {
  resolveScreenShareInstructionFamily,
  SCREEN_SHARE_PICKER_FAMILIES,
} from '@/shared/utils/screenShareCapture'

import chromeVp9Video from '@/assets/screen-share/chrome-vp9.webm'
import firefoxVp9Video from '@/assets/screen-share/firefox-vp9.webm'
import safariVp9Video from '@/assets/screen-share/safari-vp9.webm'

export const SCREEN_SHARE_INSTRUCTION_MEDIA = {
  [SCREEN_SHARE_PICKER_FAMILIES.CHROME]: {
    video: chromeVp9Video,
  },
  [SCREEN_SHARE_PICKER_FAMILIES.FIREFOX]: {
    video: firefoxVp9Video,
  },
  [SCREEN_SHARE_PICKER_FAMILIES.SAFARI]: {
    video: safariVp9Video,
  },
}

export function getScreenShareInstructionMedia(family, mediaEl) {
  const resolved = resolveScreenShareInstructionFamily(family)
  return SCREEN_SHARE_INSTRUCTION_MEDIA[resolved] || {}
}
