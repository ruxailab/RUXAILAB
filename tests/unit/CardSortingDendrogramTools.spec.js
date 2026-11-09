import { mount } from '@vue/test-utils'
import CardSortingDendrogram from '@/ux/CardSorting/components/results/CardSortingDendrogram.vue'

jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
jest.mock('@/shared/utils/toast', () => ({ showError: jest.fn() }))

const test = {
  testStructure: {
    cardSorting: { cards: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
  },
}
const answers = [
  { submitted: true, sorting: { Food: ['A', 'B'], food: ['A'], Other: ['C'] } },
  { submitted: true, sorting: { FOOD: ['A', 'B'], Other: ['C'] } },
  { submitted: true, sorting: { food: ['A', 'B'], Other: ['C'] } },
]

const mountDendrogram = () =>
  mount(CardSortingDendrogram, {
    props: { test, answers },
    global: {
      mocks: {
        $t: (key, params) =>
          params ? `${key}:${JSON.stringify(params)}` : key,
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
        'v-icon': { template: '<i><slot /></i>' },
      },
    },
  })

describe('temporary dendrogram tools', () => {
  it('prioritizes qualifying groups without changing their numbers, colors or dendrogram', async () => {
    const wrapper = mountDendrogram()
    await wrapper.setProps({
      answers: [
        { submitted: true, sorting: { Food: ['A', 'B'], One: ['C'] } },
        { submitted: true, sorting: { FOOD: ['A', 'B'], Two: ['C'] } },
        { submitted: true, sorting: { food: ['A', 'B'], Three: ['C'] } },
      ],
    })
    const groups = () => wrapper.findAll('.group-summary')
    const buttonText = (index) =>
      groups()[index].find('[data-test="edit-group-name"]').text()
    const colors = () =>
      groups().map((group) => group.element.style.borderLeftColor)
    const leafColors = () =>
      wrapper.findAll('.dendrogram-node').map((node) => node.element.style.fill)
    const initialColors = colors()
    const initialLeafColors = leafColors()
    expect(buttonText(0)).toContain('"number":1')
    expect(buttonText(1)).toContain('"number":2')
    await groups()[1].find('[data-test="edit-group-name"]').trigger('click')
    await groups()[1].find('[data-test="group-name"]').setValue('Named')
    await groups()[1].find('[data-test="group-name"]').trigger('keydown.enter')
    await wrapper.find('[data-test="category-minimum"]').setValue('2')
    expect(buttonText(0)).toContain('"number":1')
    expect(buttonText(1)).toContain('Named')

    await wrapper
      .find('.dendrogram-tools input[type="checkbox"]')
      .setValue(true)
    expect(buttonText(0)).toContain('Named')
    expect(buttonText(1)).toContain('"number":1')
    expect(colors()).toEqual([initialColors[1], initialColors[0]])
    expect(leafColors()).toEqual(initialLeafColors)
    expect(groups()[0].text()).toContain('"name":"Food","count":3')
    expect(groups()[1].text()).toContain('CardSorting.noCategoriesAtMinimum')

    await wrapper.find('[data-test="category-minimum"]').setValue('4')
    expect(buttonText(0)).toContain('"number":1')
    expect(buttonText(1)).toContain('Named')
    await wrapper.find('[data-test="category-minimum"]').setValue('1')
    expect(buttonText(0)).toContain('"number":1')
    expect(buttonText(1)).toContain('Named')
    wrapper.unmount()
  })

  it('combines case variants once per participant and filters by the minimum', async () => {
    const wrapper = mountDendrogram()
    const checkbox = wrapper.find('.dendrogram-tools input[type="checkbox"]')
    const minimum = wrapper.find('[data-test="category-minimum"]')
    const summaries = () =>
      wrapper.findAll('.group-summary').map((group) => group.text())
    expect(summaries().join(' ')).toContain('"name":"Food","count":1')
    expect(summaries().join(' ')).toContain('"name":"food","count":2')
    expect(summaries().join(' ')).toContain('"name":"FOOD","count":1')

    await minimum.setValue('2')
    expect(summaries().join(' ')).toContain('"name":"food","count":2')
    expect(summaries().join(' ')).not.toContain('"name":"Food"')
    await minimum.setValue('1')
    await checkbox.setValue(true)
    expect(summaries().join(' ')).toContain('"name":"Food","count":3')
    expect(summaries().join(' ')).not.toContain('"name":"food"')
    await minimum.setValue('4')
    expect(
      summaries().every((text) =>
        text.includes('CardSorting.noCategoriesAtMinimum'),
      ),
    ).toBe(true)
    await minimum.setValue('3')
    expect(summaries().join(' ')).toContain('"name":"Food","count":3')
    expect(summaries().join(' ')).toContain('"name":"Other","count":3')
    await minimum.setValue('0')
    expect(wrapper.find('[role="alert"]').text()).toBe(
      'CardSorting.minimumCategoryError',
    )
    expect(summaries().join(' ')).toContain('"name":"Food","count":3')
    await minimum.setValue('1.5')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(summaries().join(' ')).toContain('"name":"Food","count":3')
    await minimum.setValue('1')
    await checkbox.setValue(false)
    expect(summaries().join(' ')).toContain('"name":"food","count":2')
    expect(answers[0].sorting).toEqual({
      Food: ['A', 'B'],
      food: ['A'],
      Other: ['C'],
    })
    wrapper.unmount()
  })

  it('keeps names with the same membership and resets transient settings on remount', async () => {
    const wrapper = mountDendrogram()
    const group = wrapper
      .findAll('.group-summary')
      .find((item) => item.text().includes('"name":"Food"'))
    await group.find('[data-test="edit-group-name"]').trigger('click')
    await group.find('[data-test="group-name"]').setValue('My group')
    await group.find('[data-test="group-name"]').trigger('keydown.enter')
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('keydown.left')
    expect(
      wrapper
        .findAll('[data-test="edit-group-name"]')
        .some((button) => button.text().includes('My group')),
    ).toBe(true)
    for (let i = 0; i < 27; i++) await slider.trigger('keydown.right')
    expect(wrapper.findAll('[data-test="edit-group-name"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="edit-group-name"]').text()).not.toContain(
      'My group',
    )
    await slider.trigger('keydown.left')
    expect(
      wrapper
        .findAll('[data-test="edit-group-name"]')
        .some((button) => button.text().includes('My group')),
    ).toBe(true)
    await wrapper
      .find('.dendrogram-tools input[type="checkbox"]')
      .setValue(true)
    await wrapper.find('[data-test="category-minimum"]').setValue('2')
    wrapper.unmount()
    const fresh = mountDendrogram()
    expect(
      fresh
        .findAll('[data-test="edit-group-name"]')
        .every((button) => !button.text().includes('My group')),
    ).toBe(true)
    expect(
      fresh.find('.dendrogram-tools input[type="checkbox"]').element.checked,
    ).toBe(false)
    expect(fresh.find('[data-test="category-minimum"]').element.value).toBe('1')
    fresh.unmount()
  })

  it('distinguishes no category names from filtered names', () => {
    const wrapper = mountDendrogram()
    wrapper.setProps({
      answers: [
        { submitted: true, sorting: { __unassigned: ['A', 'B', 'C'] } },
      ],
    })
    return wrapper.vm.$nextTick().then(() => {
      expect(wrapper.text()).toContain('CardSorting.noCategoryNames')
      expect(wrapper.text()).not.toContain('CardSorting.noCategoriesAtMinimum')
      wrapper.unmount()
    })
  })

  it('resets tools when the displayed study changes', async () => {
    const wrapper = mountDendrogram()
    await wrapper.find('[data-test="edit-group-name"]').trigger('click')
    await wrapper.find('[data-test="group-name"]').setValue('Name')
    await wrapper.find('[data-test="group-name"]').trigger('blur')
    await wrapper
      .find('.dendrogram-tools input[type="checkbox"]')
      .setValue(true)
    await wrapper.find('[data-test="category-minimum"]').setValue('2')
    await wrapper.setProps({ test: { ...test } })
    expect(
      wrapper
        .findAll('[data-test="edit-group-name"]')
        .every((button) => !button.text().includes('Name')),
    ).toBe(true)
    expect(
      wrapper.find('.dendrogram-tools input[type="checkbox"]').element.checked,
    ).toBe(false)
    expect(wrapper.find('[data-test="category-minimum"]').element.value).toBe(
      '1',
    )
    wrapper.unmount()
  })

  it('edits inline, cancels with Escape, and restores the default name when cleared', async () => {
    const wrapper = mountDendrogram()
    const group = wrapper.find('.group-summary')
    expect(group.find('[data-test="group-name"]').exists()).toBe(false)
    expect(group.find('[data-test="edit-group-name"]').text()).toContain(
      'CardSorting.groupNumber',
    )
    expect(group.find('[data-test="edit-group-name"]').html()).toContain(
      'mdi-pencil-outline',
    )
    await group.find('[data-test="edit-group-name"]').trigger('click')
    await group.find('[data-test="group-name"]').setValue('Custom')
    await group.find('[data-test="group-name"]').trigger('keydown.enter')
    expect(group.find('[data-test="edit-group-name"]').text()).toContain(
      'Custom',
    )
    await group.find('[data-test="edit-group-name"]').trigger('click')
    expect(group.find('[data-test="group-name"]').element.value).toBe('Custom')
    await group.find('[data-test="group-name"]').setValue('Discard')
    await group.find('[data-test="group-name"]').trigger('keydown.esc')
    expect(group.find('[data-test="edit-group-name"]').text()).toContain(
      'Custom',
    )
    await group.find('[data-test="edit-group-name"]').trigger('click')
    await group.find('[data-test="group-name"]').setValue('   ')
    await group.find('[data-test="group-name"]').trigger('blur')
    expect(group.find('[data-test="edit-group-name"]').text()).toContain(
      'CardSorting.groupNumber',
    )
    wrapper.unmount()
  })
})
