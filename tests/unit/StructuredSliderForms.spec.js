import { shallowMount } from '@vue/test-utils'
import nasaTlxForm from '@/ux/UserTest/components/nasaTlxForm.vue'
import sartForm from '@/ux/UserTest/components/sartForm.vue'

const SliderStub = {
  name: 'SliderStub',
  props: {
    modelValue: {
      type: [Number, null],
      default: null,
    },
  },
  emits: ['start', 'update:modelValue', 'end', 'focus', 'blur'],
  template: '<div />',
}

const sliderGlobal = {
  stubs: {
    'v-slider': SliderStub,
  },
}

describe('structured slider forms', () => {
  it('forwards NASA-TLX pointer values from slider events', () => {
    const wrapper = shallowMount(nasaTlxForm, {
      props: {
        nasaTlx: {
          mentalDemand: 0,
          physicalDemand: 0,
          temporalDemand: 0,
          performance: 0,
          effort: 0,
          frustration: 0,
        },
      },
      global: sliderGlobal,
    })
    const slider = wrapper.findComponent(SliderStub)

    slider.vm.$emit('start', 35)
    slider.vm.$emit('end', 65)

    expect(wrapper.emitted('slider-start')).toEqual([
      [{ itemRef: 'mentalDemand', value: 35 }],
    ])
    expect(wrapper.emitted('slider-end')).toEqual([
      [{ itemRef: 'mentalDemand', value: 65 }],
    ])
    wrapper.unmount()
  })

  it('forwards SART pointer values from slider events', () => {
    const wrapper = shallowMount(sartForm, {
      props: { sart: {} },
      global: sliderGlobal,
    })
    const slider = wrapper.findComponent(SliderStub)

    slider.vm.$emit('start', 2)
    slider.vm.$emit('end', 6)

    expect(wrapper.emitted('slider-start')).toEqual([
      [{ itemRef: 'instability', value: 2 }],
    ])
    expect(wrapper.emitted('slider-end')).toEqual([
      [{ itemRef: 'instability', value: 6 }],
    ])
    wrapper.unmount()
  })
})
