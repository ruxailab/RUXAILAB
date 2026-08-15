import { createStudyLoggingRuntime } from '@/shared/services/studyLoggingRuntime'

const createHarness = ({ consentRequired = false } = {}) => {
  const logger = {
    record: jest.fn().mockResolvedValue('event-1'),
    flush: jest.fn().mockResolvedValue({ status: 'accepted' }),
    cleanup: jest.fn(),
    setEnabled: jest.fn(),
  }
  const callFunction = jest.fn().mockResolvedValue({
    data: { status: 'accepted' },
  })
  const listeners = new Map()
  let intervalHandler
  const eventTarget = {
    addEventListener: jest.fn((name, handler) => listeners.set(name, handler)),
    removeEventListener: jest.fn((name) => listeners.delete(name)),
  }
  const clearIntervalFn = jest.fn()
  const runtime = createStudyLoggingRuntime({
    ownerUid: 'participant',
    studyId: 'study-1',
    consentRequired,
    callFunction,
    createLogger: () => logger,
    eventTarget,
    setIntervalFn: jest.fn((handler) => {
      intervalHandler = handler
      return 42
    }),
    clearIntervalFn,
  })
  return {
    runtime,
    logger,
    callFunction,
    listeners,
    clearIntervalFn,
    runInterval: () => intervalHandler(),
  }
}

describe('study logging runtime', () => {
  it('keeps gated logging disabled until committed consent is acknowledged', async () => {
    const { runtime, logger, callFunction } = createHarness({
      consentRequired: true,
    })

    await runtime.open()
    expect(logger.record).not.toHaveBeenCalled()

    await runtime.consentAccepted()
    expect(callFunction).toHaveBeenCalledWith('requestLogEvent', {
      studyId: 'study-1',
      eventType: 'CONSENT_ACCEPTED',
    })
    expect(logger.setEnabled).toHaveBeenCalledWith(true)
    expect(logger.record).not.toHaveBeenCalled()
  })

  it('retries an unacknowledged consent gate when connectivity returns', async () => {
    const { runtime, logger, callFunction, listeners } = createHarness({
      consentRequired: true,
    })
    callFunction.mockRejectedValueOnce(new Error('offline'))

    await runtime.consentAccepted()
    expect(logger.record).not.toHaveBeenCalled()
    await listeners.get('online')()

    expect(callFunction).toHaveBeenCalledTimes(2)
    expect(logger.record).not.toHaveBeenCalled()
  })

  it('records a route opening only when consent was already committed before entry', async () => {
    const { runtime, logger } = createHarness({ consentRequired: true })

    await runtime.resumeAfterConsent()

    expect(logger.record).toHaveBeenCalledWith('STUDY_VIEW_OPENED', {})
  })

  it('respects queued-event backoff during periodic retries', async () => {
    const { logger, runInterval } = createHarness()

    await runInterval()

    expect(logger.flush).toHaveBeenCalledWith()
    expect(logger.flush).not.toHaveBeenCalledWith({ online: true })
  })

  it('flushes observations without delaying verified lifecycle requests', async () => {
    const { runtime, logger, callFunction, clearIntervalFn } = createHarness()

    await runtime.open()
    await runtime.taskFinished(2)
    await runtime.submitted()
    runtime.destroy()

    expect(callFunction).toHaveBeenCalledWith('requestLogEvent', {
      studyId: 'study-1',
      eventType: 'TASK_ATTEMPT_FINISHED',
      taskRef: 'task:2',
    })
    expect(callFunction).toHaveBeenCalledWith('requestLogEvent', {
      studyId: 'study-1',
      eventType: 'STUDY_SUBMITTED',
    })
    expect(logger.flush).toHaveBeenCalled()
    expect(clearIntervalFn).toHaveBeenCalledWith(42)
  })

  it('turns delegated text edits into metadata without retaining the value', async () => {
    const { runtime, logger } = createHarness()
    document.body.innerHTML = `
      <div data-study-field-ref="preTest:0:answer">
        <input value="old" />
      </div>
    `
    const input = document.querySelector('input')

    runtime.editHandlers.focusin({ target: input })
    input.value = 'private answer'
    runtime.editHandlers.input({ target: input, inputType: 'insertText' })
    await runtime.editHandlers.focusout({ target: input })

    expect(logger.record).toHaveBeenCalledWith(
      'ANSWER_EDITED',
      expect.objectContaining({
        fieldRef: 'preTest:0:answer',
        editOperations: 1,
        pasteOperations: 0,
        initialLength: 3,
        resultingLength: 14,
      }),
    )
    expect(JSON.stringify(logger.record.mock.calls)).not.toContain(
      'private answer',
    )
  })
})
