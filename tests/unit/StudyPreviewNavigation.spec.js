import { shallowMount } from '@vue/test-utils'
import StudyPreviewNavigation from '@/shared/components/StudyPreviewNavigation.vue'
import PreTestStep from '@/shared/components/steps/PreTestStep.vue'
import PostTestStep from '@/shared/components/steps/PostTestStep.vue'

it('disables the preview controls at boundaries and during loading', async () => {
  const wrapper = shallowMount(StudyPreviewNavigation, {
    props: { canNext: true },
    global: {
      mocks: { $t: (key) => key },
      stubs: {
        VBtn: {
          props: ['disabled'],
          template: '<button :disabled="disabled"><slot /></button>',
        },
      },
    },
  })
  const [previous, next] = wrapper.findAll('button')
  expect(wrapper.classes()).toContain('bg-secondary')
  expect(wrapper.find('nav').classes()).toEqual(
    expect.arrayContaining(['bg-secondary', 'text-white']),
  )
  expect(previous.element.disabled).toBe(true)
  await previous.trigger('click')
  expect(wrapper.emitted('previous')).toBeUndefined()
  await next.trigger('click')
  expect(wrapper.emitted('next')).toHaveLength(1)
  await wrapper.setProps({ canPrevious: true, canNext: false })
  await previous.trigger('click')
  expect(wrapper.emitted('previous')).toHaveLength(1)
  expect(next.element.disabled).toBe(true)
  await wrapper.setProps({ disabled: true, canNext: true })
  expect(previous.element.disabled).toBe(true)
  expect(next.element.disabled).toBe(true)
  wrapper.unmount()
})

describe.each([
  [PreTestStep, 'preTest', 'preTestAnswer'],
  [PostTestStep, 'postTest', 'postTestAnswer'],
])('%s preview questions', (component, questionsProp, answersProp) => {
  it.each([false, true])(
    'allows empty-question navigation only in preview (preview: %s)',
    async (preview) => {
      const answers = [{ answer: '' }, { answer: '' }]
      const wrapper = shallowMount(component, {
        props: {
          preview,
          [questionsProp]: [{ title: 'One' }, { title: 'Two' }],
          [answersProp]: answers,
        },
        global: { mocks: { $t: (key) => key } },
      })
      expect(wrapper.vm.movePreviewQuestion(-1)).toBe(false)
      expect(wrapper.vm.movePreviewQuestion(1)).toBe(preview)
      expect(wrapper.vm.$.setupState.step).toBe(preview ? 1 : 0)
      wrapper.vm.showLastPreviewQuestion()
      expect(wrapper.vm.$.setupState.step).toBe(preview ? 1 : 0)
      expect(wrapper.vm.movePreviewQuestion(1)).toBe(false)
      if (preview) {
        expect(wrapper.vm.movePreviewQuestion(-1)).toBe(true)
        expect(wrapper.vm.$.setupState.step).toBe(0)
      }
      expect(wrapper.emitted('done')).toBeUndefined()
      expect(wrapper.emitted(`update:${answersProp}`)).toBeUndefined()
      expect(answers).toEqual([{ answer: '' }, { answer: '' }])
      wrapper.unmount()
    },
  )
})
