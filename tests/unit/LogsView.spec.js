import { flushPromises, mount } from '@vue/test-utils'
import LogsView from '@/shared/views/LogsView.vue'
import {
  getParticipantLabels,
  getStudyLogCount,
  getStudyLogPage,
} from '@/shared/services/studyLogQuery'

const mockStudy = {
  testTitle: 'Heuristic logging testing',
  testType: 'HEURISTIC',
}

jest.mock('vuetify', () => ({
  useDisplay: () => ({ smAndDown: false, xs: { value: false } }),
}))

jest.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      test: mockStudy,
    },
  }),
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
  beforeEach(() => {
    Object.assign(mockStudy, {
      testTitle: 'Heuristic logging testing',
      testType: 'HEURISTIC',
    })
    delete mockStudy.subType
  })

  it('shows only heuristic event types with readable filter labels', async () => {
    getParticipantLabels.mockResolvedValue([])
    getStudyLogPage.mockResolvedValue(page)
    getStudyLogCount.mockResolvedValue(1)

    const wrapper = mount(LogsView, {
      props: { id: 'study-1' },
      global: {
        stubs: {
          VBtn: {
            name: 'VBtn',
            emits: ['click'],
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VSelect: {
            name: 'VSelect',
            props: ['items', 'itemTitle', 'itemValue', 'label'],
            emits: ['update:modelValue'],
            template: '<div />',
          },
        },
      },
    })
    await flushPromises()

    const selects = wrapper.findAllComponents({ name: 'VSelect' })
    const eventType = selects.find(
      (select) => select.props('label') === 'Event type',
    )
    const source = selects.find((select) => select.props('label') === 'Source')

    expect(eventType.props()).toMatchObject({
      itemTitle: 'title',
      itemValue: 'value',
      items: [
        { title: 'Study View Opened', value: 'STUDY_VIEW_OPENED' },
        {
          title: 'Question Response Updated',
          value: 'QUESTION_RESPONSE_UPDATED',
        },
        { title: 'Study Submitted', value: 'STUDY_SUBMITTED' },
      ],
    })
    expect(source.props()).toMatchObject({
      itemTitle: 'title',
      itemValue: 'value',
      items: [
        { title: 'Study Client', value: 'study-client' },
        { title: 'Logging Service', value: 'logging-service' },
      ],
    })

    eventType.vm.$emit('update:modelValue', 'STUDY_VIEW_OPENED')
    source.vm.$emit('update:modelValue', 'study-client')
    await wrapper
      .findAll('button')
      .find((button) => button.text().includes('Apply filters'))
      .trigger('click')
    await flushPromises()

    expect(getStudyLogPage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: {
          eventType: 'STUDY_VIEW_OPENED',
          source: 'study-client',
        },
      }),
    )
    wrapper.unmount()
  })

  it('shows only user-test event types', async () => {
    Object.assign(mockStudy, {
      testType: 'USER',
      subType: 'USER_UNMODERATED',
    })
    getParticipantLabels.mockResolvedValue([])
    getStudyLogPage.mockResolvedValue(page)
    getStudyLogCount.mockResolvedValue(1)

    const wrapper = mount(LogsView, {
      props: { id: 'study-1' },
      global: {
        stubs: {
          VSelect: {
            name: 'VSelect',
            props: ['items', 'itemTitle', 'itemValue', 'label'],
            template: '<div />',
          },
        },
      },
    })
    await flushPromises()

    const eventType = wrapper
      .findAllComponents({ name: 'VSelect' })
      .find((select) => select.props('label') === 'Event type')
    expect(eventType.props('items')).toEqual([
      { title: 'Study View Opened', value: 'STUDY_VIEW_OPENED' },
      { title: 'Answer Edited', value: 'ANSWER_EDITED' },
      { title: 'Consent Accepted', value: 'CONSENT_ACCEPTED' },
      {
        title: 'Task Attempt Finished',
        value: 'TASK_ATTEMPT_FINISHED',
      },
      { title: 'Study Submitted', value: 'STUDY_SUBMITTED' },
    ])
    wrapper.unmount()
  })

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
          VSelect: {
            props: ['label'],
            emits: ['update:modelValue'],
            template:
              '<button :data-label="label" @click="$emit(\'update:modelValue\', 10)">{{ label }}</button>',
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

    await wrapper.find('[data-label="Rows"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('1–1 shown')
    expect(wrapper.text()).not.toContain('1–1 of 100')
    wrapper.unmount()
  })

  it('presents answer-edit details in researcher-facing language', async () => {
    getParticipantLabels.mockResolvedValue([])
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        {
          eventType: 'ANSWER_EDITED',
          level: 'info',
          layer: 'methodological',
          source: 'study-client',
          message: 'Answer field edited',
          participantLabel: 'P-002',
          occurredAt: new Date('2026-08-31T04:12:32.000Z'),
          receivedAt: new Date('2026-08-31T04:12:38.161Z'),
          details: {
            fieldRef: 'heuristic:1:question:0:comment',
            editSpanMs: 1448,
            editOperations: 6,
            pasteOperations: 0,
            initialLength: 0,
            resultingLength: 6,
          },
        },
      ],
    })
    getStudyLogCount.mockResolvedValue(1)

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()
    await wrapper.find('tbody tr').trigger('click')

    expect(wrapper.text()).toContain('Heuristic 2 · Question 1 · Comment field')
    expect(wrapper.text()).toContain('Input changes')
    expect(wrapper.text()).toContain('6 input events')
    expect(wrapper.text()).toContain('Active input span')
    expect(wrapper.text()).toContain('1.4 s')
    expect(wrapper.text()).toContain('Delivery delay')
    expect(wrapper.text()).toContain('6.2 s')
    expect(wrapper.text()).toContain(
      'Counts summarize browser input activity; response text is never logged.',
    )
    expect(wrapper.text()).toContain(
      'Active input span runs from the first to the last input event, not the total time spent on the question.',
    )
    expect(wrapper.text()).not.toContain('heuristic:1:question:0:comment')
    expect(wrapper.text()).not.toContain('Edit Operations')
    wrapper.unmount()
  })

  it('presents unmoderated task details in researcher-facing language', async () => {
    getParticipantLabels.mockResolvedValue([])
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        {
          ...page.events[0],
          eventType: 'TASK_ATTEMPT_FINISHED',
          level: 'warning',
          message: 'Task attempt finished',
          details: {
            taskRef: 'task:0',
            outcome: 'not_completed',
            taskDurationMs: 16000,
          },
        },
      ],
    })
    getStudyLogCount.mockResolvedValue(1)

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()
    await wrapper.find('tbody tr').trigger('click')

    expect(wrapper.text()).toContain('Task 1')
    expect(wrapper.text()).toContain('Not Completed')
    expect(wrapper.text()).toContain('Task duration')
    expect(wrapper.text()).toContain('16 s')
    expect(wrapper.text()).not.toContain('task:0')
    expect(wrapper.text()).not.toContain('not_completed')
    wrapper.unmount()
  })

  it('presents grouped heuristic response details without response values', async () => {
    getParticipantLabels.mockResolvedValue([])
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        {
          ...page.events[0],
          eventType: 'QUESTION_RESPONSE_UPDATED',
          message: 'Question response updated',
          details: {
            questionRef: 'heuristic:1:question:2',
            changedFields: ['frequency', 'severity', 'comment'],
            interactionSpanMs: 18400,
            frequencyChanges: 1,
            severityChanges: 2,
            answerChanges: 0,
            commentInputChanges: 26,
          },
        },
      ],
    })
    getStudyLogCount.mockResolvedValue(1)

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()
    await wrapper.find('tbody tr').trigger('click')

    expect(wrapper.text()).toContain('Heuristic 2 · Question 3')
    expect(wrapper.text()).toContain('Changed')
    expect(wrapper.text()).toContain('Frequency, Severity, Comment')
    expect(wrapper.text()).toContain('Interaction span')
    expect(wrapper.text()).toContain('18.4 s')
    expect(wrapper.text()).toContain('Frequency changes')
    expect(wrapper.text()).toContain('1 change')
    expect(wrapper.text()).toContain('Severity changes')
    expect(wrapper.text()).toContain('2 changes')
    expect(wrapper.text()).toContain('Comment input changes')
    expect(wrapper.text()).toContain('26 input events')
    expect(wrapper.text()).toContain('Comment text')
    expect(wrapper.text()).toContain('Never logged')
    expect(wrapper.text()).not.toContain('heuristic:1:question:2')
    expect(wrapper.text()).not.toContain('Answer changes')
    wrapper.unmount()
  })

  it('gives each pseudonymous participant a stable visual identity', async () => {
    getParticipantLabels.mockResolvedValue(['P-001', 'P-002'])
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        { ...page.events[0], eventId: 'event-1' },
        {
          ...page.events[0],
          eventId: 'event-2',
          participantLabel: 'P-002',
        },
        { ...page.events[0], eventId: 'event-3' },
      ],
    })
    getStudyLogCount.mockResolvedValue(3)

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()

    const headings = wrapper
      .findAll('thead th')
      .map((heading) => heading.text())
    expect(headings.slice(0, 4)).toEqual([
      'Occurrence',
      'Participant',
      'Event',
      'Level',
    ])

    const tokens = wrapper.findAll('tbody .participant-token')
    expect(tokens.map((token) => token.text())).toEqual([
      '01P-001',
      '02P-002',
      '01P-001',
    ])
    expect(tokens[0].classes()).toContain('participant-token--tone-1')
    expect(tokens[1].classes()).toContain('participant-token--tone-2')
    expect(tokens[2].classes()).toContain('participant-token--tone-1')

    await wrapper.find('tbody tr').trigger('click')
    expect(wrapper.find('.event-summary .participant-token').text()).toBe(
      '01P-001',
    )
    wrapper.unmount()
  })
})
