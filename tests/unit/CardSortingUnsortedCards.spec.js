import { mount } from '@vue/test-utils'
import CardSortingTask from '@/ux/CardSorting/components/CardSortingTask.vue'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

const test = {
  testTitle: 'Card sorting',
  testStructure: {
    cardSorting: {
      cards: [{ title: 'One' }, { title: 'Two' }],
      categories: [{ title: 'Group' }],
      options: { allow_create_categories: true },
    },
  },
}

const mountTask = (modelValue = {}) =>
  mount(CardSortingTask, {
    props: { test, modelValue },
    global: {
      mocks: { $t: (key) => key },
      stubs: {
        ShowInfo: { template: '<div><slot name="content" /></div>' },
        'v-container': { template: '<div><slot /></div>' },
        'v-progress-linear': true,
        'v-icon': true,
        'v-chip': true,
        'v-btn': { template: '<button><slot /></button>' },
        'v-dialog': true,
        'v-card': true,
        'v-card-title': true,
        'v-card-text': true,
        'v-card-actions': true,
        'v-spacer': true,
        'v-text-field': true,
        'v-tooltip': true,
      },
    },
  })

describe('unsorted card presentation', () => {
  it('distinguishes unsorted cards and updates when cards move between lists', async () => {
    const wrapper = mountTask({ Group: ['One'], __unassigned: ['Two'] })
    await wrapper.vm.$nextTick()
    const pool = wrapper.find('.sorting-column--pool')
    const category = wrapper.find('.sorting-column__list--category')
    const categoryId = wrapper.vm.localCategories[0].id

    expect(pool.classes()).toContain('sorting-column--pool-pending')
    expect(pool.findAll('.sorting-card--unsorted')).toHaveLength(1)
    expect(pool.find('.sorting-card__status').text()).toBe(
      'CardSorting.unsortedStatus',
    )
    expect(category.find('.sorting-card--unsorted').exists()).toBe(false)
    expect(category.find('.sorting-card__status').exists()).toBe(false)

    wrapper.vm.categoryLists[categoryId].push(wrapper.vm.pool.pop())
    wrapper.vm.onChange()
    await wrapper.vm.$nextTick()
    expect(pool.classes()).not.toContain('sorting-column--pool-pending')
    expect(pool.find('.sorting-card__status').exists()).toBe(false)
    expect(pool.find('.sorting-column__empty-text').text()).toBe(
      'CardSorting.allCardsSorted',
    )
    expect(wrapper.emitted('update:pending').at(-1)).toEqual([0])

    wrapper.vm.pool.push(wrapper.vm.categoryLists[categoryId].pop())
    wrapper.vm.onChange()
    await wrapper.vm.$nextTick()
    expect(pool.classes()).toContain('sorting-column--pool-pending')
    expect(pool.find('.sorting-card--unsorted').text()).toContain('Two')
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([
      { Group: ['One'], __unassigned: ['Two'] },
    ])
    expect(wrapper.emitted('update:pending').at(-1)).toEqual([1])
  })

  it('marks cards returned by deleting a participant category as unsorted', async () => {
    const wrapper = mountTask({
      Group: [],
      Personal: ['One'],
      __unassigned: ['Two'],
    })
    const participantCategory = wrapper.vm.localCategories.find(
      (category) => category.title === 'Personal',
    )

    wrapper.vm.removeCategory(participantCategory)
    await wrapper.vm.$nextTick()

    expect(
      wrapper.findAll('.sorting-column--pool .sorting-card--unsorted'),
    ).toHaveLength(2)
    expect(
      wrapper.findAll('.sorting-column--pool .sorting-card__status'),
    ).toHaveLength(2)
    expect(wrapper.emitted('update:pending').at(-1)).toEqual([2])
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([
      { Group: [], __unassigned: ['Two', 'One'] },
    ])
  })
})
