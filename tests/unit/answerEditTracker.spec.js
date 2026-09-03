import {
  createAnswerEditTracker,
  createQuestionResponseTracker,
} from '@/shared/services/studyLoggingClient'

describe('answer edit aggregation', () => {
  it('records one metadata-only summary from first to last changed input', async () => {
    let now = 1000
    const logger = { record: jest.fn().mockResolvedValue('event-1') }
    const tracker = createAnswerEditTracker({ logger, now: () => now })

    tracker.begin('heuristic:0:question:0:comment', 4)
    now = 1100
    tracker.input('heuristic:0:question:0:comment', 5)
    now = 1300
    tracker.input('heuristic:0:question:0:comment', 12, { pasted: true })
    await tracker.finish('heuristic:0:question:0:comment')

    expect(logger.record).toHaveBeenCalledWith('ANSWER_EDITED', {
      fieldRef: 'heuristic:0:question:0:comment',
      editSpanMs: 200,
      editOperations: 2,
      pasteOperations: 1,
      initialLength: 4,
      resultingLength: 12,
    })
    expect(JSON.stringify(logger.record.mock.calls)).not.toContain('private')
  })

  it('records nothing when a field interaction made no change', async () => {
    const logger = { record: jest.fn() }
    const tracker = createAnswerEditTracker({ logger, now: () => 1000 })

    tracker.begin('heuristic:0:question:0:comment', 4)
    await tracker.finish('heuristic:0:question:0:comment')

    expect(logger.record).not.toHaveBeenCalled()
  })
})

describe('heuristic question response aggregation', () => {
  it('records one privacy-safe summary for all response fields changed together', async () => {
    let now = 1000
    const logger = { record: jest.fn().mockResolvedValue('event-1') }
    const tracker = createQuestionResponseTracker({ logger, now: () => now })
    const questionRef = 'heuristic:1:question:2'

    tracker.change(questionRef, 'frequency')
    now = 3000
    tracker.change(questionRef, 'severity')
    now = 9400
    tracker.change(questionRef, 'severity')
    for (let index = 0; index < 26; index += 1) {
      now = 19400
      tracker.change(questionRef, 'comment')
    }
    await tracker.finish(questionRef)

    expect(logger.record).toHaveBeenCalledWith(
      'QUESTION_RESPONSE_UPDATED',
      {
        questionRef,
        changedFields: ['frequency', 'severity', 'comment'],
        interactionSpanMs: 18400,
        frequencyChanges: 1,
        severityChanges: 2,
        answerChanges: 0,
        commentInputChanges: 26,
      },
      '1970-01-01T00:00:19.400Z',
    )
    expect(JSON.stringify(logger.record.mock.calls)).not.toContain(
      'comment text',
    )

    logger.record.mockClear()
    now = 25000
    tracker.change(questionRef, 'severity')
    await tracker.finish(questionRef)
    expect(logger.record).toHaveBeenCalledWith(
      'QUESTION_RESPONSE_UPDATED',
      expect.objectContaining({
        changedFields: ['severity'],
        frequencyChanges: 0,
        severityChanges: 1,
        commentInputChanges: 0,
      }),
      '1970-01-01T00:00:25.000Z',
    )
  })
})
