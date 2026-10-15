import { shallowMount } from '@vue/test-utils'
import HeuristicWeightControl from '@/ux/Heuristic/components/steps/HeuristicWeightControl.vue'

const mountControl = (props = {}) =>
  shallowMount(HeuristicWeightControl, {
    props,
    global: {
      mocks: { $t: (key) => key },
      stubs: {
        'v-select': {
          name: 'WeightSelect',
          props: ['modelValue', 'items', 'disabled', 'errorMessages'],
          emits: ['update:modelValue'],
          template: '<select />',
        },
      },
    },
  })
describe('relative weight dropdown', () => {
  it('offers 1 to 10 and emits numeric selections', () => {
    const wrapper = mountControl()
    const select = wrapper.findComponent({ name: 'WeightSelect' })
    expect(select.props('items')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    select.vm.$emit('update:modelValue', 10)
    expect(wrapper.emitted('update:modelValue')).toEqual([[10]])
  })
  it.each([0, 11, 2.5])(
    'requires replacing a legacy value outside the scale: %s',
    (modelValue) => {
      const wrapper = mountControl({ modelValue })
      const select = wrapper.findComponent({ name: 'WeightSelect' })
      expect(select.props('modelValue')).toBeNull()
      expect(select.props('errorMessages')).toHaveLength(1)
      select.vm.$emit('update:modelValue', modelValue)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    },
  )
  it('preserves saved selections and disables submitted answers', () => {
    const wrapper = mountControl({ modelValue: 3, disabled: true })
    const select = wrapper.findComponent({ name: 'WeightSelect' })
    expect(select.props('modelValue')).toBe(3)
    expect(select.props('disabled')).toBe(true)
    select.vm.$emit('update:modelValue', 5)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
