import { shallowMount } from '@vue/test-utils'
import HeuristicAnswerStep from '@/ux/Heuristic/components/steps/HeuristicAnswerStep.vue'
import HeuristicOptionsAnalysisSection from '@/ux/Heuristic/components/steps/HeuristicOptionsAnalysisSection.vue'

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

    const options = wrapper.findComponent(HeuristicOptionsAnalysisSection)
    expect(options.attributes('data-study-field-ref')).toBe(
      'heuristic:1:question:0:answer',
    )
    expect(
      wrapper
        .find('heuristic-comment-evidence-section-stub')
        .attributes('data-study-field-ref'),
    ).toBe('heuristic:1:question:0:comment')

    options.vm.$emit('update-metric', 'severity', 2)
    expect(wrapper.emitted('response-change')).toEqual([
      ['heuristic:1:question:0', 'severity'],
    ])
  })
})

describe('evaluation modes', () => {
  it.each(['traditional', 'weights', 'detailed'])(
    'renders %s at the correct level',
    (studyMode) => {
      const heuristic = {
        id: 'h',
        title: 'Heuristic title',
        description: 'Heuristic description',
        questions: [
          { id: 'q1', title: 'Question one' },
          { id: 'q2', title: 'Question two' },
        ],
      }
      const wrapper = shallowMount(HeuristicAnswerStep, {
        props: {
          heuristic,
          heuristics: [heuristic],
          heurisIndex: 0,
          currentUserTestAnswer: {
            heuristicQuestions: [{ heuristicQuestions: [{}, {}] }],
          },
          test: { studyMode, testOptions: [{ text: 'Yes', value: 1 }] },
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
      expect(wrapper.find('.question-side-menu').exists()).toBe(
        studyMode === 'detailed',
      )
      expect(wrapper.emitted('update-answer')).toHaveLength(
        studyMode === 'detailed' ? 2 : 1,
      )
      const options = wrapper.findComponent(HeuristicOptionsAnalysisSection)
      expect(options.props('selectedAnswerMode')).toBe(
        {
          traditional: 'frequencySeverity',
          weights: 'weight',
          detailed: 'customOptions',
        }[studyMode],
      )
      if (studyMode !== 'detailed') {
        expect(wrapper.text()).toContain('Heuristic description')
        expect(wrapper.text()).not.toContain('Question one')
      }
      if (studyMode === 'weights') {
        options.vm.$emit('update-metric', 'weight', 2.5)
        expect(wrapper.emitted('update-answer').at(-1)[1]).toMatchObject({
          mode: 'weight',
          weight: 2.5,
          value: 2.5,
        })
      }
    },
  )
})
