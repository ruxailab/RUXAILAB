import { shallowMount } from '@vue/test-utils'
import HeuristicsTestAnswer from '@/ux/Heuristic/components/HeuristicsTestAnswer.vue'
import HeuristicsDataCard from '@/ux/Heuristic/components/statistics/HeuristicsDataCard.vue'
import {
  statistics,
  finalResult,
  calcFinalResult,
  standardDeviation,
  formatTimeSpentFromMs,
} from '@/ux/Heuristic/utils/statistics'

const mockReplace = jest.fn(() => Promise.resolve())
const mockRouteQuery = {}

jest.mock('vue-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  useRoute: () => ({ query: mockRouteQuery, params: {} }),
}))

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

jest.mock('vuex', () => ({
  useStore: () => ({
    state: {
      Answer: { evaluatorStatistics: { header: [], items: [] } },
      Tests: { Test: { testWeights: [] }, scoresPercentage: [] },
    },
    getters: {
      test: {
        id: 'test-1',
        testOptions: [
          { text: 'Yes', value: 1 },
          { text: 'No', value: 0 },
        ],
        testStructure: [],
        trackTime: true,
      },
      testAnswerDocument: { heuristicAnswers: {} },
    },
    dispatch: jest.fn(),
  }),
}))

jest.mock('@/ux/Heuristic/utils/statistics', () => ({
  statistics: jest.fn(),
  finalResult: jest.fn(),
  calcFinalResult: jest.fn(),
  standardDeviation: jest.fn(),
  formatTimeSpentFromMs: jest.fn(),
  buildHeuristicTestBundlePayload: jest.fn(),
  downloadHeuristicTestBundlePayload: jest.fn(),
}))

describe('HeuristicsTestAnswer - navigating to a heuristic from the results tab', () => {
  beforeEach(() => {
    mockReplace.mockResolvedValue(undefined)
    statistics.mockReturnValue([
      {
        id: 'Ev1',
        heuristics: [{ id: 'H1', result: 2.5, totalQuestions: 3 }],
      },
    ])
    finalResult.mockReturnValue({})
    calcFinalResult.mockReturnValue({})
    standardDeviation.mockReturnValue(0)
    formatTimeSpentFromMs.mockReturnValue('00:00')
  })

  it('switches to the Analytics tab and sets the heuristic query param instead of pushing a dead route', async () => {
    const wrapper = shallowMount(HeuristicsTestAnswer, {
      global: {
        mocks: { $t: (key) => key },
        stubs: {
          ShowInfo: {
            template: '<div><slot name="top" /><slot name="content" /></div>',
          },
        },
      },
    })

    // Switch to the "Heuristics" tab (3rd tab) so HeuristicsDataCard renders.
    const tabs = wrapper.findAll('v-tab')
    await tabs[2].trigger('click')

    const dataCard = wrapper.findComponent(HeuristicsDataCard)
    expect(dataCard.exists()).toBe(true)

    dataCard.vm.$emit('go-to-heuristic', 'H1')
    await wrapper.vm.$nextTick()

    expect(mockReplace).toHaveBeenCalledWith({
      query: { heuristic: 0 },
    })

    // The Heuristics data card should be swapped out for Analytics.
    expect(wrapper.findComponent(HeuristicsDataCard).exists()).toBe(false)
  })
})
