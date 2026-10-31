import { mount } from '@vue/test-utils'
import CardSortingImportDialog from '@/ux/CardSorting/components/dialogs/CardSortingImportDialog.vue'
import CardSortingImportFilePanel from '@/ux/CardSorting/components/dialogs/import/CardSortingImportFilePanel.vue'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
  }),
}))

const mountDialog = (props = {}) =>
  mount(CardSortingImportDialog, {
    props: {
      dialog: true,
      type: 'card',
      ...props,
    },
    global: {
      mocks: {
        $t: (key, params) =>
          params ? `${key}:${JSON.stringify(params)}` : key,
      },
      stubs: {
        'v-dialog': {
          props: ['modelValue'],
          template: '<div v-if="modelValue" class="dialog-stub"><slot /></div>',
        },
        'v-card': { template: '<div><slot /></div>' },
        'v-card-title': { template: '<div><slot /></div>' },
        'v-card-text': { template: '<div><slot /></div>' },
        'v-card-actions': { template: '<div><slot /></div>' },
        'v-icon': { template: '<i><slot /></i>' },
        'v-chip': { template: '<span class="chip-stub"><slot /></span>' },
        'v-tabs': { template: '<div class="tabs-stub"><slot /></div>' },
        'v-tab': {
          props: ['value'],
          emits: ['click'],
          template:
            '<button type="button" class="tab-stub" @click="$emit(\'click\')"><slot /></button>',
        },
        'v-window': { template: '<div><slot /></div>' },
        'v-window-item': { template: '<div><slot /></div>' },
        'v-textarea': {
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template:
            '<textarea class="import-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
        'v-btn': {
          props: ['disabled', 'loading'],
          emits: ['click'],
          template:
            '<button type="button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })

describe('CardSortingImportDialog', () => {
  it('shows the updated hint and text/file tabs', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('CardSorting.importCardsHint')
    expect(wrapper.text()).toContain('CardSorting.importTabText')
    expect(wrapper.text()).toContain('CardSorting.importTabFile')
    expect(wrapper.text()).toContain('CardSorting.importTextLabelCards')
    expect(wrapper.find('.paste-btn').exists()).toBe(true)
    expect(wrapper.find('.example-csv-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('CardSorting.importFileExample')
  })

  it('shows the category label when importing categories', () => {
    const wrapper = mountDialog({ type: 'category' })

    expect(wrapper.text()).toContain('CardSorting.importTextLabelCategories')
  })

  it('pastes clipboard text into the text input', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        readText: jest.fn().mockResolvedValue('Checkout\nSearch'),
      },
    })

    const wrapper = mountDialog()
    await wrapper.find('.paste-btn').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.import-input').element.value).toBe(
      'Checkout\nSearch',
    )
  })

  it('emits one title per pasted line when importing cards', async () => {
    const wrapper = mountDialog()
    const input = wrapper.find('.import-input')
    await input.setValue('Checkout\nSearch\nProfile')

    const buttons = wrapper.findAll('button')
    await buttons.at(-1).trigger('click')

    expect(wrapper.emitted('import').at(-1)).toEqual([
      ['Checkout', 'Search', 'Profile'],
    ])
    expect(wrapper.emitted('update:dialog').at(-1)).toEqual([false])
  })

  it('does not import when every line is empty', async () => {
    const wrapper = mountDialog({ type: 'category' })
    await wrapper.find('.import-input').setValue('  \n\n')

    await wrapper.findAll('button').at(-1).trigger('click')

    expect(wrapper.emitted('import')).toBeUndefined()
  })

  it('imports titles from an uploaded txt file', async () => {
    const wrapper = mountDialog()
    const file = {
      name: 'cards.txt',
      text: async () => 'Checkout\nSearch\nProfile',
    }

    wrapper.vm.activeTab = 'file'
    const filePanel = wrapper.findComponent(CardSortingImportFilePanel)
    await filePanel.vm.applyFile(file)
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('button')
    await buttons.at(-1).trigger('click')

    expect(wrapper.emitted('import').at(-1)).toEqual([
      ['Checkout', 'Search', 'Profile'],
    ])
  })
})
