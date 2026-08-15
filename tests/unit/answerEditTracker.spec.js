import { createAnswerEditTracker } from '@/shared/services/studyLoggingClient'

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
