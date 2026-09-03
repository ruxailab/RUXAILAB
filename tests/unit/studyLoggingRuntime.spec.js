import { createStudyLoggingRuntime } from '@/shared/services/studyLoggingRuntime'

const createHarness = ({
  consentRequired = false,
  studyType = 'USER',
} = {}) => {
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
  const visibilityListeners = new Map()
  let intervalHandler
  const eventTarget = {
    addEventListener: jest.fn((name, handler) => listeners.set(name, handler)),
    removeEventListener: jest.fn((name) => listeners.delete(name)),
  }
  const clearIntervalFn = jest.fn()
  const visibilityTarget = {
    hidden: true,
    addEventListener: jest.fn((name, handler) =>
      visibilityListeners.set(name, handler),
    ),
    removeEventListener: jest.fn((name) => visibilityListeners.delete(name)),
  }
  const runtime = createStudyLoggingRuntime({
    ownerUid: 'participant',
    studyId: 'study-1',
    studyType,
    consentRequired,
    callFunction,
    createLogger: () => logger,
    eventTarget,
    visibilityTarget,
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
    visibilityListeners,
    visibilityTarget,
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

  it('does not retry a permanently rejected consent transition', async () => {
    const { runtime, callFunction, listeners } = createHarness({
      consentRequired: true,
    })
    callFunction.mockRejectedValue({
      details: { retryable: false, reasonCode: 'UNVERIFIED_TRANSITION' },
    })

    await runtime.consentAccepted()
    await listeners.get('online')()

    expect(callFunction).toHaveBeenCalledTimes(1)
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

  it('reserves the immediate retry override for a real online transition', async () => {
    const { runtime, logger, listeners } = createHarness()

    await runtime.open()
    expect(logger.flush).toHaveBeenLastCalledWith()

    await listeners.get('online')()
    expect(logger.flush).toHaveBeenLastCalledWith({ online: true })
  })

  it('finishes a focused edit before best-effort hidden-page delivery', async () => {
    const { runtime, logger, visibilityListeners } = createHarness()
    document.body.innerHTML = `
      <div data-study-field-ref="preTest:0:answer">
        <input value="old" />
      </div>
    `
    const input = document.querySelector('input')
    runtime.editHandlers.focusin({ target: input })
    input.value = 'private answer'
    runtime.editHandlers.input({ target: input, inputType: 'insertText' })

    await visibilityListeners.get('visibilitychange')()

    expect(logger.record).toHaveBeenCalledWith(
      'ANSWER_EDITED',
      expect.objectContaining({ fieldRef: 'preTest:0:answer' }),
    )
    expect(logger.flush).toHaveBeenCalledWith()
  })

  it('restarts tracking a focused field when the page becomes visible', async () => {
    const { runtime, logger, visibilityListeners, visibilityTarget } =
      createHarness()
    document.body.innerHTML = `
      <div data-study-field-ref="preTest:0:answer">
        <input value="old" />
      </div>
    `
    const input = document.querySelector('input')
    runtime.editHandlers.focusin({ target: input })
    input.value = 'private answer'
    runtime.editHandlers.input({ target: input, inputType: 'insertText' })
    await visibilityListeners.get('visibilitychange')()
    logger.record.mockClear()

    visibilityTarget.hidden = false
    visibilityTarget.activeElement = input
    visibilityListeners.get('visibilitychange')()
    input.value = 'private answer!'
    runtime.editHandlers.input({ target: input, inputType: 'insertText' })
    await runtime.editHandlers.focusout({ target: input })

    expect(logger.record).toHaveBeenCalledWith(
      'ANSWER_EDITED',
      expect.objectContaining({
        fieldRef: 'preTest:0:answer',
        editOperations: 1,
        initialLength: 14,
        resultingLength: 15,
      }),
    )
  })

  it('finishes a focused edit when task navigation requests its lifecycle event', async () => {
    const { runtime, logger } = createHarness()
    document.body.innerHTML = `
      <div data-study-field-ref="task:0:comment">
        <input value="old" />
      </div>
    `
    const input = document.querySelector('input')
    runtime.editHandlers.focusin({ target: input })
    input.value = 'private answer'
    runtime.editHandlers.input({ target: input, inputType: 'insertText' })

    await runtime.taskFinished(0)
    await Promise.resolve()

    expect(logger.record).toHaveBeenCalledWith(
      'ANSWER_EDITED',
      expect.objectContaining({ fieldRef: 'task:0:comment' }),
    )
  })

  it('queues a completed field edit without sending a request on blur', async () => {
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
      expect.objectContaining({ fieldRef: 'preTest:0:answer' }),
    )
    expect(logger.flush).not.toHaveBeenCalled()
  })

  it('attempts an owner-matched flush when explicit logout begins', async () => {
    const { logger, listeners } = createHarness()

    await listeners.get('study-logging-logout')({
      detail: { ownerUid: 'participant' },
    })

    expect(logger.flush).toHaveBeenCalledWith()
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

  it('initiates submission flushing before requesting the verified event', async () => {
    const { runtime, logger, callFunction } = createHarness()
    const calls = []
    logger.flush.mockImplementation(() => {
      calls.push('flush')
      return Promise.resolve({ status: 'accepted' })
    })
    callFunction.mockImplementation(() => {
      calls.push('request')
      return Promise.resolve({ data: { status: 'accepted' } })
    })

    await runtime.submitted()

    expect(calls).toEqual(['flush', 'request'])
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

  it('groups heuristic ratings and comment inputs into one question update', async () => {
    const { runtime, logger } = createHarness({ studyType: 'HEURISTIC' })
    document.body.innerHTML = `
      <section data-study-field-ref="heuristic:1:question:2:comment">
        <textarea></textarea>
      </section>
      <button id="leave-question"></button>
    `
    const input = document.querySelector('textarea')
    const questionRef = 'heuristic:1:question:2'

    runtime.responseChanged(questionRef, 'frequency')
    runtime.responseChanged(questionRef, 'severity')
    runtime.responseChanged(questionRef, 'severity')
    runtime.editHandlers.input({ target: input, inputType: 'insertText' })
    runtime.editHandlers.input({ target: input, inputType: 'insertText' })
    await runtime.interactionHandlers.click({
      target: document.querySelector('#leave-question'),
    })

    expect(logger.record).toHaveBeenCalledWith(
      'QUESTION_RESPONSE_UPDATED',
      expect.objectContaining({
        questionRef,
        changedFields: ['frequency', 'severity', 'comment'],
        frequencyChanges: 1,
        severityChanges: 2,
        commentInputChanges: 2,
      }),
      expect.any(String),
    )
    expect(logger.record).not.toHaveBeenCalledWith(
      'ANSWER_EDITED',
      expect.anything(),
    )
  })
})
