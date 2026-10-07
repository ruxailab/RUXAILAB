import {
  createAnswerEditTracker,
  createQuestionResponseTracker,
  createStructuredResponseTracker,
  createStudyLogger,
} from '@/shared/services/studyLoggingClient'

const RETRY_POLL_MS = 5000
const LOGOUT_EVENT = 'study-logging-logout'
// Observations made after consent is saved but before the server acknowledges
// it are held in memory only (never IndexedDB) and dropped if it is rejected.
const MAX_PENDING_CONSENT_OBSERVATIONS = 200

export const requestStudyLoggingLogout = (ownerUid) => {
  if (!ownerUid || typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LOGOUT_EVENT, { detail: { ownerUid } }))
}

export const createStudyLoggingRuntime = ({
  ownerUid,
  studyId,
  studyType = 'USER',
  consentRequired = false,
  callFunction,
  createLogger = createStudyLogger,
  eventTarget = typeof window === 'undefined' ? null : window,
  visibilityTarget = typeof document === 'undefined' ? null : document,
  setIntervalFn = setInterval,
  clearIntervalFn = clearInterval,
} = {}) => {
  const logger = createLogger({
    ownerUid,
    studyId,
    enabled: !consentRequired,
    submitBatch: (payload) => callFunction('logEvents', payload),
  })
  const isHeuristic = String(studyType).toUpperCase() === 'HEURISTIC'
  let consentPending = false
  let consentRequest = null
  let opened = false
  let activeQuestionRef = null
  let pendingResponseDelivery = Promise.resolve()
  let pendingObservations = []

  const record = (...args) => {
    const [eventType, details, occurredAt] = args
    if (!consentRequired) return logger.record(...args)
    if (!consentPending || !ownerUid || !studyId) return Promise.resolve(null)
    if (pendingObservations.length >= MAX_PENDING_CONSENT_OBSERVATIONS) {
      return Promise.resolve(null)
    }
    pendingObservations.push({
      eventType,
      details,
      occurredAt: occurredAt || new Date().toISOString(),
    })
    return Promise.resolve('pending-consent')
  }
  const releasePendingObservations = async () => {
    const observations = pendingObservations
    pendingObservations = []
    for (const { eventType, details, occurredAt } of observations) {
      try {
        await logger.record(eventType, details, occurredAt)
      } catch {
        // Logging remains fail-open for the primary study workflow.
      }
    }
  }
  const gatedLogger = { record }
  const editTracker = createAnswerEditTracker({ logger: gatedLogger })
  const responseTracker = createQuestionResponseTracker({ logger: gatedLogger })
  const structuredTracker = createStructuredResponseTracker({
    logger: gatedLogger,
    enabled: () =>
      (!consentRequired || consentPending) && Boolean(ownerUid && studyId),
  })

  const request = async (eventType, taskRef, occurredAt) => {
    try {
      const response = await callFunction('requestLogEvent', {
        studyId,
        eventType,
        ...(taskRef ? { taskRef } : {}),
        ...(occurredAt !== undefined ? { occurredAt } : {}),
      })
      return response?.data || response
    } catch (caught) {
      const details = caught?.details || caught?.data?.details
      if (details?.retryable === false) {
        return { status: 'rejected', retryable: false }
      }
      return null
    }
  }

  const open = async (occurredAt) => {
    if (opened || consentRequired) return null
    opened = true
    const eventId = await logger.record(
      'STUDY_VIEW_OPENED',
      {},
      ...(occurredAt ? [occurredAt] : []),
    )
    void logger.flush()
    return eventId
  }

  const consentAccepted = async () => {
    if (consentRequest) return consentRequest
    consentPending = true
    const requestPromise = (async () => {
      const acknowledgement = await request('CONSENT_ACCEPTED')
      if (!['accepted', 'duplicate'].includes(acknowledgement?.status)) {
        if (acknowledgement?.retryable === false) {
          consentPending = false
          pendingObservations = []
        }
        return null
      }
      consentPending = false
      consentRequired = false
      logger.setEnabled(true)
      await releasePendingObservations()
      void Promise.resolve(logger.flush()).catch(() => {})
      return acknowledgement
    })()
    consentRequest = requestPromise
    try {
      return await requestPromise
    } finally {
      if (consentRequest === requestPromise) consentRequest = null
    }
  }

  const resumeAfterConsent = async () => {
    const enteredAt = new Date().toISOString()
    const acknowledgement = await consentAccepted()
    if (!acknowledgement) return null
    return open(enteredAt)
  }

  const onOnline = async () => {
    if (consentPending) await consentAccepted()
    await structuredTracker.retryFailedCheckpoints()
    return logger.flush({ online: true })
  }
  const retry = async () => {
    if (consentPending) await consentAccepted()
    await structuredTracker.retryFailedCheckpoints()
    return logger.flush()
  }
  eventTarget?.addEventListener('online', onOnline)
  const retryInterval = setIntervalFn(() => {
    void retry()
  }, RETRY_POLL_MS)

  const editField = (target) =>
    target?.closest?.('[data-study-field-ref]')?.dataset?.studyFieldRef
  const questionRefFor = (fieldRef) =>
    /^(heuristic:\d+:question:\d+):(answer|comment)$/.exec(fieldRef || '')?.[1]
  const activateQuestion = (questionRef) => {
    if (activeQuestionRef === questionRef) return null
    const previous = activeQuestionRef
    activeQuestionRef = questionRef
    return previous ? responseTracker.finish(previous) : null
  }
  const finishQuestionResponse = () => {
    const questionRef = activeQuestionRef
    activeQuestionRef = null
    if (questionRef) {
      const delivery = responseTracker.finish(questionRef)
      pendingResponseDelivery = Promise.all([
        pendingResponseDelivery,
        delivery,
      ]).then(() => undefined)
    }
    return pendingResponseDelivery
  }
  const activeFields = new Set()
  const finishField = async (fieldRef) => {
    if (!activeFields.delete(fieldRef)) return null
    return editTracker.finish(fieldRef)
  }
  const finishActiveEdits = () =>
    isHeuristic
      ? finishQuestionResponse()
      : Promise.all([...activeFields].map((fieldRef) => finishField(fieldRef)))
  const finishAndFlush = async () => {
    await finishActiveEdits()
    await structuredTracker.checkpointDirtyScopes()
    return logger.flush()
  }
  const finishFlushAndRequest = async (eventType, taskRef, occurredAt) => {
    try {
      await finishActiveEdits()
      await structuredTracker.checkpointDirtyScopes()
    } catch {
      // Logging remains fail-open for the primary study workflow.
    }
    void logger.flush()
    return request(eventType, taskRef, occurredAt)
  }
  const onVisibilityChange = () => {
    if (visibilityTarget?.hidden) return finishAndFlush()
    if (isHeuristic) return null
    const target = visibilityTarget?.activeElement
    const fieldRef = editField(target)
    if (fieldRef) {
      activeFields.add(fieldRef)
      editTracker.begin(fieldRef, String(target.value || '').length)
    }
    return null
  }
  const onPageHide = () => finishAndFlush()
  const onLogout = (event) => {
    if (event?.detail?.ownerUid !== ownerUid) return null
    const delivery = logger.flush()
    if (
      activeFields.size ||
      activeQuestionRef ||
      structuredTracker.hasPending()
    )
      void finishAndFlush()
    return delivery
  }
  visibilityTarget?.addEventListener('visibilitychange', onVisibilityChange)
  eventTarget?.addEventListener('pagehide', onPageHide)
  eventTarget?.addEventListener(LOGOUT_EVENT, onLogout)
  const editHandlers = {
    focusin(event) {
      const fieldRef = editField(event.target)
      if (isHeuristic) return activateQuestion(questionRefFor(fieldRef))
      if (fieldRef) {
        activeFields.add(fieldRef)
        editTracker.begin(fieldRef, String(event.target.value || '').length)
      }
    },
    input(event) {
      const fieldRef = editField(event.target)
      if (!fieldRef) return
      if (isHeuristic) {
        const questionRef = questionRefFor(fieldRef)
        activateQuestion(questionRef)
        if (questionRef && fieldRef.endsWith(':comment')) {
          responseTracker.change(questionRef, 'comment')
        }
        return
      }
      editTracker.input(fieldRef, String(event.target.value || '').length, {
        pasted: event.inputType === 'insertFromPaste',
      })
    },
    async focusout(event) {
      const fieldRef = editField(event.target)
      if (isHeuristic) return null
      if (!fieldRef) return null
      return finishField(fieldRef)
    },
  }
  const interactionHandlers = {
    click(event) {
      if (!isHeuristic) return null
      const questionRef = questionRefFor(editField(event.target))
      return questionRef
        ? activateQuestion(questionRef)
        : finishQuestionResponse()
    },
  }

  return {
    open,
    editHandlers,
    interactionHandlers,
    seedStructuredScope(scopeRef, currentValues, options) {
      return structuredTracker.seedScope(scopeRef, currentValues, options)
    },
    structuredChoiceChanged(scopeRef, itemRef, value, at) {
      return structuredTracker.choiceChanged(scopeRef, itemRef, value, at)
    },
    structuredSliderFocus(scopeRef, itemRef) {
      return structuredTracker.sliderFocus(scopeRef, itemRef)
    },
    structuredSliderPointerStart(scopeRef, itemRef, value, at) {
      return structuredTracker.sliderPointerStart(scopeRef, itemRef, value, at)
    },
    structuredSliderValueChanged(scopeRef, itemRef, value, at) {
      return structuredTracker.sliderValueChanged(scopeRef, itemRef, value, at)
    },
    structuredSliderPointerEnd(scopeRef, itemRef, value, at) {
      return structuredTracker.sliderPointerEnd(scopeRef, itemRef, value, at)
    },
    structuredSliderBlur(scopeRef, itemRef) {
      return structuredTracker.sliderBlur(scopeRef, itemRef)
    },
    checkpointStructuredScope(scopeRef) {
      return structuredTracker.checkpoint(scopeRef)
    },
    checkpointStructuredScopes() {
      return structuredTracker.checkpointDirtyScopes()
    },
    responseChanged(questionRef, field) {
      if (!isHeuristic) return null
      const pending = activateQuestion(questionRef)
      responseTracker.change(questionRef, field)
      return pending
    },
    consentAccepted,
    resumeAfterConsent,
    async recordingOutcome(details) {
      if (!ownerUid || !studyId) return null
      try {
        return await record('MEDIA_RECORDING_OUTCOME', details)
      } catch {
        return null
      }
    },
    async taskStarted(taskIndex, occurredAt) {
      if (
        !ownerUid ||
        !studyId ||
        !Number.isSafeInteger(taskIndex) ||
        taskIndex < 0
      ) {
        return null
      }
      try {
        const eventId = await record(
          'TASK_STARTED',
          { taskRef: `task:${taskIndex}` },
          occurredAt,
        )
        if (eventId) {
          try {
            void Promise.resolve(logger.flush()).catch(() => {})
          } catch {
            // Logging remains fail-open for the active task workflow.
          }
        }
        return eventId
      } catch {
        return null
      }
    },
    taskFinished(taskIndex, occurredAt) {
      return finishFlushAndRequest(
        'TASK_ATTEMPT_FINISHED',
        `task:${taskIndex}`,
        occurredAt,
      )
    },
    submitted() {
      return finishFlushAndRequest('STUDY_SUBMITTED')
    },
    destroy() {
      if (
        activeFields.size ||
        activeQuestionRef ||
        structuredTracker.hasPending()
      )
        void finishAndFlush()
      clearIntervalFn(retryInterval)
      eventTarget?.removeEventListener('online', onOnline)
      eventTarget?.removeEventListener(LOGOUT_EVENT, onLogout)
      eventTarget?.removeEventListener('pagehide', onPageHide)
      visibilityTarget?.removeEventListener(
        'visibilitychange',
        onVisibilityChange,
      )
    },
  }
}
