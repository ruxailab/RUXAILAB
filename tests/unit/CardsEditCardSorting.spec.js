import { mount } from '@vue/test-utils'
import { useStore } from 'vuex'
import CardsEditCardSorting from '@/ux/CardSorting/components/CardsEditCardSorting.vue'
import CategoriesEditCardSorting from '@/ux/CardSorting/components/CategoriesEditCardSorting.vue'

jest.mock('vuex', () => ({
  useStore: jest.fn(),
}))

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
  'v-checkbox': { template: '<div />' },
  'v-divider': { template: '<hr />' },
  'v-data-table': { template: '<div />' },
  'v-btn': {
    emits: ['click'],
    template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
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

const mountOptions = {
  global: {
    mocks: {
      $t: (key) => key,
      $vuetify: {
        theme: { current: { colors: { 'on-surface': '#111' } } },
      },
    },
    stubs: vuetifyStubs,
  },
}

describe('Card Sorting import on edit study', () => {
  beforeEach(() => {
    useStore.mockReturnValue({
      getters: {
        test: {
          testStructure: {
            cardSorting: {
              cards: [{ title: 'Existing Card' }],
              categories: [{ title: 'Existing Category' }],
              options: {},
            },
          },
        },
      },
    })
  })

  it('adds pasted card titles next to existing cards', async () => {
    const wrapper = mount(CardsEditCardSorting, mountOptions)
    await wrapper.vm.$nextTick()

    const importButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('CardSorting.import'))
    expect(importButton).toBeTruthy()
    await importButton.trigger('click')

    await wrapper.find('.import-dialog-trigger').trigger('click')

    const cards = wrapper.emitted('cards').at(-1)[0]
    expect(cards.map((card) => card.title)).toEqual([
      'Existing Card',
      'Checkout',
      'Search',
    ])
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('does not crash when the study has not loaded yet', () => {
    useStore.mockReturnValue({ getters: { test: null } })

    expect(() => mount(CardsEditCardSorting, mountOptions)).not.toThrow()
    expect(() => mount(CategoriesEditCardSorting, mountOptions)).not.toThrow()
  })

  it('adds pasted category titles next to existing categories', async () => {
    const wrapper = mount(CategoriesEditCardSorting, mountOptions)
    await wrapper.vm.$nextTick()

    const importButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('CardSorting.import'))
    await importButton.trigger('click')
    await wrapper.find('.import-dialog-trigger').trigger('click')

    const categories = wrapper.emitted('categories').at(-1)[0]
    expect(categories.map((category) => category.title)).toEqual([
      'Existing Category',
      'Checkout',
      'Search',
    ])
  })
})
