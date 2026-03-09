jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import UsabilityResults from '@/ux/Heuristic/components/manager/UsabilityResults.vue'

const baseTest = {
  id: 'test-1',
  cooperators: [{ id: 'c1' }],
  testOptions: [{ value: 1 }, { value: 5 }],
}

const buildDocument = (evaluatorAnswers) => ({
  heuristicAnswers: evaluatorAnswers,
})

const evaluatorFromAnswers = (answers) => ({
  heuristicQuestions: [
    {
      heuristicQuestions: answers.map((answer) => ({
        heuristicAnswer: answer,
      })),
    },
  ],
})

const mountComponent = ({
  testAnswerDocument = null,
  testProp = baseTest,
} = {}) => {
  const store = createStore({
    getters: {
      testAnswerDocument: () => testAnswerDocument,
      test: () => ({ testOptions: testProp?.testOptions || [] }),
    },
  })

  return shallowMount(UsabilityResults, {
    props: { test: testProp },
    global: {
      plugins: [store],
      mocks: {
        $t: (key) => key,
      },
      stubs: {
        'v-card': { template: '<div><slot /></div>' },
        'v-card-title': { template: '<div><slot /></div>' },
        'v-icon': { template: '<span><slot /></span>' },
        'v-progress-circular': {
          props: ['modelValue'],
          template: '<div><slot /></div>',
        },
      },
    },
  })
}

describe('UsabilityResults.vue', () => {
  it('shows 0% when testAnswerDocument is missing', () => {
    const wrapper = mountComponent({ testAnswerDocument: null })

    expect(wrapper.text()).toContain('0%')
  })

  it('shows 0% when heuristicAnswers is empty', () => {
    const wrapper = mountComponent({
      testAnswerDocument: buildDocument({}),
    })

    expect(wrapper.text()).toContain('0%')
  })

  it('shows 0% when testOptions is missing', () => {
    const wrapper = mountComponent({
      testAnswerDocument: buildDocument({
        evaluator1: evaluatorFromAnswers([{ value: 5 }, { value: 4 }]),
      }),
      testProp: {
        id: 'test-1',
        cooperators: [],
      },
    })

    expect(wrapper.text()).toContain('0%')
  })

  it('shows the correct calculated percentage for valid evaluator data', () => {
    const wrapper = mountComponent({
      testAnswerDocument: buildDocument({
        evaluator1: evaluatorFromAnswers([
          { value: 5 },
          { value: 4 },
          { value: 3 },
          { value: 2 },
        ]),
      }),
    })

    expect(wrapper.text()).toContain('70%')
  })

  it('shows the correct average for mixed evaluators with N/A values', () => {
    const wrapper = mountComponent({
      testAnswerDocument: buildDocument({
        evaluator1: evaluatorFromAnswers([
          { value: 5 },
          { value: -1 },
          { value: 3 },
        ]),
        evaluator2: evaluatorFromAnswers([2, 2, 2]),
      }),
    })

    expect(wrapper.text()).toContain('60%')
  })

  it('shows 0% when all answers are N/A and avoids NaN/Infinity', () => {
    const wrapper = mountComponent({
      testAnswerDocument: buildDocument({
        evaluator1: evaluatorFromAnswers([{ value: -1 }, { value: -1 }]),
        evaluator2: evaluatorFromAnswers([-1]),
      }),
    })

    const text = wrapper.text()
    expect(text).toContain('0%')
    expect(text).not.toContain('NaN')
    expect(text).not.toContain('Infinity')
  })
})
