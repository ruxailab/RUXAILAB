import { shallowMount } from '@vue/test-utils'
import HeuristicAnswerStep from '@/ux/Heuristic/components/steps/HeuristicAnswerStep.vue'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

describe('HeuristicAnswerStep logging fields', () => {
  it('uses the canonical study index when heuristics are displayed out of order', () => {
    const canonicalFirst = {
      id: 'first',
      title: 'First',
      questions: [{ id: 'first-question', title: 'First question' }],
    }
    const displayedFirst = {
      id: 'second',
      title: 'Second',
      questions: [{ id: 'second-question', title: 'Second question' }],
    }
    const wrapper = shallowMount(HeuristicAnswerStep, {
      props: {
        heuristic: displayedFirst,
        heuristics: [displayedFirst, canonicalFirst],
        heurisIndex: 0,
        currentUserTestAnswer: {
          heuristicQuestions: [{ heuristicQuestions: [{}] }],
        },
        test: {
          testStructure: [canonicalFirst, displayedFirst],
          testOptions: [],
        },
      },
      global: {
        mocks: { $t: (key) => key },
        stubs: {
          ShowInfo: { template: '<div><slot name="content" /></div>' },
          'v-btn': true,
          'v-divider': true,
          'v-icon': true,
        },
      },
    })

    expect(
      wrapper
        .find('heuristic-options-analysis-section-stub')
        .attributes('data-study-field-ref'),
    ).toBe('heuristic:1:question:0:answer')
    expect(
      wrapper
        .find('heuristic-comment-evidence-section-stub')
        .attributes('data-study-field-ref'),
    ).toBe('heuristic:1:question:0:comment')
  })
})
