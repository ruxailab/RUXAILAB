import { mount } from '@vue/test-utils'
import VideoToolDrawer from '@/shared/components/videoCall/VideoToolDrawer.vue'

const mountDrawer = () =>
  mount(VideoToolDrawer, {
    props: { modelValue: true, title: 'Tools Panel' },
    slots: { default: '<textarea class="notes" />' },
    global: {
      stubs: {
        'v-navigation-drawer': {
          props: ['permanent'],
          template:
            '<aside :data-permanent="permanent === true || permanent === \'\'"><slot /></aside>',
        },
        'v-btn': { template: '<button v-bind="$attrs"><slot /></button>' },
        'v-icon': { template: '<i />' },
      },
    },
  })

it('keeps the tool drawer interactive on narrow screens', () => {
  const wrapper = mountDrawer()

  // Without permanent, Vuetify marks a drawer inert below its breakpoint,
  // which blocks the close button and typing in notes.
  expect(wrapper.find('aside').attributes('data-permanent')).toBe('true')
})

it('closes from the header button', async () => {
  const wrapper = mountDrawer()

  await wrapper.find('.close-btn').trigger('click')

  expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  expect(wrapper.emitted('close')).toHaveLength(1)
})
