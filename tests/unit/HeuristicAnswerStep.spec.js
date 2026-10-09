import { shallowMount } from '@vue/test-utils'
import HeuristicAnswerStep from '@/ux/Heuristic/components/steps/HeuristicAnswerStep.vue'
import HeuristicCustomOptionsControl from '@/ux/Heuristic/components/steps/HeuristicCustomOptionsControl.vue'
import HeuristicOptionsAnalysisSection from '@/ux/Heuristic/components/steps/HeuristicOptionsAnalysisSection.vue'
import HeuristicResponseControl from '@/ux/Heuristic/components/steps/HeuristicResponseControl.vue'
import HeuristicAnswer from '@/ux/Heuristic/models/HeuristicAnswer'
import Heuristic from '@/ux/Heuristic/models/Heuristic'
import HeuristicQuestionAnswer from '@/ux/Heuristic/models/HeuristicQuestionAnswer'

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
          testTitle: 'Study Alpha',
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

    expect(wrapper.find('.answer-study-name').text()).toBe('Study Alpha')

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

describe('heuristic response option order', () => {
  const options = [
    { text: 'Second', value: 2 },
    { text: 'First', value: 1 },
  ]

  it('preserves the configured order of custom options', () => {
    const wrapper = shallowMount(HeuristicCustomOptionsControl, {
      props: { options },
      global: {
        mocks: { $t: (key) => key },
      },
    })

    expect(
      wrapper.findAll('.option-card').map((option) => option.text()),
    ).toEqual(['Second', 'First'])
  })

  it('sorts traditional scale options when requested', () => {
    const wrapper = shallowMount(HeuristicResponseControl, {
      props: {
        label: 'Frequency',
        metric: 'frequency',
        options,
        sortOptions: true,
      },
    })

    expect(
      wrapper.findAll('.option-number').map((option) => option.text()),
    ).toEqual(['1', '2'])
  })

  it('preserves response option order when sorting is disabled', () => {
    const wrapper = shallowMount(HeuristicResponseControl, {
      props: { label: 'Frequency', metric: 'frequency', options },
    })

    expect(
      wrapper.findAll('.option-number').map((option) => option.text()),
    ).toEqual(['2', '1'])
  })
})

describe('HeuristicAnswer Firestore serialization', () => {
  it('removes undefined fields from nested payload objects', () => {
    const answer = new HeuristicAnswer({
      heuristicQuestions: [
        new Heuristic({
          heuristicQuestions: [
            new HeuristicQuestionAnswer({
              heuristicAnswer: {
                mode: 'customOptions',
                custom: { text: 'Yes', value: undefined },
                metadata: [undefined],
              },
            }),
          ],
        }),
      ],
    })

    const serialized = answer.toFirestore()
    const question = serialized.heuristicQuestions[0].heuristicQuestions[0]

    expect(question).not.toHaveProperty('heuristicId')
    expect(question.heuristicAnswer.custom).toEqual({ text: 'Yes' })
    expect(question.heuristicAnswer.metadata).toEqual([null])
  })
})
