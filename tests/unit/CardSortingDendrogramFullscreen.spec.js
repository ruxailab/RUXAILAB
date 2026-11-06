import { mount } from '@vue/test-utils'
import CardSortingDendrogram from '@/ux/CardSorting/components/results/CardSortingDendrogram.vue'
import { showError } from '@/shared/utils/toast'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))
jest.mock('@/shared/utils/toast', () => ({ showError: jest.fn() }))

const mountDendrogram = (
  answers = [
    { submitted: true, sorting: { first: ['A', 'B'], second: ['C'] } },
  ],
) =>
  mount(CardSortingDendrogram, {
    props: {
      test: {
        testStructure: {
          cardSorting: {
            cards: [{ title: 'A' }, { title: 'B' }, { title: 'C' }],
          },
        },
      },
      answers,
    },
    global: {
      mocks: { $t: (key) => key },
      stubs: {
        'v-row': { template: '<div><slot /></div>' },
        'v-col': { template: '<div><slot /></div>' },
        'v-card': { template: '<div><slot /></div>' },
        'v-tooltip': {
          template: '<div><slot name="activator" :props="{}" /></div>',
        },
        'v-menu': {
          template: '<div><slot name="activator" :props="{}" /><slot /></div>',
        },
        'v-btn': { template: '<button><slot /></button>' },
        'v-list': { template: '<div><slot /></div>' },
        'v-list-item': true,
        'v-chip': { template: '<span><slot /></span>' },
        'v-icon': true,
      },
    },
  })

describe('dendrogram full screen', () => {
  let fullscreenElement
  let originalFullscreenElement
  let originalExitFullscreen

  beforeEach(() => {
    originalFullscreenElement = Object.getOwnPropertyDescriptor(
      document,
      'fullscreenElement',
    )
    originalExitFullscreen = document.exitFullscreen
    fullscreenElement = null
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenElement,
    })
    document.exitFullscreen = jest.fn(async () => {
      fullscreenElement = null
      document.dispatchEvent(new Event('fullscreenchange'))
    })
  })

  afterEach(() => {
    if (originalFullscreenElement) {
      Object.defineProperty(
        document,
        'fullscreenElement',
        originalFullscreenElement,
      )
    } else {
      delete document.fullscreenElement
    }
    document.exitFullscreen = originalExitFullscreen
  })

  it('expands the same interactive chart and restores its state on exit', async () => {
    const wrapper = mountDendrogram()
    const container = wrapper.find('.chart-card').element
    const chart = wrapper.find('.dendrogram-chart').element
    const svg = wrapper.find('svg').element
    Object.defineProperty(chart, 'clientWidth', {
      configurable: true,
      value: 1000,
    })
    container.requestFullscreen = jest.fn(async () => {
      fullscreenElement = container
      document.dispatchEvent(new Event('fullscreenchange'))
    })
    const button = wrapper.find('[data-test="dendrogram-fullscreen"]')
    expect(button.attributes('aria-label')).toBe('CardSorting.enterFullscreen')
    await wrapper.find('[role="slider"]').trigger('keydown.left')
    await button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(container.requestFullscreen).toHaveBeenCalledTimes(1)
    expect(button.attributes('aria-label')).toBe('CardSorting.exitFullscreen')
    expect(wrapper.find('svg').element).toBe(svg)
    expect(Number(wrapper.find('svg').attributes('width'))).toBe(984)
    expect(wrapper.find('[role="slider"]').attributes('aria-valuenow')).toBe(
      '52',
    )
    Object.defineProperty(chart, 'clientWidth', { configurable: true, value: 800 })
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()
    expect(Number(wrapper.find('svg').attributes('width'))).toBe(784)
    await wrapper.find('[role="slider"]').trigger('keydown.left')
    await button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1)
    expect(button.attributes('aria-label')).toBe('CardSorting.enterFullscreen')
    expect(Number(wrapper.find('svg').attributes('width'))).toBe(596)
    expect(wrapper.find('[role="slider"]').attributes('aria-valuenow')).toBe(
      '54',
    )
    wrapper.unmount()
  })

  it('reflects browser escape and reports a denied request', async () => {
    const wrapper = mountDendrogram()
    const container = wrapper.find('.chart-card').element
    const button = wrapper.find('[data-test="dendrogram-fullscreen"]')
    container.requestFullscreen = jest.fn(async () => {
      fullscreenElement = container
      document.dispatchEvent(new Event('fullscreenchange'))
    })
    await button.trigger('click')
    fullscreenElement = null
    document.dispatchEvent(new Event('fullscreenchange'))
    await wrapper.vm.$nextTick()
    expect(button.attributes('aria-label')).toBe('CardSorting.enterFullscreen')
    container.requestFullscreen.mockRejectedValueOnce(new Error('Denied'))
    await button.trigger('click')
    await Promise.resolve()
    expect(showError).toHaveBeenCalledWith('CardSorting.fullscreenError')
    wrapper.unmount()
  })

  it('does not offer full screen without a chart', () => {
    const wrapper = mountDendrogram([])
    expect(wrapper.find('[data-test="dendrogram-fullscreen"]').exists()).toBe(
      false,
    )
    wrapper.unmount()
  })
})
