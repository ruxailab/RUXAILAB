import { mount } from '@vue/test-utils'
import CardsEditCardSorting from '@/ux/CardSorting/components/CardsEditCardSorting.vue'
import CategoriesEditCardSorting from '@/ux/CardSorting/components/CategoriesEditCardSorting.vue'
import { CardSortingStudyCard } from '@/ux/CardSorting/models/CardSortingStudyCard'
import { CardSortingStudyCategory } from '@/ux/CardSorting/models/CardSortingStudyCategory'
import { CardSortingStudyOptions } from '@/ux/CardSorting/models/CardSortingStudyOptions'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

const vuetifyStubs = {
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i><slot /></i>' },
  'v-checkbox': {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    template:
      '<input type="checkbox" :data-label="label" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
  },
  'v-divider': { template: '<hr />' },
  'v-data-table': {
    props: ['items'],
    template:
      '<div><div v-for="item in items" :key="item.title" class="row"><span class="row-title">{{ item.title }}</span><slot name="item.actions" :item="item" /></div></div>',
  },
  'v-btn': {
    emits: ['click'],
    template:
      '<button type="button" @click="$emit(\'click\')"><slot /></button>',
  },
  CardSortingForm: true,
  CardSortingImportDialog: {
    name: 'CardSortingImportDialog',
    props: ['dialog', 'type', 'existingTitles'],
    emits: ['import', 'update:dialog'],
    template:
      '<button v-if="dialog" class="import-dialog-trigger" type="button" @click="$emit(\'import\', [\'Checkout\', \'Search\'])">import-dialog</button>',
  },
}

const mountWith = (component, props = {}) =>
  mount(component, {
    props,
    global: {
      mocks: {
        $t: (key) => key,
        $vuetify: {
          theme: { current: { colors: { 'on-surface': '#111' } } },
        },
      },
      stubs: vuetifyStubs,
    },
  })

const findButton = (wrapper, text) =>
  wrapper.findAll('button').find((button) => button.text().includes(text))

describe('CardsEditCardSorting', () => {
  const existingCards = () => [
    new CardSortingStudyCard({ title: 'Existing Card' }),
    new CardSortingStudyCard({ title: 'Second Card' }),
  ]

  it('renders the cards it receives and emits nothing on mount', () => {
    const wrapper = mountWith(CardsEditCardSorting, { cards: existingCards() })

    expect(wrapper.findAll('.row-title').map((row) => row.text())).toEqual([
      'Existing Card',
      'Second Card',
    ])
    expect(wrapper.emitted('cards')).toBeFalsy()
    expect(wrapper.emitted('options')).toBeFalsy()
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('adds pasted card titles next to existing cards', async () => {
    const cards = existingCards()
    const wrapper = mountWith(CardsEditCardSorting, { cards })

    await findButton(wrapper, 'CardSorting.import').trigger('click')
    await wrapper.find('.import-dialog-trigger').trigger('click')

    const emitted = wrapper.emitted('cards').at(-1)[0]
    expect(emitted.map((card) => card.title)).toEqual([
      'Existing Card',
      'Second Card',
      'Checkout',
      'Search',
    ])
    expect(emitted.every((card) => card instanceof CardSortingStudyCard)).toBe(
      true,
    )
    expect(cards).toHaveLength(2)
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('emits the list without the deleted card and leaves the prop untouched', async () => {
    const cards = existingCards()
    const wrapper = mountWith(CardsEditCardSorting, { cards })

    const firstRow = wrapper.findAll('.row')[0]
    await findButton(firstRow, 'mdi-trash-can-outline').trigger('click')

    expect(
      wrapper
        .emitted('cards')
        .at(-1)[0]
        .map((card) => card.title),
    ).toEqual(['Second Card'])
    expect(cards.map((card) => card.title)).toEqual([
      'Existing Card',
      'Second Card',
    ])
  })

  it('emits a new options object when a setting is toggled', async () => {
    const options = new CardSortingStudyOptions({
      card_description: true,
      category_image: true,
    })
    const wrapper = mountWith(CardsEditCardSorting, { options })

    await wrapper.find('[data-label="CardSorting.showImage"]').setValue(true)

    const emitted = wrapper.emitted('options').at(-1)[0]
    expect(emitted).toBeInstanceOf(CardSortingStudyOptions)
    expect(emitted).not.toBe(options)
    expect(emitted.card_image).toBe(true)
    expect(emitted.card_description).toBe(true)
    expect(emitted.category_image).toBe(true)
    expect(options.card_image).toBe(false)
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('does not crash without any props', () => {
    expect(() => mountWith(CardsEditCardSorting)).not.toThrow()
  })
})

describe('CategoriesEditCardSorting', () => {
  const existingCategories = () => [
    new CardSortingStudyCategory({ title: 'Existing Category' }),
  ]

  it('renders the categories it receives and emits nothing on mount', () => {
    const wrapper = mountWith(CategoriesEditCardSorting, {
      categories: existingCategories(),
    })

    expect(wrapper.findAll('.row-title').map((row) => row.text())).toEqual([
      'Existing Category',
    ])
    expect(wrapper.emitted('categories')).toBeFalsy()
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('adds pasted category titles next to existing categories', async () => {
    const wrapper = mountWith(CategoriesEditCardSorting, {
      categories: existingCategories(),
    })

    await findButton(wrapper, 'CardSorting.import').trigger('click')
    await wrapper.find('.import-dialog-trigger').trigger('click')

    const categories = wrapper.emitted('categories').at(-1)[0]
    expect(categories.map((category) => category.title)).toEqual([
      'Existing Category',
      'Checkout',
      'Search',
    ])
  })

  it('emits a new options object when a setting is toggled', async () => {
    const options = new CardSortingStudyOptions({ card_image: true })
    const wrapper = mountWith(CategoriesEditCardSorting, { options })

    await wrapper
      .find('[data-label="CardSorting.allowCreateCategories"]')
      .setValue(true)

    const emitted = wrapper.emitted('options').at(-1)[0]
    expect(emitted.allow_create_categories).toBe(true)
    expect(emitted.card_image).toBe(true)
    expect(options.allow_create_categories).toBe(false)
  })

  it('does not crash without any props', () => {
    expect(() => mountWith(CategoriesEditCardSorting)).not.toThrow()
  })
})
