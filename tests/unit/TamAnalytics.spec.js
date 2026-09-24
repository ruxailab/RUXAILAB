import { nextTick, reactive } from 'vue'
import { shallowMount } from '@vue/test-utils'

const mockStore = {
  getters: reactive({
    test: {
      testStructure: {
        userTasks: [{ taskType: 'tam-3' }],
      },
    },
    visibleUserAnswers: {},
  }),
}

jest.mock('vuex', () => ({
  useStore: () => mockStore,
}))
jest.mock('vue-chartjs', () => ({
  Scatter: { template: '<div />' },
}))

const TamAnalytics =
  require('@/ux/UserTest/components/UnmoderatedTestAnalytics/TamAnalytics.vue').default
const { calculateTAMScore } = require('@/ux/UserTest/utils/tamCalculator')

describe('TamAnalytics', () => {
  beforeEach(() => {
    mockStore.getters.visibleUserAnswers = {}
  })

  it('excludes all-null TAM tasks but keeps sparse numeric answers', async () => {
    mockStore.getters.visibleUserAnswers = {
      participant: {
        tasks: [
          {
            tamAnswers: {
              perceivedEnjoyment: [null, null, null],
            },
          },
        ],
      },
    }
    const wrapper = shallowMount(TamAnalytics)
    expect(wrapper.vm.tamData).toEqual([])

    mockStore.getters.visibleUserAnswers = {
      participant: {
        tasks: [
          {
            tamAnswers: {
              perceivedEnjoyment: [null, null, 5],
            },
          },
        ],
      },
    }
    await nextTick()
    expect(wrapper.vm.tamData).toHaveLength(1)

    wrapper.vm.selectedResponse = {
      tamAnswers: {
        perceivedEnjoyment: [null, null, 5],
        actualSystemUse: [0, 0],
      },
    }
    const enjoyment = wrapper.vm.getConstructAnswers('tam3_enj')
    expect(enjoyment).toEqual([
      {
        question: 'Using the technology is entertaining',
        answer: 5,
      },
    ])
    expect(wrapper.vm.getConstructAnswers('tam1_use')).toEqual([
      { answer: 'Less than once a month' },
      { answer: '0 hours' },
    ])
    wrapper.unmount()
  })


  it('scores sparse and null-padded TAM answers identically', () => {
    const sparse = { perceivedEnjoyment: [,, 5] }
    const padded = { perceivedEnjoyment: [null, null, 5] }

    expect(calculateTAMScore(sparse, 'tam-3')).toEqual(
      calculateTAMScore(padded, 'tam-3'),
    )
  })

})
