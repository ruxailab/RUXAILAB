import { mount } from '@vue/test-utils'
import CardSortingDendrogram from '@/ux/CardSorting/components/results/CardSortingDendrogram.vue'

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
        'v-divider': { template: '<hr />' },
        'v-icon': true,
      },
    },
  })

describe('CardSortingDendrogram colors', () => {
  it('labels cards and separates them from participant category names', async () => {
    const wrapper = mountDendrogram()
    const assertGroupSections = () => {
      const groups = wrapper.findAll('.group-summary')
      expect(groups.length).toBeGreaterThan(0)
      groups.forEach((group) => {
        const title = group.find('.group-cards-title')
        const divider = group.find('hr')
        expect(title.text()).toBe('CardSorting.cardsInSelectedGroup')
        expect(
          title.element.nextElementSibling.querySelector('.compact-chip'),
        ).not.toBeNull()
        expect(divider.element.previousElementSibling).toBe(
          title.element.nextElementSibling,
        )
        expect(divider.element.nextElementSibling.textContent).toContain(
          'CardSorting.categoryNames',
        )
      })
    }

    assertGroupSections()
    for (let i = 0; i < 26; i++) {
      await wrapper.find('[role="slider"]').trigger('keydown.right')
    }
    expect(wrapper.findAll('.group-summary')).toHaveLength(1)
    assertGroupSections()
  })

  it('renders five distance grid lines behind the branches', () => {
    const wrapper = mountDendrogram()
    const grid = wrapper.find('.dendrogram-grid')
    const ticks = grid.findAll('.dendrogram-grid-tick')
    const lines = grid.findAll('.dendrogram-grid-line')

    expect(ticks.map((tick) => tick.text())).toEqual([
      '0',
      '0.25',
      '0.5',
      '0.75',
      '1',
    ])
    expect(lines.map((line) => Number(line.attributes('x1')))).toEqual([
      196, 286, 376, 466, 556,
    ])
    expect(
      lines.every(
        (line, index) =>
          line.attributes('x1') === line.attributes('x2') &&
          line.attributes('x1') === ticks[index].attributes('x'),
      ),
    ).toBe(true)
    expect(
      lines.every(
        (line) => Number(line.attributes('y1')) < Number(line.attributes('y2')),
      ),
    ).toBe(true)
    expect(grid.text()).toContain('CardSorting.distanceScale')
    expect(
      grid.element.compareDocumentPosition(
        wrapper.find('.dendrogram-link').element,
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('uses the absolute distance scale even when the largest merge is below one', async () => {
    const wrapper = mountDendrogram([
      { submitted: true, sorting: { together: ['A', 'B', 'C'] } },
      { submitted: true, sorting: { first: ['A', 'B'], second: ['C'] } },
    ])
    const origin = Number(
      wrapper.findAll('.dendrogram-grid-line')[0].attributes('x1'),
    )
    const midpoint = Number(
      wrapper.findAll('.dendrogram-grid-line')[2].attributes('x1'),
    )
    const root = wrapper
      .findAll('.dendrogram-link')
      .find(
        (line) =>
          Number(line.attributes('x1')) === midpoint &&
          Number(line.attributes('x2')) === midpoint,
      )
    expect(root.exists()).toBe(true)
    expect(wrapper.findAll('.group-summary')).toHaveLength(1)
    expect(Number(wrapper.find('[role="slider"]').attributes('x1'))).toBe(
      midpoint,
    )
    await wrapper.find('[role="slider"]').trigger('keydown.left')
    expect(wrapper.findAll('.group-summary')).toHaveLength(2)
    expect(
      Number(wrapper.find('[role="slider"]').attributes('aria-valuenow')),
    ).toBe(52)
    expect(origin).toBe(196)
  })

  it('shows the fixed grid for zero-distance merges and no grid without data', () => {
    const wrapper = mountDendrogram([
      { submitted: true, sorting: { together: ['A', 'B', 'C'] } },
    ])
    expect(wrapper.findAll('.dendrogram-grid-line')).toHaveLength(5)
    expect(wrapper.findAll('.group-summary')).toHaveLength(1)
    expect(mountDendrogram([]).find('.dendrogram-grid').exists()).toBe(false)
  })

  it('matches leaves to group borders and updates when the cut changes', async () => {
    const wrapper = mountDendrogram()
    const colors = () =>
      wrapper.findAll('.dendrogram-node').map((node) => node.element.style.fill)
    const borders = () =>
      wrapper
        .findAll('.group-summary')
        .map((group) => group.element.style.borderLeftColor)

    expect(borders()).toHaveLength(2)
    expect(colors()).toEqual([borders()[0], borders()[1], borders()[1]])
    expect(
      wrapper
        .findAll('.dendrogram-link')
        .some((link) => link.element.style.stroke === '#767676'),
    ).toBe(true)

    const slider = wrapper.find('[role="slider"]')
    for (let i = 0; i < 26; i++) {
      await slider.trigger('keydown.right')
    }
    expect(borders()).toHaveLength(1)
    expect(colors()).toEqual([borders()[0], borders()[0], borders()[0]])
    expect(
      wrapper
        .findAll('.dendrogram-link')
        .every((link) => link.element.style.stroke === borders()[0]),
    ).toBe(true)
  })

  it('uses the displayed branch and node colors in the LaTeX export', async () => {
    const wrapper = mountDendrogram()
    let exported
    const createObjectURL = jest.fn((blob) => {
      exported = blob
      return 'blob:export'
    })
    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = jest.fn()
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    try {
      wrapper.vm.exportAsLatex()
      expect(createObjectURL).toHaveBeenCalledTimes(1)
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsText(exported)
      })
      expect(text).toContain('rgb,255:red,0;green,107;blue,156')
      expect(text).toContain('rgb,255:red,163;green,59;blue,0')
      expect(text).toContain('rgb,255:red,118;green,118;blue,118')
      expect(text.match(/red,210;green,215;blue,220/g)).toHaveLength(5)
      expect(text).toContain('CardSorting.distanceScale')
      for (const tick of ['0', '0.25', '0.5', '0.75', '1']) {
        expect(text).toContain(`{${tick}};`)
      }
    } finally {
      click.mockRestore()
      URL.createObjectURL = originalCreate
      URL.revokeObjectURL = originalRevoke
    }
  })
})
