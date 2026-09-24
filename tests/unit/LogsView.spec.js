import { flushPromises, mount } from '@vue/test-utils'
import { useDisplay } from 'vuetify'
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
  useDisplay: jest.fn(() => ({ smAndDown: false, xs: { value: false } })),
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
      rowKey: 'log-1',
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
    useDisplay.mockReturnValue({ smAndDown: false, xs: { value: false } })
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
      { title: 'Task Started', value: 'TASK_STARTED' },
      { title: 'Media Recording Outcome', value: 'MEDIA_RECORDING_OUTCOME' },
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
            responseValue: 'private answer text',
          },
        },
      ],
    })
    getStudyLogCount.mockResolvedValue(1)

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()
    await wrapper.find('tbody tr').trigger('click')

    expect(wrapper.text()).toContain('Heuristic 2 · Question 1 · Comment field')
    expect(wrapper.text()).toContain('6 input events')
    expect(wrapper.text()).toContain('Active edit span')
    expect(wrapper.text()).toContain('1.4 s')
    expect(wrapper.text()).toContain('Delivery delay')
    expect(wrapper.text()).toContain('6.2 s')
    expect(wrapper.text()).toContain(
      'Logs capture edit activity, not written answers or selected ratings; review responses and scores in Results.',
    )
    expect(wrapper.text()).toContain(
      'Active edit span is browser input time, not total time spent on the question.',
    )
    expect(wrapper.text()).toContain('0 → 6 characters')
    expect(wrapper.text()).not.toContain('private answer text')
    expect(wrapper.text()).not.toContain('heuristic:1:question:0:comment')
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
            taskType: 'nasa-tlx',
            recordingTypes: ['audio', 'screen'],
          },
        },
      ],
    })
    getStudyLogCount.mockResolvedValue(1)

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()
    await wrapper.find('tbody tr').trigger('click')

    expect(wrapper.text()).toContain('Task 1')
    expect(wrapper.text()).toContain('Task 1 · Could not finish')
    expect(wrapper.text()).toContain('Timed task activity')
    expect(wrapper.text()).toContain('16 s')
    expect(wrapper.text()).toContain('NASA-TLX')
    expect(wrapper.text()).toContain('Audio recording, Screen recording')
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
    expect(wrapper.text()).toContain(
      'Selected ratings, scores, and comment text are never logged; review responses in Results.',
    )
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

  it('keeps focus attached to the same event when refresh inserts a row', async () => {
    const original = {
      ...page.events[0],
      rowKey: 'log-original',
      eventType: 'ORIGINAL_EVENT',
      message: 'Original first event',
      occurredAt: new Date('2026-08-14T10:00:00.000Z'),
    }
    const newest = {
      ...page.events[0],
      rowKey: 'log-newest',
      eventType: 'NEWEST_EVENT',
      message: 'Newest event',
      occurredAt: new Date('2026-08-14T11:00:00.000Z'),
    }
    getParticipantLabels.mockResolvedValue([])
    getStudyLogPage
      .mockResolvedValueOnce({
        events: [original],
        hasNextPage: false,
        lastCursor: null,
      })
      .mockResolvedValueOnce({
        events: [newest, original],
        hasNextPage: false,
        lastCursor: null,
      })
    getStudyLogCount.mockResolvedValue(3)

    const wrapper = mount(LogsView, {
      props: { id: 'study-1' },
      attachTo: document.body,
      global: {
        config: { warnHandler: () => {} },
        stubs: {
          VBtn: {
            emits: ['click'],
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })
    await flushPromises()

    const focusedRow = wrapper.findAll('tbody tr')[0].element
    focusedRow.focus()
    expect(document.activeElement).toBe(focusedRow)

    await wrapper
      .findAll('button')
      .find((button) => button.text().includes('Refresh'))
      .trigger('click')
    await flushPromises()

    expect(document.activeElement.textContent).toContain('Original first event')
    wrapper.unmount()
  })
  it('displays recording technical severity and readable cancellation details', async () => {
    getParticipantLabels.mockResolvedValue([])
    getStudyLogCount.mockResolvedValue(1)
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        {
          ...page.events[0],
          eventType: 'MEDIA_RECORDING_OUTCOME',
          layer: 'technical',
          level: 'warning',
          details: {
            taskRef: 'task:0',
            taskType: 'sus',
            mediaType: 'screen',
            outcome: 'cancelled',
            stage: 'permission',
            reason: 'cancelled',
          },
        },
      ],
    })
    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()
    await wrapper.find('tbody tr').trigger('click')
    for (const label of [
      'Technical',
      'Screen recording',
      'Permission',
      'Permission denied or capture cancelled',
    ])
      expect(wrapper.text()).toContain(label)
    wrapper.unmount()
  })

  it('uses journey labels and distinct context on desktop rows', async () => {
    Object.assign(mockStudy, { testType: 'USER', subType: 'USER_UNMODERATED' })
    getParticipantLabels.mockResolvedValue([])
    getStudyLogCount.mockResolvedValue(12)
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        {
          ...page.events[0],
          rowKey: 'opened',
          eventType: 'STUDY_VIEW_OPENED',
          message: 'Study view opened',
          details: {},
        },
        {
          ...page.events[0],
          rowKey: 'consent',
          eventType: 'CONSENT_ACCEPTED',
          message: 'Consent accepted',
          details: {},
        },
        {
          ...page.events[0],
          rowKey: 'pre',
          eventType: 'ANSWER_EDITED',
          details: { fieldRef: 'preTest:2:answer' },
        },
        {
          ...page.events[0],
          rowKey: 'task-answer',
          eventType: 'ANSWER_EDITED',
          details: { fieldRef: 'task:0:answer', taskType: 'sus' },
        },
        {
          ...page.events[0],
          rowKey: 'task-comment',
          eventType: 'ANSWER_EDITED',
          details: { fieldRef: 'task:1:comment', taskType: 'text-area' },
        },
        {
          ...page.events[0],
          rowKey: 'started',
          eventType: 'TASK_STARTED',
          details: { taskRef: 'task:0', taskType: 'nasa-tlx' },
        },
        {
          ...page.events[0],
          rowKey: 'finished-completed',
          eventType: 'TASK_ATTEMPT_FINISHED',
          details: {
            taskRef: 'task:0',
            outcome: 'completed',
            taskType: 'post-form',
          },
        },
        {
          ...page.events[0],
          rowKey: 'finished',
          eventType: 'TASK_ATTEMPT_FINISHED',
          details: {
            taskRef: 'task:1',
            outcome: 'not_completed',
            taskType: 'tam-3',
          },
        },
        {
          ...page.events[0],
          rowKey: 'unknown-instrument',
          eventType: 'TASK_STARTED',
          details: { taskRef: 'task:2', taskType: 'private-custom-type' },
        },
        {
          ...page.events[0],
          rowKey: 'recording',
          eventType: 'MEDIA_RECORDING_OUTCOME',
          details: {
            taskRef: 'task:0',
            mediaType: 'screen',
            outcome: 'completed',
            stage: 'upload',
            taskType: 'sus',
          },
        },
        {
          ...page.events[0],
          rowKey: 'post',
          eventType: 'ANSWER_EDITED',
          details: { fieldRef: 'postTest:0:comment' },
        },
        {
          ...page.events[0],
          rowKey: 'submitted',
          eventType: 'STUDY_SUBMITTED',
          message: 'Study submitted',
          details: {},
        },
      ],
    })

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()

    const eventCells = wrapper.findAll('tbody .message-cell')
    expect(eventCells.map((cell) => cell.text())).toEqual([
      'Study opened',
      'Consent accepted',
      'Pre-test · Answer editedQuestion 3',
      'Task 1 · Answer editedSUS · Answer field',
      'Task 2 · Observation editedParagraph Answer · Observations',
      'Task 1 · StartedNASA-TLX',
      'Task 1 · CompletedGoogle Forms Link',
      'Task 2 · Could not finishTAM-3',
      'Task 3 · Started',
      'Task 1 · Recording savedScreen recording',
      'Post-test · Answer editedQuestion 1',
      'Study submitted',
    ])
    expect(wrapper.find('thead').text()).not.toContain('Source')
    expect(wrapper.find('thead').text()).not.toContain('Layer')
    expect(wrapper.text()).not.toContain('TASK_STARTED')
    expect(wrapper.text()).not.toContain('private-custom-type')
    wrapper.unmount()
  })

  it('shows every known task instrument, including legacy task identifiers', async () => {
    Object.assign(mockStudy, { testType: 'USER', subType: 'USER_UNMODERATED' })
    const taskTypes = [
      ['no-answer', 'No Answer'],
      ['post-test', 'Short Answer'],
      ['text-area', 'Paragraph Answer'],
      ['post-form', 'Google Forms Link'],
      ['nasa-tlx', 'NASA-TLX'],
      ['sus', 'SUS'],
      ['tam-1', 'TAM-1'],
      ['tam-2', 'TAM-2'],
      ['tam-3', 'TAM-3'],
      ['sart', 'Situational Awareness Rating Technique (SART)'],
    ]
    getParticipantLabels.mockResolvedValue([])
    getStudyLogCount.mockResolvedValue(taskTypes.length)
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: taskTypes.map(([taskType], index) => ({
        ...page.events[0],
        rowKey: `instrument-${index}`,
        eventType: 'TASK_STARTED',
        details: { taskRef: `task:${index}`, taskType },
      })),
    })

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()

    expect(wrapper.findAll('tbody .message-cell').map((cell) => cell.text())).toEqual(
      taskTypes.map(([, taskTypeLabel], index) => `Task ${index + 1} · Started${taskTypeLabel}`),
    )
    wrapper.unmount()
  })

  it('uses the same journey label and subtitle in the mobile row', async () => {
    Object.assign(mockStudy, { testType: 'USER', subType: 'USER_UNMODERATED' })
    useDisplay.mockReturnValue({ smAndDown: true, xs: { value: false } })
    getParticipantLabels.mockResolvedValue([])
    getStudyLogCount.mockResolvedValue(1)
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        {
          ...page.events[0],
          eventType: 'TASK_STARTED',
          details: { taskRef: 'task:0', taskType: 'sart' },
        },
      ],
    })

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()

    expect(wrapper.find('.mobile-event').text()).toContain('Task 1 · Started')
    expect(wrapper.find('.mobile-event').text()).toContain(
      'Situational Awareness Rating Technique (SART)',
    )
    expect(wrapper.find('.mobile-event').text()).not.toContain('study-client')
    expect(wrapper.find('.mobile-event').text()).not.toContain('methodological')
    wrapper.unmount()
  })

  it('keeps delivery diagnostics collapsed and labels browser times as unverified', async () => {
    getParticipantLabels.mockResolvedValue([])
    getStudyLogCount.mockResolvedValue(1)
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        {
          ...page.events[0],
          eventType: 'ANSWER_EDITED',
          source: 'study-client',
          actorRole: 'user',
          timeQuality: 'client-unverified',
          occurredAt: new Date('2026-08-14T10:00:10.000Z'),
          receivedAt: new Date('2026-08-14T10:00:06.000Z'),
          details: {
            fieldRef: 'task:0:answer',
            taskType: 'sus',
            editSpanMs: 1250,
            editOperations: 2,
            pasteOperations: 0,
            initialLength: 0,
            resultingLength: 5,
            answer: 'private response value',
          },
        },
      ],
    })

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()
    await wrapper.find('tbody tr').trigger('click')

    expect(wrapper.find('.drawer-heading h2').text()).toBe(
      'Task 1 · Answer edited',
    )
    expect(wrapper.find('.event-summary').text()).toContain('Participant')
    expect(wrapper.find('.event-summary').text()).toContain('Occurred')
    expect(wrapper.find('.event-summary').text()).not.toContain('Received')
    expect(wrapper.find('.drawer-details').text()).toContain(
      '0 → 5 characters',
    )
    expect(wrapper.find('.drawer-details').text()).toContain('2 input events')
    expect(wrapper.find('.drawer-details').text()).toContain('1.3 s')
    expect(wrapper.find('.drawer-details').text()).not.toContain('Paste events')
    expect(wrapper.find('.drawer-details').text()).not.toContain(
      'private response value',
    )

    const diagnostics = wrapper.find('details.delivery-diagnostics')
    expect(diagnostics.exists()).toBe(true)
    expect(diagnostics.element.open).toBe(false)
    expect(diagnostics.find('summary').text()).toBe('Delivery diagnostics')
    expect(diagnostics.text()).toContain('Received')
    expect(diagnostics.text()).toContain('Delivery delay')
    expect(diagnostics.text()).toContain('Occurrence is 4 s after receipt')
    expect(diagnostics.text()).toContain('Time quality')
    expect(diagnostics.text()).toContain('Source')
    expect(diagnostics.text()).toContain('Layer')
    expect(diagnostics.text()).toContain('Actor role')
    expect(diagnostics.text()).toContain('Event type')
    expect(wrapper.text()).toContain('Browser-reported occurrence time is unverified')
    expect(wrapper.text()).toContain(
      'Received time records server receipt, not participant action.',
    )
    wrapper.unmount()
  })

  it('labels all recording outcomes and keeps legacy or unknown events readable', async () => {
    Object.assign(mockStudy, { testType: 'USER', subType: 'USER_UNMODERATED' })
    getParticipantLabels.mockResolvedValue([])
    getStudyLogCount.mockResolvedValue(6)
    getStudyLogPage.mockResolvedValue({
      ...page,
      events: [
        ...[
          ['completed', 'Recording saved'],
          ['failed', 'Recording failed'],
          ['permission_denied', 'Permission not granted'],
          ['cancelled', 'Recording cancelled'],
        ].map(([outcome], index) => ({
          ...page.events[0],
          rowKey: `recording-${index}`,
          eventType: 'MEDIA_RECORDING_OUTCOME',
          details: {
            taskRef: 'task:0',
            mediaType: ['screen', 'webcam', 'audio', 'screen'][index],
            outcome,
            stage: 'permission',
            reason: outcome === 'permission_denied' ? 'permissionDenied' : undefined,
          },
        })),
        {
          ...page.events[0],
          rowKey: 'legacy',
          eventType: 'MEDIA_RECORDING_OUTCOME',
          message: 'Old recording outcome',
          details: {},
        },
        {
          ...page.events[0],
          rowKey: 'unknown',
          eventType: 'FUTURE_EVENT',
          message: '',
          details: { answer: 'private response value' },
        },
      ],
    })

    const wrapper = mount(LogsView, { props: { id: 'study-1' } })
    await flushPromises()

    const rows = wrapper.findAll('tbody .message-cell')
    expect(rows.slice(0, 4).map((cell) => cell.text())).toEqual([
      'Task 1 · Recording savedScreen recording',
      'Task 1 · Recording failedWebcam recording',
      'Task 1 · Permission not grantedAudio recording',
      'Task 1 · Recording cancelledScreen recording',
    ])
    expect(rows[4].text()).toContain('Old recording outcome')
    expect(rows[4].text()).not.toContain('Media Recording Outcome')
    expect(rows[5].text()).toBe('Future Event')
    expect(wrapper.text()).not.toContain('private response value')
    wrapper.unmount()
  })
})
