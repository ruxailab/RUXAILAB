import {
  SCREEN_SHARE_INSTRUCTION_MEDIA,
  WEBM_AV1_TYPE,
  WEBM_VP9_TYPE,
  getScreenShareInstructionMedia,
  pickFirstPlayableSource,
} from '@/ux/UserTest/utils/screenShareInstructionMedia'

describe('pickFirstPlayableSource', () => {
  const sources = [
    { src: 'clip-av1.webm', type: WEBM_AV1_TYPE },
    { src: 'clip-vp9.webm', type: WEBM_VP9_TYPE },
  ]

  it('picks AV1 when the browser can play it', () => {
    expect(
      pickFirstPlayableSource(sources, {
        canPlayType: (type) => (type.includes('av01') ? 'probably' : ''),
      }),
    ).toBe('clip-av1.webm')
  })

  it('falls back to VP9 when AV1 is not supported', () => {
    expect(
      pickFirstPlayableSource(sources, {
        canPlayType: (type) => (type.includes('vp9') ? 'maybe' : ''),
      }),
    ).toBe('clip-vp9.webm')
  })

  it('falls back to VP9 when canPlayType is unavailable', () => {
    expect(pickFirstPlayableSource(sources, {})).toBe('clip-vp9.webm')
  })
})

describe('getScreenShareInstructionMedia', () => {
  it.each(['chrome', 'firefox', 'safari'])(
    'lists %s AV1 before VP9 and omits a poster',
    (family) => {
      const config = SCREEN_SHARE_INSTRUCTION_MEDIA[family]
      expect(config.sources.map((source) => source.type)).toEqual([
        WEBM_AV1_TYPE,
        WEBM_VP9_TYPE,
      ])
      expect(config.poster).toBeUndefined()

      const media = getScreenShareInstructionMedia(family, {
        canPlayType: (type) => (type.includes('av01') ? 'probably' : ''),
      })
      expect(media.video).toBe('test-file-stub')
      expect(media.poster).toBeUndefined()
    },
  )

  it('uses Chrome instruction media for unknown browsers', () => {
    const media = getScreenShareInstructionMedia('unknown', {
      canPlayType: (type) => (type.includes('av01') ? 'probably' : ''),
    })
    expect(media.sources).toEqual(
      SCREEN_SHARE_INSTRUCTION_MEDIA.chrome.sources,
    )
    expect(media.poster).toBeUndefined()
  })
})
