import { mount } from '@vue/test-utils'
import CardSortingTask from '@/ux/CardSorting/components/CardSortingTask.vue'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, params) => {
      if (params && params.count !== undefined) {
        return `${key}:${params.count}`
      }
      return key
    },
  }),
}))

const mockTest = {
  testTitle: 'Test Card Sorting',
  testStructure: {
    cardSorting: {
      cards: [
        { title: 'Card 1', description: '' },
        { title: 'Card 2', description: '' },
        { title: 'Card 3', description: '' },
      ],
      categories: [
        { id: 'cat-1', title: 'Category 1', description: '' },
      ],
      options: {
        allow_create_categories: true,
      },
    },
  },
}

describe('CardSortingTask.vue', () => {
  it('renders drop hint when category has no cards, and hides it when cards are added', async () => {
    const wrapper = mount(CardSortingTask, {
      props: {
        test: mockTest,
        modelValue: {},
      },
      global: {
        mocks: {
          $t: (key, params) => (params?.count !== undefined ? `${key}:${params.count}` : key),
        },
        stubs: {
          ShowInfo: { template: '<div><slot name="content" /></div>' },
          CardSortingCard: { template: '<div class="card-stub">{{ element.title }}</div>', props: ['element'] },
          'v-divider': true,
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
        },
      },
    })

    await wrapper.vm.$nextTick()

    // Initially category has 0 cards, so drop hint should be rendered
    const categoryDropHint = wrapper.find('.sorting-column__drop-hint')
    expect(categoryDropHint.exists()).toBe(true)

    // Simulate moving a card to category
    const catId = wrapper.vm.localCategories[0].id
    wrapper.vm.categoryLists[catId].push({ title: 'Card 1', description: '' })
    wrapper.vm.pool = wrapper.vm.pool.filter((c) => c.title !== 'Card 1')
    wrapper.vm.onChange()
    await wrapper.vm.$nextTick()

    // Drop hint should now disappear
    expect(wrapper.find('.sorting-column__drop-hint').exists()).toBe(false)
  })

  it('renders instruction to create category and top button', async () => {
    const wrapper = mount(CardSortingTask, {
      props: {
        test: mockTest,
        modelValue: {},
      },
      global: {
        mocks: {
          $t: (key, params) => (params?.count !== undefined ? `${key}:${params.count}` : key),
        },
        stubs: {
          ShowInfo: { template: '<div><slot name="content" /></div>' },
          CardSortingCard: true,
          'v-divider': true,
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
        },
      },
    })

    // Button in top toolbar is present
    const topBtn = wrapper.find('[data-test="create-category-top-btn"]')
    expect(topBtn.exists()).toBe(true)

    // New category card in the board is present with instructions
    const newCatCard = wrapper.find('.new-category-card')
    expect(newCatCard.exists()).toBe(true)
    expect(newCatCard.find('.new-category-card__subtitle').text()).toBe('CardSorting.newCategoryHint')

    // Clicking top button creates an unnamed category
    const initialCategoriesCount = wrapper.vm.localCategories.length
    await topBtn.trigger('click')
    expect(wrapper.vm.localCategories.length).toBe(initialCategoriesCount + 1)
  })

  it('handles 42 cards properly with scrollable container and preserves data', () => {
    const cards42 = Array.from({ length: 42 }, (_, i) => ({
      title: `Card ${i + 1}`,
      description: `Description ${i + 1}`,
    }))

    const largeTest = {
      ...mockTest,
      testStructure: {
        ...mockTest.testStructure,
        cardSorting: {
          ...mockTest.testStructure.cardSorting,
          cards: cards42,
        },
      },
    }

    const wrapper = mount(CardSortingTask, {
      props: {
        test: largeTest,
        modelValue: {},
      },
      global: {
        mocks: {
          $t: (key, params) => (params?.count !== undefined ? `${key}:${params.count}` : key),
        },
        stubs: {
          ShowInfo: { template: '<div><slot name="content" /></div>' },
          CardSortingCard: true,
          'v-divider': true,
          'v-container': { template: '<div><slot /></div>' },
          'v-progress-linear': true,
          'v-icon': true,
          'v-chip': true,
          'v-btn': true,
          'v-dialog': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-spacer': true,
          'v-text-field': true,
        },
      },
    })

    expect(wrapper.vm.totalCards).toBe(42)
    expect(wrapper.vm.pool.length).toBe(42)
    expect(wrapper.vm.assignedCount).toBe(0)
  })
})
