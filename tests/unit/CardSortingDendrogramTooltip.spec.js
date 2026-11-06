import { mount } from '@vue/test-utils'
import CardSortingDendrogram from '@/ux/CardSorting/components/results/CardSortingDendrogram.vue'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

jest.mock('@/shared/utils/toast', () => ({ showError: jest.fn() }))

const mountDendrogram = () => {
  const cards = Array.from({ length: 40 }, (_, index) => ({
    title: `Card ${index + 1}`,
  }))
  return mount(CardSortingDendrogram, {
    props: {
      test: { testStructure: { cardSorting: { cards } } },
      answers: [
        { submitted: true, sorting: { group: cards.map((c) => c.title) } },
      ],
    },
    global: {
      mocks: {
        $t: (key, params) => (params ? `${key}:${params.value}` : key),
      },
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
        'v-btn': true,
        'v-list': { template: '<div><slot /></div>' },
        'v-list-item': true,
        'v-chip': { template: '<span><slot /></span>' },
        'v-divider': true,
        'v-icon': true,
      },
    },
  })
}

describe('dendrogram similarity tooltip', () => {
  it('remains outside the scrolling content when hovering a long chart', async () => {
    const wrapper = mountDendrogram()
    const chart = wrapper.find('.dendrogram-chart')
    const scroll = wrapper.find('.dendrogram-scroll')
    const slider = wrapper.find('[role="slider"]')
    scroll.element.scrollTop = 500
    scroll.element.scrollLeft = 100
    await slider.trigger('pointerenter')

    const tooltip = wrapper.find('.cut-line-tooltip')
    expect(tooltip.text()).toBe('CardSorting.cutSimilarityValue:50')
    expect(tooltip.element.parentElement).toBe(chart.element)
    expect(scroll.element.contains(tooltip.element)).toBe(false)
    await scroll.trigger('scroll')
    expect(wrapper.find('.cut-line-tooltip').exists()).toBe(true)
    await slider.trigger('pointerleave')
    expect(wrapper.find('.cut-line-tooltip').exists()).toBe(false)
  })

  it('shows and updates the tooltip for keyboard focus', async () => {
    const wrapper = mountDendrogram()
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('focus')
    expect(wrapper.find('.cut-line-tooltip').text()).toBe(
      'CardSorting.cutSimilarityValue:50',
    )
    await slider.trigger('keydown.left')
    expect(wrapper.find('.cut-line-tooltip').text()).toBe(
      'CardSorting.cutSimilarityValue:52',
    )
    await slider.trigger('pointerleave')
    expect(wrapper.find('.cut-line-tooltip').exists()).toBe(true)
    await slider.trigger('blur')
    expect(wrapper.find('.cut-line-tooltip').exists()).toBe(false)
  })

  it('keeps the tooltip visible during dragging after leaving the line', async () => {
    const wrapper = mountDendrogram()
    const svg = wrapper.find('svg').element
    svg.setPointerCapture = jest.fn()
    svg.hasPointerCapture = jest.fn(() => true)
    svg.releasePointerCapture = jest.fn()
    svg.getScreenCTM = () => ({ inverse: () => ({}) })
    svg.createSVGPoint = () => ({
      x: 0,
      y: 0,
      matrixTransform() {
        return { x: this.x, y: this.y }
      },
    })
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('pointerdown')
    await slider.trigger('pointerleave')
    expect(wrapper.find('.cut-line-tooltip').exists()).toBe(true)
    svg.dispatchEvent(
      new MouseEvent('pointermove', { bubbles: true, clientX: 466 }),
    )
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.cut-line-tooltip').text()).toBe(
      'CardSorting.cutSimilarityValue:25',
    )
    await wrapper.find('svg').trigger('pointerup')
    expect(wrapper.find('.cut-line-tooltip').exists()).toBe(false)
  })
})
