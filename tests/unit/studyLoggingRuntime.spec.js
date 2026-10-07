import { createStudyLoggingRuntime } from '@/shared/services/studyLoggingRuntime'

const createHarness = ({
  consentRequired = false,
  studyType = 'USER',
  ownerUid = 'participant',
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
    ownerUid,
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

  it('waits for consent acknowledgement before recording an outcome', async () => {
    const acknowledgement = (() => {
      let resolve
      const promise = new Promise((done) => {
        resolve = done
      })
      return { promise, resolve }
    })()
    const { runtime, logger, callFunction } = createHarness({
      consentRequired: true,
    })
    callFunction.mockReturnValue(acknowledgement.promise)

    const consent = runtime.consentAccepted()
    const outcome = runtime.recordingOutcome({
      taskRef: 'task:0',
      mediaType: 'audio',
      outcome: 'failed',
      stage: 'permission',
      reason: 'permissionDenied',
    })

    await Promise.resolve()
    expect(logger.record).not.toHaveBeenCalled()
    acknowledgement.resolve({ data: { status: 'accepted' } })
    await Promise.all([consent, outcome])

    expect(logger.record).toHaveBeenCalledWith(
      'MEDIA_RECORDING_OUTCOME',
      expect.objectContaining({ taskRef: 'task:0' }),
      expect.any(String),
    )
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

    expect(logger.record).toHaveBeenCalledWith(
      'STUDY_VIEW_OPENED',
      {},
      expect.any(String),
    )
  })

  it('records task entry only after consent using the captured occurrence time', async () => {
    const { runtime, logger } = createHarness({ consentRequired: true })
    const occurredAt = '2026-09-24T10:15:30.000Z'

    await runtime.taskStarted(0, occurredAt)
    expect(logger.record).not.toHaveBeenCalled()

    await runtime.consentAccepted()
    await runtime.taskStarted(0, occurredAt)

    expect(logger.record).toHaveBeenCalledWith(
      'TASK_STARTED',
      { taskRef: 'task:0' },
      occurredAt,
    )
    expect(logger.flush).toHaveBeenCalledWith()
    runtime.destroy()
  })

  it('contains task-start queue failures and rejects invalid task indices', async () => {
    const { runtime, logger } = createHarness()
    logger.record.mockRejectedValueOnce(new Error('queue unavailable'))

    await expect(runtime.taskStarted(0, '2026-09-24T10:15:30.000Z')).resolves.toBeNull()
    await expect(runtime.taskStarted(-1, '2026-09-24T10:15:30.000Z')).resolves.toBeNull()
    expect(logger.record).toHaveBeenCalledTimes(1)
    runtime.destroy()
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

  it('passes an optional observed finish time to the verified request', async () => {
    const { runtime, callFunction } = createHarness()
    const occurredAt = '2026-09-24T10:15:30.000Z'

    await runtime.taskFinished(0, occurredAt)

    expect(callFunction).toHaveBeenCalledWith('requestLogEvent', {
      studyId: 'study-1',
      eventType: 'TASK_ATTEMPT_FINISHED',
      taskRef: 'task:0',
      occurredAt,
    })
    runtime.destroy()
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

  it('gates structured activity until consent is committed', async () => {
    const { runtime, logger } = createHarness({ consentRequired: true })

    runtime.seedStructuredScope('task:0', { 'sus:question:0': undefined })
    runtime.structuredChoiceChanged('task:0', 'sus:question:0', 4)
    await runtime.checkpointStructuredScope('task:0')
    expect(logger.record).not.toHaveBeenCalled()

    await runtime.consentAccepted()
    runtime.structuredChoiceChanged('task:0', 'sus:question:0', 5)
    await runtime.checkpointStructuredScope('task:0')

    expect(logger.record).toHaveBeenCalledWith(
      'STRUCTURED_RESPONSE_ACTIVITY',
      {
        scopeRef: 'task:0',
        items: [{ itemRef: 'sus:question:0', changes: 1 }],
      },
      expect.any(String),
    )
    runtime.destroy()
  })

  it('flushes structured activity on hidden pages and pagehide only once per change', async () => {
    const { runtime, logger, visibilityListeners, listeners, visibilityTarget } =
      createHarness()

    runtime.seedStructuredScope('task:0', { 'sus:question:0': undefined })
    runtime.structuredChoiceChanged('task:0', 'sus:question:0', 4)
    await visibilityListeners.get('visibilitychange')()

    expect(logger.record).toHaveBeenCalledWith(
      'STRUCTURED_RESPONSE_ACTIVITY',
      expect.objectContaining({ scopeRef: 'task:0' }),
      expect.any(String),
    )
    logger.record.mockClear()

    runtime.structuredChoiceChanged('task:0', 'sus:question:0', 5)
    await listeners.get('pagehide')()
    await listeners.get('pagehide')()

    expect(logger.record).toHaveBeenCalledTimes(1)
    expect(logger.flush).toHaveBeenCalled()
    visibilityTarget.hidden = false
    runtime.destroy()
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

describe('recording observations', () => {
  const details = {
    taskRef: 'task:0',
    mediaType: 'audio',
    outcome: 'completed',
    stage: 'upload',
  }
  describe('observations between saved consent and its acknowledgement', () => {
    const deferred = () => {
      let resolve
      const promise = new Promise((done) => {
        resolve = done
      })
      return { promise, resolve }
    }
    const textInput = (fieldRef) => ({
      value: '',
      closest: () => ({ dataset: { studyFieldRef: fieldRef } }),
    })
    const editField = async (runtime, fieldRef) => {
      const target = textInput(fieldRef)
      runtime.editHandlers.focusin({ target })
      target.value = 'typed text'
      runtime.editHandlers.input({ target, inputType: 'insertText' })
      await runtime.editHandlers.focusout({ target })
    }

    it('keeps early pre-test choices and edits and releases them on acknowledgement', async () => {
      const acknowledgement = deferred()
      const { runtime, logger, callFunction } = createHarness({
        consentRequired: true,
      })
      callFunction.mockReturnValue(acknowledgement.promise)
      runtime.seedStructuredScope('preTest', {
        'preTest:question:0': '',
        'preTest:question:2': '',
      })

      const consent = runtime.consentAccepted()
      runtime.structuredChoiceChanged('preTest', 'preTest:question:0', 'A')
      await editField(runtime, 'preTest:1:answer')
      await runtime.checkpointStructuredScope('preTest')
      expect(logger.record).not.toHaveBeenCalled()

      acknowledgement.resolve({ data: { status: 'accepted' } })
      await consent
      runtime.structuredChoiceChanged('preTest', 'preTest:question:2', 'B')
      await runtime.checkpointStructuredScope('preTest')

      const recorded = logger.record.mock.calls.map(([type, details]) => [
        type,
        details.fieldRef || details.items,
      ])
      expect(recorded).toEqual([
        ['ANSWER_EDITED', 'preTest:1:answer'],
        [
          'STRUCTURED_RESPONSE_ACTIVITY',
          [{ itemRef: 'preTest:question:0', changes: 1 }],
        ],
        [
          'STRUCTURED_RESPONSE_ACTIVITY',
          [{ itemRef: 'preTest:question:2', changes: 1 }],
        ],
      ])
      expect(logger.record.mock.calls[0][2]).toEqual(expect.any(String))
      runtime.destroy()
    })

    it('keeps early post-test activity after a resumed session is acknowledged', async () => {
      const acknowledgement = deferred()
      const { runtime, logger, callFunction } = createHarness({
        consentRequired: true,
      })
      callFunction.mockReturnValue(acknowledgement.promise)

      const resumed = runtime.resumeAfterConsent()
      runtime.seedStructuredScope('postTest', { 'postTest:question:0': '' })
      runtime.structuredChoiceChanged('postTest', 'postTest:question:0', 'Yes')
      await runtime.checkpointStructuredScope('postTest')
      acknowledgement.resolve({ data: { status: 'duplicate' } })
      await resumed

      expect(logger.record.mock.calls.map(([type]) => type)).toEqual([
        'STRUCTURED_RESPONSE_ACTIVITY',
        'STUDY_VIEW_OPENED',
      ])
      const [, [, , openedAt]] = logger.record.mock.calls
      expect(Date.parse(openedAt)).toBeLessThanOrEqual(
        Date.parse(logger.record.mock.calls[0][2]),
      )
      runtime.destroy()
    })

    it('holds activity across a retried acknowledgement', async () => {
      const { runtime, logger, callFunction, runInterval } = createHarness({
        consentRequired: true,
      })
      callFunction.mockRejectedValueOnce(new Error('cold start timeout'))

      await runtime.consentAccepted()
      await editField(runtime, 'postTest:0:answer')
      expect(logger.record).not.toHaveBeenCalled()

      runInterval()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(logger.record).toHaveBeenCalledWith(
        'ANSWER_EDITED',
        expect.objectContaining({ fieldRef: 'postTest:0:answer' }),
        expect.any(String),
      )
      runtime.destroy()
    })

    it('discards held activity when consent is permanently rejected', async () => {
      const acknowledgement = deferred()
      const { runtime, logger, callFunction, runInterval } = createHarness({
        consentRequired: true,
      })
      callFunction.mockReturnValueOnce(acknowledgement.promise)

      const consent = runtime.consentAccepted()
      await editField(runtime, 'preTest:0:answer')
      acknowledgement.resolve(
        Promise.reject({
          details: { retryable: false, reasonCode: 'UNVERIFIED_TRANSITION' },
        }),
      )
      await consent
      await runtime.consentAccepted()
      runInterval()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(logger.record).not.toHaveBeenCalled()
      runtime.destroy()
    })

    it('never holds activity before consent is saved', async () => {
      const { runtime, logger } = createHarness({ consentRequired: true })

      runtime.structuredChoiceChanged('preTest', 'preTest:question:0', 'A')
      await editField(runtime, 'preTest:1:answer')
      await runtime.checkpointStructuredScope('preTest')
      await runtime.consentAccepted()
      await runtime.checkpointStructuredScope('preTest')

      expect(logger.record).not.toHaveBeenCalled()
      runtime.destroy()
    })

    it('bounds the in-memory hold', async () => {
      const acknowledgement = deferred()
      const { runtime, logger, callFunction } = createHarness({
        consentRequired: true,
      })
      callFunction.mockReturnValue(acknowledgement.promise)

      const consent = runtime.consentAccepted()
      for (let index = 0; index < 205; index += 1) {
        await runtime.taskStarted(0)
      }
      acknowledgement.resolve({ data: { status: 'accepted' } })
      await consent

      expect(logger.record).toHaveBeenCalledTimes(200)
      runtime.destroy()
    })
  })

  it('does not record before committed consent, including a failed acknowledgement', async () => {
    const { runtime, logger, callFunction } = createHarness({
      consentRequired: true,
    })
    await runtime.recordingOutcome(details)
    callFunction.mockRejectedValueOnce(new Error('offline'))
    await runtime.consentAccepted()
    await runtime.recordingOutcome(details)
    expect(logger.record).not.toHaveBeenCalled()
    await runtime.consentAccepted()
    await runtime.recordingOutcome(details)
    expect(logger.record).toHaveBeenCalledWith(
      'MEDIA_RECORDING_OUTCOME',
      details,
    )
    runtime.destroy()
  })
  it('does not record without an authenticated owner', async () => {
    const { runtime, logger } = createHarness({ ownerUid: null })
    await runtime.recordingOutcome(details)
    expect(logger.record).not.toHaveBeenCalled()
    runtime.destroy()
  })
  it('contains unavailable queue failures', async () => {
    const { runtime, logger } = createHarness()
    logger.record.mockRejectedValueOnce(new Error('queue unavailable'))
    await expect(runtime.recordingOutcome(details)).resolves.toBeNull()
    runtime.destroy()
  })
})
