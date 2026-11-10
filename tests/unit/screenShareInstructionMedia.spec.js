import {
  SCREEN_SHARE_INSTRUCTION_MEDIA,
  WEBM_VP9_TYPE,
  getScreenShareInstructionMedia,
  pickFirstPlayableSource,
} from '@/ux/UserTest/utils/screenShareInstructionMedia'

describe('pickFirstPlayableSource', () => {
  const sources = [{ src: 'clip-vp9.webm', type: WEBM_VP9_TYPE }]

  it('picks VP9 when the browser can play it', () => {
    expect(
      pickFirstPlayableSource(sources, {
        canPlayType: (type) => (type.includes('vp9') ? 'probably' : ''),
      }),
    ).toBe('clip-vp9.webm')
  })

  it('falls back to VP9 when canPlayType is unavailable', () => {
    expect(pickFirstPlayableSource(sources, {})).toBe('clip-vp9.webm')
  })

  it('returns VP9 when canPlayType reports unsupported', () => {
    expect(
      pickFirstPlayableSource(sources, {
        canPlayType: () => '',
      }),
    ).toBe('clip-vp9.webm')
  })
})

describe('getScreenShareInstructionMedia', () => {
  it.each(['chrome', 'firefox', 'safari'])(
    'lists %s VP9 only and omits a poster',
    (family) => {
      const config = SCREEN_SHARE_INSTRUCTION_MEDIA[family]
      expect(config.sources.map((source) => source.type)).toEqual([WEBM_VP9_TYPE])
      expect(config.poster).toBeUndefined()

      const media = getScreenShareInstructionMedia(family, {
        canPlayType: (type) => (type.includes('vp9') ? 'probably' : ''),
      })
      expect(media.video).toBe('test-file-stub')
      expect(media.poster).toBeUndefined()
    },
  )

  it('uses Chrome instruction media for unknown browsers', () => {
    const media = getScreenShareInstructionMedia('unknown', {
      canPlayType: (type) => (type.includes('vp9') ? 'probably' : ''),
    })
    expect(media.sources).toEqual(SCREEN_SHARE_INSTRUCTION_MEDIA.chrome.sources)
    expect(media.poster).toBeUndefined()
  })
})
