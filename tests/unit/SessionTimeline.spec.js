import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SessionTimeline from '@/ux/UserTest/components/sessions/SessionTimeline.vue'

const slot = { template: '<div><slot /></div>' }
const menu = {
  props: ['modelValue'],
  template:
    '<div><slot name="activator" :props="{}" /><div v-if="modelValue"><slot /></div></div>',
}
const focusable = (tag) => ({
  inheritAttrs: false,
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: `<${tag} ref="el" :class="$attrs.class" />`,
  methods: {
    focus() {
      this.$refs.el.focus()
    },
  },
})

const mountTimeline = (props = {}) =>
  mount(SessionTimeline, {
    attachTo: document.body,
    props: { duration: 100, currentTime: 12, ...props },
    global: {
      mocks: { $t: (key) => key },
      stubs: {
        'v-card': slot,
        'v-menu': menu,
        'v-btn': slot,
        'v-icon': true,
        'v-chip': slot,
        'v-textarea': focusable('textarea'),
        'v-text-field': focusable('input'),
        'v-tooltip': {
          template: '<div><slot name="activator" :props="{}" /></div>',
        },
      },
    },
  })

describe('SessionTimeline', () => {
  it('focuses the comment field when adding a point of interest', async () => {
    const wrapper = mountTimeline()
    wrapper.vm.openAddMenu()
    await nextTick()
    await nextTick()

    expect(document.activeElement.tagName).toBe('TEXTAREA')
    wrapper.unmount()
  })

  it('focuses the comment field when starting a segment', async () => {
    const wrapper = mountTimeline()
    wrapper.vm.setSegmentStart()
    await nextTick()
    await nextTick()

    expect(document.activeElement.tagName).toBe('INPUT')
    wrapper.unmount()
  })

  it('draws silences and seeks to their start', async () => {
    const wrapper = mountTimeline({ silences: [{ start: 20, end: 30 }] })
    const band = wrapper.get('[data-testid="timeline-silence"]')

    expect(band.attributes('style')).toContain('left: 20%')
    expect(band.attributes('style')).toContain('width: 10%')
    await band.trigger('click')
    expect(wrapper.emitted('seek')).toEqual([[20]])
    wrapper.unmount()
  })
})
