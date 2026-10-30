import { config, flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/app/plugins/locales/en.json'
import { useDisplay } from 'vuetify'
import LogsView from '@/shared/views/LogsView.vue'
import {
  getParticipantLabels,
  getStudyLogCount,
  getStudyLogPage,
} from '@/shared/services/studyLogQuery'

config.global.plugins = [
  createI18n({ legacy: false, locale: 'en', messages: { en } }),
]

jest.mock('vuetify', () => ({
  useDisplay: jest.fn(() => ({ smAndDown: false, xs: { value: false } })),
}))
jest.mock('vuex', () => ({
  useStore: () => ({
    getters: { test: { testTitle: 'Study', testType: 'HEURISTIC' } },
  }),
}))
jest.mock('@/app/plugins/firebase', () => ({ db: {} }))
jest.mock('@/shared/services/studyLogQuery', () => ({
  getParticipantEvents: jest.fn(),
  getParticipantLabels: jest.fn(),
  getStudyLogCount: jest.fn(),
  getStudyLogPage: jest.fn(),
  localDateRange: jest.fn(() => ({})),
}))

const OverviewStub = {
  name: 'StudyLogOverview',
  props: ['studyId'],
  emits: ['filter', 'select'],
  template: '<div data-test="overview" />',
}

describe('LogsView overview', () => {
  it('opens the event list with the filter an overview card asks for', async () => {
    useDisplay.mockReturnValue({ smAndDown: false, xs: { value: false } })
    getParticipantLabels.mockResolvedValue([])
    getStudyLogPage.mockResolvedValue({
      events: [],
      hasNextPage: false,
      lastCursor: null,
    })
    getStudyLogCount.mockResolvedValue(0)

    const wrapper = mount(LogsView, {
      props: { id: 'study-1' },
      global: {
        stubs: {
          StudyLogOverview: OverviewStub,
          LogExportDialog: { template: '<div />' },
          VBtnToggle: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
              '<button data-test="show-overview" @click="$emit(\'update:modelValue\', \'overview\')" />',
          },
        },
      },
    })
    await flushPromises()

    await wrapper.find('[data-test="show-overview"]').trigger('click')
    const overview = wrapper.findComponent(OverviewStub)
    expect(overview.props('studyId')).toBe('study-1')

    overview.vm.$emit('filter', { level: 'warning' })
    await flushPromises()

    expect(getStudyLogPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: { level: 'warning' } }),
    )
    expect(wrapper.find('[data-test="overview"]').exists()).toBe(false)
    expect(wrapper.find('#log-events-heading').exists()).toBe(true)
    wrapper.unmount()
  })
})
