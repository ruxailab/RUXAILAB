import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import SusAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/SusAnalytics.vue'

jest.mock('vuex', () => ({
  useStore: jest.fn(),
}))

jest.mock('vue-i18n', () => ({
  useI18n: jest.fn(),
}))

// Odd items (positive) answered 5, even items (negative) answered 1, 1, 1, 2, 3.
// SUS = ((5 - 1) * 5 + (5 - 1) * 3 + (5 - 2) + (5 - 3)) * 2.5 = 92.5
const SUS_ANSWERS = [5, 1, 5, 1, 5, 1, 5, 2, 5, 3]

const mountSusAnalytics = () => {
  useStore.mockReturnValue({
    getters: {
      visibleUserAnswers: {
        participant: {
          fullName: 'Participant One',
          tasks: { 0: { susAnswers: SUS_ANSWERS } },
        },
      },
    },
  })
  useI18n.mockReturnValue({ t: (key) => key, locale: ref('en') })

  return mount(SusAnalytics, {
    global: {
      mocks: { $t: (key) => key },
      stubs: { SusHistogramChart: true, SusRatingChart: true },
    },
  })
}

describe('SusAnalytics response details dialog', () => {
  it('shows the response score and its translated rating', async () => {
    const wrapper = mountSusAnalytics()
    const [response] = wrapper.vm.filteredResponses

    expect(response.susScore).toBe(92.5)

    wrapper.vm.openDetailsModal(response)
    await wrapper.vm.$nextTick()

    const dialog = wrapper.findAll('v-dialog')[0]
    const finalScore = dialog.find('.text-h4')
    expect(finalScore.exists()).toBe(true)
    expect(finalScore.text()).toBe('92.5')
    expect(dialog.find('v-chip').text()).toBe('analytics.sus.ratings.excellent')
  })
})
