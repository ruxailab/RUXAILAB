import { IDBFactory } from 'fake-indexeddb'
import { deserialize, serialize } from 'v8'
import {
  createIndexedDbQueueStore,
  createStudyLogger,
} from '@/shared/services/studyLoggingClient'

describe('browser study logging IndexedDB queue', () => {
  const originalStructuredClone = global.structuredClone

  beforeEach(() => {
    global.indexedDB = new IDBFactory()
    global.structuredClone = (value) => deserialize(serialize(value))
  })

  afterEach(() => {
    delete global.indexedDB
    global.structuredClone = originalStructuredClone
  })

  it('persists an event for delivery through another queue handle', async () => {
    const ids = ['event-1', 'batch-1']
    const submitBatch = jest.fn(({ batchId }) => ({
      status: 'accepted',
      batchId,
    }))
    const options = {
      ownerUid: 'participant',
      studyId: 'study-1',
      submitBatch,
      createId: () => ids.shift(),
    }
    const recordingTab = createStudyLogger({
      ...options,
      queueStore: createIndexedDbQueueStore({ name: 'logging-test' }),
    })
    const deliveryTab = createStudyLogger({
      ...options,
      queueStore: createIndexedDbQueueStore({ name: 'logging-test' }),
    })

    await expect(recordingTab.record('STUDY_VIEW_OPENED', {})).resolves.toBe(
      'event-1',
    )
    await expect(deliveryTab.flush()).resolves.toEqual({
      status: 'accepted',
      batchId: 'batch-1',
    })
    await recordingTab.flush()

    expect(submitBatch).toHaveBeenCalledTimes(1)
    expect(submitBatch).toHaveBeenCalledWith({
      studyId: 'study-1',
      batchId: 'batch-1',
      events: [
        {
          eventId: 'event-1',
          eventType: 'STUDY_VIEW_OPENED',
          occurredAt: expect.any(String),
          details: {},
        },
      ],
    })
  })
})
