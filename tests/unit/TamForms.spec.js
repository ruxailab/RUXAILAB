import { shallowMount } from '@vue/test-utils'
import TamForm3 from '@/ux/UserTest/components/TamForm3.vue'

const tam3Sizes = {
  perceivedUsefulness: 3,
  perceivedEaseOfUse: 3,
  behavioralIntention: 2,
  usePatterns: 2,
  subjectiveNorm: 3,
  image: 2,
  jobRelevance: 3,
  outputQuality: 3,
  resultDemonstrability: 2,
  computerSelfEfficacy: 3,
  perceptionsOfExternalControl: 3,
  computerAnxiety: 2,
  computerPlayfulness: 2,
  perceivedEnjoyment: 3,
  objectiveUsability: 2,
  experience: 2,
  voluntariness: 2,
}

describe('TamForm3', () => {
  it('counts all 42 rendered controls in progress', () => {
    const modelValue = Object.fromEntries(
      Object.entries(tam3Sizes).map(([key, size]) => [
        key,
        Array(size).fill(1),
      ]),
    )
    const wrapper = shallowMount(TamForm3, {
      props: { taskIndex: 0, modelValue },
    })

    expect(wrapper.vm.completedCount).toBe(42)
    expect(wrapper.text()).toContain('42/42')
    expect(wrapper.text()).not.toContain('38')
  })

  it('updates a later response without shifting its position', () => {
    const wrapper = shallowMount(TamForm3, {
      props: { taskIndex: 0 },
    })

    wrapper.vm.updateDimensionAnswer('perceivedEnjoyment', 2, 5)

    expect(wrapper.emitted('update:modelValue')[0][0]).toMatchObject({
      perceivedEnjoyment: [undefined, undefined, 5],
    })
    expect(wrapper.emitted('response-changed')).toEqual([
      [{ itemRef: 'tam-3:perceivedEnjoyment:2', value: 5 }],
    ])
  })
})
