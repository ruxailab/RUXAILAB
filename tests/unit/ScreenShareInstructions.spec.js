import { mount } from '@vue/test-utils'
import ScreenShareInstructions from '@/shared/components/ScreenShareInstructions.vue'
import {
  getScreenSharePickerFamily,
  isMacOS,
} from '@/shared/utils/screenShareCapture'
import { getScreenShareInstructionMedia } from '@/ux/UserTest/utils/screenShareInstructionMedia'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

jest.mock('@/shared/utils/screenShareCapture', () => ({
  isMacOS: jest.fn(() => false),
  getScreenSharePickerFamily: jest.fn(() => 'chrome'),
  resolveScreenShareInstructionFamily: jest.requireActual(
    '@/shared/utils/screenShareCapture',
  ).resolveScreenShareInstructionFamily,
}))

jest.mock('@/ux/UserTest/utils/screenShareInstructionMedia', () => ({
  getScreenShareInstructionMedia: jest.fn((family) => ({
    video: `${family}.mp4`,
    poster: `${family}.jpg`,
  })),
}))

const VAlertStub = {
  template: '<div class="v-alert-stub"><slot /></div>',
}

function createWrapper(props = {}, { reducedMotion = false } = {}) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }))
  jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() =>
    Promise.resolve(),
  )
  jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})

  return mount(ScreenShareInstructions, {
    props,
    global: {
      stubs: {
        'v-icon': { template: '<span class="v-icon-stub"><slot /></span>' },
        'v-alert': VAlertStub,
      },
    },
  })
}

describe('ScreenShareInstructions', () => {
  beforeEach(() => {
    isMacOS.mockReturnValue(false)
    getScreenSharePickerFamily.mockReturnValue('chrome')
    getScreenShareInstructionMedia.mockImplementation((family) => ({
      video: `${family}.mp4`,
      poster: `${family}.jpg`,
    }))
  })

  it('renders the matching browser video in full mode', () => {
    getScreenSharePickerFamily.mockReturnValue('firefox')
    getScreenShareInstructionMedia.mockImplementation(() => ({
      video: 'firefox-av1.webm',
      sources: [
        { src: 'firefox-av1.webm', type: 'video/webm; codecs="av01.0.05M.08"' },
        { src: 'firefox-vp9.webm', type: 'video/webm; codecs="vp9"' },
      ],
    }))
    const wrapper = createWrapper()
    const video = wrapper.find('video')

    expect(getScreenShareInstructionMedia).toHaveBeenCalledWith('firefox')
    expect(video.exists()).toBe(true)
    expect(video.attributes('src')).toBe('firefox-av1.webm')
    expect(video.attributes('poster')).toBeUndefined()
    expect(video.attributes('autoplay')).toBeDefined()
    expect(wrapper.find('.picker-video-hint').text()).toBe(
      'screenShare.videoHintFirefox',
    )
    expect(wrapper.find('.screen-share-steps').exists()).toBe(true)
    wrapper.unmount()
  })

  it('falls back to the Chrome video for unknown browsers', () => {
    getScreenSharePickerFamily.mockReturnValue('unknown')
    const wrapper = createWrapper()

    expect(getScreenShareInstructionMedia).toHaveBeenCalledWith('chrome')
    expect(wrapper.find('video').attributes('src')).toBe('chrome.mp4')
    expect(wrapper.find('video').attributes('poster')).toBe('chrome.jpg')
    wrapper.unmount()
  })

  it('hides the video in checklist mode', () => {
    const wrapper = createWrapper({ mode: 'checklist' })

    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.find('.screen-share-steps').exists()).toBe(true)
    expect(wrapper.find('h3').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows the demo without the numbered steps in demo mode', () => {
    const wrapper = createWrapper({ mode: 'demo' })

    expect(wrapper.find('video').exists()).toBe(true)
    expect(wrapper.find('.screen-share-steps').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows the external-link warning only when requested', () => {
    const withoutLink = createWrapper()
    expect(withoutLink.find('.v-alert-stub').exists()).toBe(false)
    withoutLink.unmount()

    const withLink = createWrapper({ hasExternalLink: true })
    expect(withLink.find('.v-alert-stub').text()).toBe(
      'screenShare.dontShareTab',
    )
    withLink.unmount()
  })

  it('does not autoplay the instruction video when motion is reduced', () => {
    const wrapper = createWrapper({}, { reducedMotion: true })
    expect(wrapper.find('video').element.autoplay).toBe(false)
    wrapper.unmount()
  })

  it('renders the Safari video without a poster', () => {
    getScreenSharePickerFamily.mockReturnValue('safari')
    getScreenShareInstructionMedia.mockImplementation(() => ({
      video: 'safari-av1.webm',
      sources: [
        { src: 'safari-av1.webm', type: 'video/webm; codecs="av01.0.05M.08"' },
        { src: 'safari-vp9.webm', type: 'video/webm; codecs="vp9"' },
      ],
    }))
    const wrapper = createWrapper()
    expect(wrapper.find('video').attributes('src')).toBe('safari-av1.webm')
    expect(wrapper.find('video').attributes('poster')).toBeUndefined()
    wrapper.unmount()
  })

  it('falls back from Chrome AV1 to VP9 when the video errors', async () => {
    getScreenSharePickerFamily.mockReturnValue('chrome')
    getScreenShareInstructionMedia.mockImplementation(() => ({
      video: 'chrome-av1.webm',
      sources: [
        { src: 'chrome-av1.webm', type: 'video/webm; codecs="av01.0.05M.08"' },
        { src: 'chrome-vp9.webm', type: 'video/webm; codecs="vp9"' },
      ],
    }))
    const wrapper = createWrapper()
    await wrapper.find('video').trigger('error')
    expect(wrapper.find('video').attributes('src')).toBe('chrome-vp9.webm')
    expect(wrapper.find('img.picker-video').exists()).toBe(false)
    wrapper.unmount()
  })

  it('falls back from Firefox AV1 to VP9 when the video errors', async () => {
    getScreenSharePickerFamily.mockReturnValue('firefox')
    getScreenShareInstructionMedia.mockImplementation(() => ({
      video: 'firefox-av1.webm',
      sources: [
        { src: 'firefox-av1.webm', type: 'video/webm; codecs="av01.0.05M.08"' },
        { src: 'firefox-vp9.webm', type: 'video/webm; codecs="vp9"' },
      ],
    }))
    const wrapper = createWrapper()
    await wrapper.find('video').trigger('error')
    expect(wrapper.find('video').attributes('src')).toBe('firefox-vp9.webm')
    expect(wrapper.find('img.picker-video').exists()).toBe(false)
    wrapper.unmount()
  })

  it('falls back from Safari AV1 to VP9 when the video errors', async () => {
    getScreenSharePickerFamily.mockReturnValue('safari')
    getScreenShareInstructionMedia.mockImplementation(() => ({
      video: 'safari-av1.webm',
      sources: [
        { src: 'safari-av1.webm', type: 'video/webm; codecs="av01.0.05M.08"' },
        { src: 'safari-vp9.webm', type: 'video/webm; codecs="vp9"' },
      ],
    }))
    const wrapper = createWrapper()
    await wrapper.find('video').trigger('error')
    expect(wrapper.find('video').attributes('src')).toBe('safari-vp9.webm')
    expect(wrapper.find('img.picker-video').exists()).toBe(false)
    wrapper.unmount()
  })

  it('falls back to the poster when the video cannot load', async () => {
    const wrapper = createWrapper()
    await wrapper.find('video').trigger('error')

    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.find('img.picker-video').attributes('src')).toBe(
      'chrome.jpg',
    )
    wrapper.unmount()
  })
})
