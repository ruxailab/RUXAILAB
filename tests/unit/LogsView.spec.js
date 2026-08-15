import { flushPromises, mount } from '@vue/test-utils'
import LogsView from '@/shared/views/LogsView.vue'
import {
  getParticipantLabels,
  getStudyLogCount,
  getStudyLogPage,
} from '@/shared/services/studyLogQuery'

jest.mock('vuetify', () => ({
  useDisplay: () => ({ smAndDown: false }),
}))

jest.mock('@/app/plugins/firebase', () => ({ db: {} }))

jest.mock('@/shared/services/studyLogQuery', () => ({
  getParticipantLabels: jest.fn(),
  getStudyLogCount: jest.fn(),
  getStudyLogPage: jest.fn(),
  localDateRange: jest.fn(() => ({})),
}))

const page = {
  events: [
    {
      eventType: 'STUDY_VIEW_OPENED',
      level: 'info',
      layer: 'methodological',
      message: 'Study view opened',
      participantLabel: 'P-001',
      occurredAt: new Date('2026-08-14T10:00:00.000Z'),
    },
  ],
  hasNextPage: false,
  lastCursor: null,
}

describe('LogsView', () => {
  it('falls back to the visible range when a forced count refresh fails', async () => {
    getParticipantLabels.mockResolvedValue([])
    getStudyLogPage.mockResolvedValue(page)
    getStudyLogCount
      .mockResolvedValueOnce(100)
      .mockRejectedValueOnce(new Error('count unavailable'))

    const wrapper = mount(LogsView, {
      props: { id: 'study-1' },
      global: {
        stubs: {
          VBtn: {
            emits: ['click'],
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('1–1 of 100')

    await wrapper
      .findAll('button')
      .find((button) => button.text().includes('Refresh'))
      .trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('1–1 shown')
    expect(wrapper.text()).not.toContain('1–1 of 100')
    wrapper.unmount()
  })
})
