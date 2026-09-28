import {
  createRecordingOutcomeTracker,
  captureFailure,
} from '@/ux/UserTest/utils/recordingOutcome'
const success = (taskRef = 'task:0') => ({
  taskRef,
  mediaType: 'audio',
  outcome: 'completed',
  stage: 'upload',
})

describe('recording outcomes and answer persistence', () => {
  it('keeps successful uploads pending across a failed save and emits once after a successful retry', () => {
    const record = jest.fn()
    const tracker = createRecordingOutcomeTracker(record)
    const result = success()
    tracker.observe(result)
    tracker.beforeSave() // A failed persistence attempt never acknowledges this snapshot.
    expect(record).not.toHaveBeenCalled()
    const retry = tracker.beforeSave()
    tracker.saved(retry)
    tracker.saved(retry) // Concurrent saves of the same pending reference.
    expect(record).toHaveBeenCalledTimes(1)
    expect(record).toHaveBeenCalledWith(result)
    expect(tracker.beforeSave()).toEqual([])
  })
  it('does not acknowledge uploads that arrive during an answer save', () => {
    const record = jest.fn()
    const tracker = createRecordingOutcomeTracker(record)
    const first = success()
    tracker.observe(first)
    const saving = tracker.beforeSave()
    const next = success()
    tracker.observe(next)
    tracker.saved(saving)
    expect(record).toHaveBeenCalledTimes(1)
    expect(tracker.beforeSave()).toEqual([next])
    tracker.saved(tracker.beforeSave())
    expect(record).toHaveBeenCalledTimes(2)
  })
  it('keeps a saved upload pending when consent has not been acknowledged', async () => {
    const record = jest.fn().mockResolvedValue(null)
    const tracker = createRecordingOutcomeTracker(record)
    const result = success()
    tracker.observe(result)

    tracker.saved(tracker.beforeSave())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(tracker.beforeSave()).toEqual([result])

    record.mockResolvedValue('event-1')
    tracker.saved(tracker.beforeSave())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(tracker.beforeSave()).toEqual([])
  })
  it('delivers failures immediately and contains logging exceptions/rejections', async () => {
    const record = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('offline')
      })
      .mockRejectedValue(new Error('offline'))
    const tracker = createRecordingOutcomeTracker(record)
    expect(() =>
      tracker.observe({ ...success(), outcome: 'failed' }),
    ).not.toThrow()
    tracker.observe(success())
    expect(() => tracker.saved(tracker.beforeSave())).not.toThrow()
    await Promise.resolve()
  })
  it.each([
    ['NotAllowedError', 'permission_denied', 'permissionDenied'],
    ['PermissionDeniedError', 'permission_denied', 'permissionDenied'],
    ['AbortError', 'failed', 'captureError'],
    ['NotFoundError', 'failed', 'deviceUnavailable'],
    ['DevicesNotFoundError', 'failed', 'deviceUnavailable'],
    ['UnknownError', 'failed', 'captureError'],
  ])('normalizes %s without exception content', (name, outcome, reason) => {
    expect(captureFailure({ name, message: 'private' }, 'permission')).toEqual([
      outcome,
      'permission',
      reason,
    ])
  })
})
