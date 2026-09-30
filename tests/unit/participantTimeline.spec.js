import {
  buildParticipantTimeline,
  stepKeyFor,
} from '@/shared/utils/participantTimeline'

const at = (minute) => new Date(Date.UTC(2026, 8, 30, 12, minute))
const event = (minute, eventType, details = {}, level = 'info') => ({
  participantLabel: 'P-001',
  occurredAt: at(minute),
  eventType,
  details,
  level,
})

describe('participant timeline', () => {
  const events = [
    event(0, 'STUDY_VIEW_OPENED'),
    event(1, 'CONSENT_ACCEPTED'),
    event(2, 'STRUCTURED_RESPONSE_ACTIVITY', {
      scopeRef: 'preTest',
      items: [{ itemRef: 'preTest:question:0', changes: 1 }],
    }),
    event(3, 'ANSWER_EDITED', { fieldRef: 'preTest:1:answer' }),
    event(4, 'TASK_STARTED', { taskRef: 'task:0', taskType: 'sus' }),
    event(
      5,
      'MEDIA_RECORDING_OUTCOME',
      {
        taskRef: 'task:0',
        mediaType: 'webcam',
        outcome: 'failed',
      },
      'error',
    ),
    event(6, 'STRUCTURED_RESPONSE_ACTIVITY', {
      scopeRef: 'task:0',
      taskType: 'sus',
      items: [
        { itemRef: 'sus:question:0', changes: 2 },
        { itemRef: 'sus:question:1', changes: 1 },
      ],
    }),
    event(7, 'TASK_ATTEMPT_FINISHED', {
      taskRef: 'task:0',
      taskType: 'sus',
      outcome: 'completed',
      taskDurationMs: 90000,
    }),
    event(8, 'TASK_STARTED', { taskRef: 'task:1', taskType: 'post-test' }),
    event(9, 'STRUCTURED_RESPONSE_ACTIVITY', {
      scopeRef: 'postTest',
      items: [{ itemRef: 'postTest:question:0', changes: 1 }],
    }),
    event(10, 'STUDY_SUBMITTED'),
  ]

  it('orders steps by study flow regardless of event order', () => {
    const timeline = buildParticipantTimeline([...events].reverse())

    expect(timeline.steps.map((step) => step.key)).toEqual([
      'session',
      'consent',
      'preTest',
      'task:0',
      'task:1',
      'postTest',
      'submitted',
    ])
    expect(timeline.participantLabel).toBe('P-001')
    expect(timeline.submittedAt).toBe(at(10).getTime())
    expect(timeline.firstActivityAt).toBe(at(0).getTime())
  })

  it('summarises answers, tasks and recordings without answer values', () => {
    const steps = Object.fromEntries(
      buildParticipantTimeline(events).steps.map((step) => [step.key, step]),
    )

    expect(steps.preTest.summary).toEqual({ questions: 2 })
    expect(steps['task:0'].summary).toEqual({
      started: true,
      outcome: 'completed',
      durationMs: 90000,
      taskType: 'sus',
      questionnaireUpdates: 3,
      recordings: { webcam: 'failed' },
    })
    expect(steps['task:0'].status).toBe('problem')
    expect(steps['task:1'].status).toBe('open')
    expect(steps['task:0'].startedAt).toBe(at(4).getTime())
    expect(steps['task:0'].endedAt).toBe(at(7).getTime())
  })

  it('groups heuristic activity per heuristic', () => {
    expect(
      stepKeyFor({
        eventType: 'QUESTION_RESPONSE_UPDATED',
        details: { questionRef: 'heuristic:2:question:4' },
      }),
    ).toBe('heuristic:2')
    const timeline = buildParticipantTimeline([
      event(1, 'QUESTION_RESPONSE_UPDATED', {
        questionRef: 'heuristic:0:question:0',
      }),
      event(2, 'QUESTION_RESPONSE_UPDATED', {
        questionRef: 'heuristic:0:question:1',
      }),
    ])

    expect(timeline.steps[0]).toMatchObject({
      key: 'heuristic:0',
      summary: { questions: 2 },
      status: 'done',
    })
  })
})
