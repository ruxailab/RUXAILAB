import {
  cleanupStudyLoggingForOwner,
  createStudyLogger,
} from '@/shared/services/studyLoggingClient'

const createQueueStore = () => {
  const records = new Map()
  let lock = Promise.resolve()
  return {
    mutate(key, change) {
      const result = lock.then(() => {
        const current = records.has(key)
          ? structuredClone(records.get(key))
          : null
        const next = change(current)
        if (next) records.set(key, structuredClone(next))
        else records.delete(key)
        return structuredClone(next)
      })
      lock = result.catch(() => {})
      return result
    },
    cleanupOwner(ownerUid) {
      for (const [key, queue] of records) {
        if (queue.ownerUid === ownerUid) records.delete(key)
      }
      return Promise.resolve()
    },
  }
}

const eventIds = ['event-1', 'event-2', 'batch-1', 'batch-2']

describe('browser study logging client', () => {
  it('preserves stable Event and Batch IDs across a bounded temporary retry', async () => {
    let now = Date.parse('2026-08-14T10:00:00.000Z')
    const calls = []
    const submitBatch = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ status: 'accepted', batchId: 'batch-1' })
    const logger = createStudyLogger({
      ownerUid: 'participant',
      studyId: 'study-1',
      submitBatch,
      queueStore: createQueueStore(),
      now: () => now,
      random: () => 1,
      createId: () => eventIds.shift(),
    })

    await logger.record('STUDY_VIEW_OPENED', {})
    await logger.record('ANSWER_EDITED', {
      fieldRef: 'heuristic:0:question:0:comment',
      editSpanMs: 1400,
      editOperations: 3,
      pasteOperations: 1,
      initialLength: 4,
      resultingLength: 12,
    })
    await logger.flush()

    expect(submitBatch).toHaveBeenCalledTimes(1)
    calls.push(submitBatch.mock.calls[0][0])
    expect(calls[0]).toMatchObject({
      studyId: 'study-1',
      batchId: 'batch-1',
      events: [
        { eventId: 'event-1', eventType: 'STUDY_VIEW_OPENED' },
        { eventId: 'event-2', eventType: 'ANSWER_EDITED' },
      ],
    })
    expect(calls[0]).not.toHaveProperty('ownerUid')

    now += 4999
    await logger.flush()
    expect(submitBatch).toHaveBeenCalledTimes(1)

    now += 1
    await logger.flush()
    expect(submitBatch).toHaveBeenCalledTimes(2)
    expect(submitBatch.mock.calls[1][0]).toEqual(calls[0])

    await logger.flush()
    expect(submitBatch).toHaveBeenCalledTimes(2)
  })

  it('removes only terminal events and repacks unchanged survivors under one fresh Batch ID', async () => {
    const ids = ['event-1', 'event-2', 'event-3', 'batch-1', 'batch-2']
    const rejection = Object.assign(new Error('invalid event'), {
      details: {
        retryable: false,
        scope: 'events',
        invalidEvents: [
          { eventId: 'event-2', reasonCode: 'INVALID_EVENT_DETAILS' },
        ],
      },
    })
    const submitBatch = jest
      .fn()
      .mockRejectedValueOnce(rejection)
      .mockResolvedValueOnce({ status: 'accepted', batchId: 'batch-2' })
    const logger = createStudyLogger({
      ownerUid: 'participant',
      studyId: 'study-1',
      submitBatch,
      queueStore: createQueueStore(),
      now: () => Date.parse('2026-08-14T10:00:00.000Z'),
      createId: () => ids.shift(),
    })

    await logger.record('STUDY_VIEW_OPENED', {})
    await logger.record('ANSWER_EDITED', {
      fieldRef: 'heuristic:0:question:0:comment',
      editSpanMs: 1,
      editOperations: 1,
      pasteOperations: 0,
      initialLength: 0,
      resultingLength: 1,
    })
    await logger.record('STUDY_VIEW_OPENED', {})
    await logger.flush()
    await logger.flush()

    expect(submitBatch).toHaveBeenCalledTimes(2)
    expect(submitBatch.mock.calls[0][0].batchId).toBe('batch-1')
    expect(submitBatch.mock.calls[1][0]).toMatchObject({
      batchId: 'batch-2',
      events: [{ eventId: 'event-1' }, { eventId: 'event-3' }],
    })
    expect(submitBatch.mock.calls[1][0].events).toEqual([
      submitBatch.mock.calls[0][0].events[0],
      submitBatch.mock.calls[0][0].events[2],
    ])
  })

  it('drains a recognized batch-wide permanent rejection', async () => {
    const ids = ['event-1', 'batch-1']
    const submitBatch = jest.fn().mockRejectedValue(
      Object.assign(new Error('budget exhausted'), {
        details: {
          retryable: false,
          scope: 'batch',
          reasonCode: 'BUDGET_EXHAUSTED',
        },
      }),
    )
    const logger = createStudyLogger({
      ownerUid: 'participant',
      studyId: 'study-1',
      submitBatch,
      queueStore: createQueueStore(),
      createId: () => ids.shift(),
    })

    await logger.record('STUDY_VIEW_OPENED', {})
    await logger.flush()
    await logger.flush()

    expect(submitBatch).toHaveBeenCalledTimes(1)
  })

  it('drains a deleted study queue when ingestion returns generic ineligibility', async () => {
    const submitBatch = jest.fn().mockRejectedValue(
      Object.assign(new Error('study unavailable'), {
        details: {
          retryable: false,
          scope: 'batch',
          reasonCode: 'NOT_ELIGIBLE',
        },
      }),
    )
    const logger = createStudyLogger({
      ownerUid: 'participant',
      studyId: 'deleted-study',
      submitBatch,
      queueStore: createQueueStore(),
      createId: () => 'stable-id',
    })

    await logger.record('STUDY_VIEW_OPENED', {})
    await expect(logger.flush()).resolves.toEqual({ status: 'discarded' })
    await logger.flush()

    expect(submitBatch).toHaveBeenCalledTimes(1)
  })

  it('downgrades malformed permanent details and retries the complete original batch', async () => {
    let now = 1000
    const ids = ['event-1', 'event-2', 'batch-1']
    const submitBatch = jest
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error('malformed'), {
          details: { retryable: false, scope: 'events', invalidEvents: [] },
        }),
      )
      .mockResolvedValueOnce({ status: 'accepted', batchId: 'batch-1' })
    const logger = createStudyLogger({
      ownerUid: 'participant',
      studyId: 'study-1',
      submitBatch,
      queueStore: createQueueStore(),
      now: () => now,
      random: () => 1,
      createId: () => ids.shift(),
    })

    await logger.record('STUDY_VIEW_OPENED', {})
    await logger.record('STUDY_VIEW_OPENED', {})
    await logger.flush()
    now += 5000
    await logger.flush()

    expect(submitBatch).toHaveBeenCalledTimes(2)
    expect(submitBatch.mock.calls[1][0]).toEqual(submitBatch.mock.calls[0][0])
  })

  it('gives concurrent tabs one lease and recovers the original Batch ID after two minutes', async () => {
    let now = 1000
    const ids = ['event-1', 'batch-1']
    const queueStore = createQueueStore()
    const submitBatch = jest
      .fn()
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValueOnce({ status: 'accepted', batchId: 'batch-1' })
    const options = {
      ownerUid: 'participant',
      studyId: 'study-1',
      submitBatch,
      queueStore,
      now: () => now,
      createId: () => ids.shift(),
    }
    const firstTab = createStudyLogger(options)
    const secondTab = createStudyLogger(options)

    await firstTab.record('STUDY_VIEW_OPENED', {})
    void firstTab.flush()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await secondTab.flush()
    expect(submitBatch).toHaveBeenCalledTimes(1)

    now += 2 * 60 * 1000 + 1
    await secondTab.flush()
    expect(submitBatch).toHaveBeenCalledTimes(2)
    expect(submitBatch.mock.calls[1][0]).toEqual(submitBatch.mock.calls[0][0])
  })

  it('never claims another account queue and cleanup removes the departing account records', async () => {
    const ids = ['event-1']
    const queueStore = createQueueStore()
    const submitBatch = jest.fn()
    const firstAccount = createStudyLogger({
      ownerUid: 'participant-1',
      studyId: 'study-1',
      submitBatch,
      queueStore,
      createId: () => ids.shift(),
    })
    const secondAccount = createStudyLogger({
      ownerUid: 'participant-2',
      studyId: 'study-1',
      submitBatch,
      queueStore,
    })

    await firstAccount.record('STUDY_VIEW_OPENED', {})
    await secondAccount.flush()
    expect(submitBatch).not.toHaveBeenCalled()

    await firstAccount.cleanup()
    await firstAccount.flush()
    expect(submitBatch).not.toHaveBeenCalled()
  })

  it('removes every queue owned by the account that logs out', async () => {
    const queueStore = createQueueStore()
    const departingSubmit = jest.fn()
    const otherSubmit = jest.fn(({ batchId }) => ({
      status: 'accepted',
      batchId,
    }))
    const firstStudy = createStudyLogger({
      ownerUid: 'participant-1',
      studyId: 'study-1',
      submitBatch: departingSubmit,
      queueStore,
      createId: () => 'event-1',
    })
    const secondStudy = createStudyLogger({
      ownerUid: 'participant-1',
      studyId: 'study-2',
      submitBatch: departingSubmit,
      queueStore,
      createId: () => 'event-2',
    })
    const otherAccount = createStudyLogger({
      ownerUid: 'participant-2',
      studyId: 'study-1',
      submitBatch: otherSubmit,
      queueStore,
      createId: () => 'event-3',
    })

    await firstStudy.record('STUDY_VIEW_OPENED', {})
    await secondStudy.record('STUDY_VIEW_OPENED', {})
    await otherAccount.record('STUDY_VIEW_OPENED', {})
    await cleanupStudyLoggingForOwner('participant-1', queueStore)

    await firstStudy.flush()
    await secondStudy.flush()
    await otherAccount.flush()

    expect(departingSubmit).not.toHaveBeenCalled()
    expect(otherSubmit).toHaveBeenCalledTimes(1)
  })
})
