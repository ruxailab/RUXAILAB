import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import SessionAnnotationsList from '@/ux/UserTest/components/sessions/SessionAnnotationsList.vue'

const slot = { template: '<div><slot /></div>' }
const button = {
  inheritAttrs: false,
  props: ['disabled'],
  emits: ['click'],
  template:
    '<button :data-testid="$attrs[\'data-testid\']" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
}
const textField = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en: {} },
})

const markers = [{ id: 'm1', time: 30, comment: 'Clicks logo' }]
const segments = [
  { id: 's1', startTime: 12, endTime: 20, comment: 'Scrolls around' },
]

const mountList = (props = {}) =>
  mount(SessionAnnotationsList, {
    props: { markers, segments, currentTime: 0, ...props },
    global: {
      plugins: [i18n],
      stubs: {
        'v-alert': slot,
        'v-chip': slot,
        'v-icon': true,
        'v-btn': button,
        'v-text-field': textField,
      },
    },
  })

describe('SessionAnnotationsList', () => {
  it('lists points and segments chronologically', () => {
    const wrapper = mountList()
    const items = wrapper.findAll('.annotation-item')

    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Scrolls around')
    expect(items[1].text()).toContain('Clicks logo')
  })

  it('highlights the annotation under the playhead', () => {
    const wrapper = mountList({ currentTime: 15 })

    expect(wrapper.find('[data-testid="annotation-s1"]').classes()).toContain(
      'annotation-item--active',
    )
    expect(
      wrapper.find('[data-testid="annotation-m1"]').classes(),
    ).not.toContain('annotation-item--active')
  })

  it('seeks to an annotation when it is clicked', async () => {
    const wrapper = mountList()

    await wrapper.find('[data-testid="annotation-m1"]').trigger('click')

    expect(wrapper.emitted('seek')).toEqual([[30]])
  })

  it('edits a comment inline and saves it with Enter', async () => {
    const wrapper = mountList()

    await wrapper.find('[data-testid="annotation-edit-m1"]').trigger('click')
    const input = wrapper.find('[data-testid="annotation-edit-input"]')
    await input.setValue('Clicks the logo twice')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update')).toEqual([
      [
        {
          type: 'marker',
          item: markers[0],
          comment: 'Clicks the logo twice',
        },
      ],
    ])
    expect(wrapper.find('[data-testid="annotation-edit-input"]').exists()).toBe(
      false,
    )
    expect(wrapper.emitted('seek')).toBeUndefined()
  })

  it('cancels an edit with Escape without saving', async () => {
    const wrapper = mountList()

    await wrapper.find('[data-testid="annotation-edit-s1"]').trigger('click')
    const input = wrapper.find('[data-testid="annotation-edit-input"]')
    await input.setValue('Changed')
    await input.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update')).toBeUndefined()
    expect(wrapper.find('[data-testid="annotation-edit-input"]').exists()).toBe(
      false,
    )
  })
})
