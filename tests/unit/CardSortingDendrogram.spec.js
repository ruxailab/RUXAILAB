import { mount } from '@vue/test-utils'
import CardSortingDendrogram from '@/ux/CardSorting/components/results/CardSortingDendrogram.vue'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

jest.mock('@/shared/utils/toast', () => ({ showError: jest.fn() }))

const mountDendrogram = () =>
  mount(CardSortingDendrogram, {
    props: {
      test: {
        testStructure: {
          cardSorting: {
            cards: [{ title: 'A' }, { title: 'B' }, { title: 'C' }],
          },
        },
      },
      answers: [
        { submitted: true, sorting: { first: ['A', 'B'], second: ['C'] } },
      ],
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

describe('CardSortingDendrogram colors', () => {
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
    } finally {
      click.mockRestore()
      URL.createObjectURL = originalCreate
      URL.revokeObjectURL = originalRevoke
    }
  })
})
