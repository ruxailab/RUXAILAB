import { flushPromises, mount } from '@vue/test-utils'
import StudyLogOverview from '@/shared/components/logs/StudyLogOverview.vue'
import { getStudyLogOverview } from '@/shared/services/studyLogOverview'

jest.mock('@/app/plugins/firebase', () => ({ db: {} }))
jest.mock('@/shared/services/studyLogOverview', () => ({
  getStudyLogOverview: jest.fn(),
}))

const overview = {
  sessions: 12,
  submittedSessions: 9,
  events: 1234,
  warnings: 3,
  errors: 1,
  latestEvents: [
    {
      rowKey: 'log-1',
      eventType: 'STUDY_SUBMITTED',
      level: 'info',
      participantLabel: 'P-009',
      occurredAt: new Date('2026-08-14T10:00:00.000Z'),
    },
  ],
}

const mountOverview = () =>
  mount(StudyLogOverview, {
    props: {
      studyId: 'study-1',
      eventPresentation: (event) => ({ primary: `Shown ${event.eventType}` }),
    },
    global: {
      stubs: {
        VBtn: {
          emits: ['click'],
          template: '<button @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })

describe('StudyLogOverview', () => {
  it('loads counts for the study', async () => {
    getStudyLogOverview.mockResolvedValue(overview)
    const wrapper = mountOverview()
    await flushPromises()

    expect(getStudyLogOverview).toHaveBeenCalledWith({
      db: {},
      studyId: 'study-1',
    })
    const values = Object.fromEntries(
      wrapper
        .findAll('[data-kpi]')
        .map((card) => [
          card.attributes('data-kpi'),
          card.find('.kpi-card__value').text(),
        ]),
    )
    expect(values).toEqual({
      sessions: '12',
      submitted: '9',
      events: (1234).toLocaleString(),
      warnings: '3',
      errors: '1',
    })
    expect(wrapper.text()).toContain('Shown STUDY_SUBMITTED')
    expect(wrapper.text()).toContain('P-009')
  })

  it('opens the Log Explorer with the filter behind each card', async () => {
    getStudyLogOverview.mockResolvedValue(overview)
    const wrapper = mountOverview()
    await flushPromises()

    for (const key of ['submitted', 'events', 'warnings', 'errors']) {
      await wrapper.find(`[data-kpi="${key}"]`).trigger('click')
    }

    expect(wrapper.emitted('filter')).toEqual([
      [{ eventType: 'STUDY_SUBMITTED' }],
      [{}],
      [{ level: 'warning' }],
      [{ level: 'error' }],
    ])
    expect(wrapper.find('[data-kpi="sessions"]').element.tagName).toBe('DIV')
  })

  it('opens a latest event in the detail drawer', async () => {
    getStudyLogOverview.mockResolvedValue(overview)
    const wrapper = mountOverview()
    await flushPromises()

    await wrapper.find('.latest-row').trigger('click')
    expect(wrapper.emitted('select')).toEqual([[overview.latestEvents[0]]])
  })

  it('marks only warnings and errors, and links to the full list', async () => {
    getStudyLogOverview.mockResolvedValue({
      ...overview,
      latestEvents: [
        { ...overview.latestEvents[0], rowKey: 'a', level: 'info' },
        { ...overview.latestEvents[0], rowKey: 'b', level: 'warning' },
        { ...overview.latestEvents[0], rowKey: 'c', level: 'error' },
      ],
    })
    const wrapper = mountOverview()
    await flushPromises()

    expect(
      wrapper
        .findAll('.latest-row__status')
        .map((status) => status.classes().at(-1)),
    ).toEqual([
      'latest-row__status--info',
      'latest-row__status--warning',
      'latest-row__status--error',
    ])
    expect(
      wrapper.findAll('.latest-row')[1].attributes('aria-label'),
    ).toContain('warning level')
    await wrapper.find('[data-test="view-all-events"]').trigger('click')
    expect(wrapper.emitted('filter')).toEqual([[{}]])
  })

  it('shows empty states for a study with no logs', async () => {
    getStudyLogOverview.mockResolvedValue({
      ...overview,
      sessions: 0,
      submittedSessions: 0,
      events: 0,
      warnings: 0,
      errors: 0,
      latestEvents: [],
    })
    const wrapper = mountOverview()
    await flushPromises()

    expect(wrapper.find('[data-kpi="events"] .kpi-card__value').text()).toBe(
      '0',
    )
    expect(wrapper.text()).toContain('No activity has been recorded yet.')
  })

  it('reports a failed load', async () => {
    getStudyLogOverview.mockRejectedValue(new Error('denied'))
    const wrapper = mountOverview()
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain(
      'could not be loaded',
    )
    expect(wrapper.find('[data-kpi]').exists()).toBe(false)
  })
})
