import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import EditTestView from '@/ux/CardSorting/views/EditTestView.vue'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'

const buildStudy = () => ({
  id: 'study-1',
  testType: 'CARD_SORTING',
  testStructure: {
    welcomeMessage: '',
    finalMessage: '',
    consent: '',
    preTest: [],
    postTest: [],
    cardSorting: {
      cards: [{ title: 'Existing Card' }],
      categories: [{ title: 'Existing Category' }],
      options: {},
    },
  },
})

const mockStore = {
  getters: reactive({ test: null, preTest: [], postTest: [] }),
  dispatch: jest.fn(),
}

jest.mock('vuex', () => ({
  useStore: () => mockStore,
}))

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

jest.mock('@/shared/constants/methodDefinitions', () => ({
  instantiateStudyByType: jest.fn(),
}))

jest.mock('@/shared/components/buttons/ButtonSave.vue', () => ({
  __esModule: true,
  default: {
    props: ['visible'],
    emits: ['click'],
    template:
      '<button v-if="visible" class="save-button" type="button" @click="$emit(\'click\')">save</button>',
  },
}))

jest.mock('@/shared/views/template/PageWrapper.vue', () => ({
  __esModule: true,
  default: { template: '<div><slot name="subtitle" /><slot /></div>' },
}))

jest.mock('@/shared/components/TestConfigForm.vue', () => ({
  __esModule: true,
  default: { template: '<div class="test-config" />' },
}))

jest.mock('@/shared/components/TextareaForm.vue', () => ({
  __esModule: true,
  default: { template: '<div class="consent-form" />' },
}))

jest.mock('@/shared/components/UserVariables.vue', () => ({
  __esModule: true,
  default: { template: '<div class="user-variables" />' },
}))

const TAB = { TEST: 0, CATEGORIES: 3, CARDS: 4 }

const stubs = {
  VContainer: { template: '<div><slot /></div>' },
  VProgressCircular: { template: '<div />' },
  VTabs: { template: '<div><slot /></div>' },
  VTab: {
    emits: ['click'],
    template:
      '<button class="tab" type="button" @click="$emit(\'click\')"><slot /></button>',
  },
  VRow: { template: '<div><slot /></div>' },
  VCol: { template: '<div><slot /></div>' },
  VCard: { template: '<div><slot /></div>' },
  VCardTitle: { template: '<div><slot /></div>' },
  VCardText: { template: '<div><slot /></div>' },
  VIcon: { template: '<i><slot /></i>' },
  VCheckbox: { template: '<div />' },
  VDivider: { template: '<hr />' },
  VDataTable: {
    props: ['items'],
    template:
      '<ul><li v-for="item in items" :key="item.title" class="row-title">{{ item.title }}</li></ul>',
  },
  VBtn: {
    emits: ['click'],
    template:
      '<button type="button" @click="$emit(\'click\')"><slot /></button>',
  },
  CardSortingForm: true,
  CardSortingImportDialog: {
    props: ['dialog'],
    emits: ['import', 'update:dialog'],
    template:
      '<button v-if="dialog" class="import-dialog-trigger" type="button" @click="$emit(\'import\', [\'Checkout\', \'Search\'])">import-dialog</button>',
  },
}

const mountView = () =>
  mount(EditTestView, {
    global: {
      mocks: {
        $t: (key) => key,
        $vuetify: {
          theme: { current: { colors: { 'on-surface': '#111' } } },
        },
      },
      stubs,
    },
  })

const openTab = async (wrapper, index) => {
  await wrapper.findAll('.tab')[index].trigger('click')
}

const visibleTitles = (wrapper) =>
  wrapper.findAll('.row-title').map((row) => row.text())

const importTitles = async (wrapper) => {
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('CardSorting.import'))
    .trigger('click')
  await wrapper.find('.import-dialog-trigger').trigger('click')
}

describe('Card Sorting EditTestView - unsaved edits across tabs (#2525)', () => {
  beforeEach(() => {
    mockStore.getters.test = buildStudy()
    instantiateStudyByType.mockImplementation((_, raw) => raw)
  })

  it('does not mark the study as changed just by opening the editors', async () => {
    const wrapper = mountView()

    await openTab(wrapper, TAB.CARDS)
    await openTab(wrapper, TAB.CATEGORIES)

    expect(wrapper.find('.save-button').exists()).toBe(false)
  })

  it('keeps unsaved cards after switching to another tab and back', async () => {
    const wrapper = mountView()

    await openTab(wrapper, TAB.CARDS)
    expect(visibleTitles(wrapper)).toEqual(['Existing Card'])

    await importTitles(wrapper)
    expect(visibleTitles(wrapper)).toEqual([
      'Existing Card',
      'Checkout',
      'Search',
    ])

    await openTab(wrapper, TAB.TEST)
    expect(wrapper.find('.row-title').exists()).toBe(false)

    await openTab(wrapper, TAB.CARDS)
    expect(visibleTitles(wrapper)).toEqual([
      'Existing Card',
      'Checkout',
      'Search',
    ])
    expect(wrapper.find('.save-button').exists()).toBe(true)
  })

  it('keeps unsaved categories after switching to another tab and back', async () => {
    const wrapper = mountView()

    await openTab(wrapper, TAB.CATEGORIES)
    await importTitles(wrapper)

    await openTab(wrapper, TAB.CARDS)
    await openTab(wrapper, TAB.CATEGORIES)

    expect(visibleTitles(wrapper)).toEqual([
      'Existing Category',
      'Checkout',
      'Search',
    ])
  })

  it('keeps unsaved cards when the store study is refreshed in the background', async () => {
    const wrapper = mountView()

    await openTab(wrapper, TAB.CARDS)
    await importTitles(wrapper)

    mockStore.getters.test = buildStudy()
    await flushPromises()

    expect(visibleTitles(wrapper)).toEqual([
      'Existing Card',
      'Checkout',
      'Search',
    ])
  })

  it('saves the unsaved cards after a tab round-trip', async () => {
    const wrapper = mountView()

    await openTab(wrapper, TAB.CARDS)
    await importTitles(wrapper)
    await openTab(wrapper, TAB.TEST)
    await openTab(wrapper, TAB.CARDS)

    await wrapper.find('.save-button').trigger('click')
    await flushPromises()

    const [, savedStudy] = instantiateStudyByType.mock.calls.at(-1)
    expect(savedStudy.testStructure.cardSorting.cards).toEqual([
      { title: 'Existing Card' },
      { title: 'Checkout' },
      { title: 'Search' },
    ])
    expect(mockStore.dispatch).toHaveBeenCalledWith('updateStudy', savedStudy)
  })
})
