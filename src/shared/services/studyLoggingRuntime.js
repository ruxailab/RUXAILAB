import {
  createAnswerEditTracker,
  createQuestionResponseTracker,
  createStudyLogger,
} from '@/shared/services/studyLoggingClient'

const RETRY_POLL_MS = 5000
const LOGOUT_EVENT = 'study-logging-logout'

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
  const editTracker = createAnswerEditTracker({ logger })
  const responseTracker = createQuestionResponseTracker({ logger })
  const isHeuristic = String(studyType).toUpperCase() === 'HEURISTIC'
  let consentPending = false
  let opened = false
  let activeQuestionRef = null
  let pendingResponseDelivery = Promise.resolve()

  const request = async (eventType, taskRef) => {
    try {
      const response = await callFunction('requestLogEvent', {
        studyId,
        eventType,
        ...(taskRef ? { taskRef } : {}),
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

  const open = async () => {
    if (opened || consentRequired) return null
    opened = true
    const eventId = await logger.record('STUDY_VIEW_OPENED', {})
    void logger.flush()
    return eventId
  }

  const consentAccepted = async () => {
    consentPending = true
    const acknowledgement = await request('CONSENT_ACCEPTED')
    if (!['accepted', 'duplicate'].includes(acknowledgement?.status)) {
      if (acknowledgement?.retryable === false) consentPending = false
      return null
    }
    consentPending = false
    consentRequired = false
    logger.setEnabled(true)
    return acknowledgement
  }

  const resumeAfterConsent = async () => {
    const acknowledgement = await consentAccepted()
    if (!acknowledgement) return null
    return open()
  }

  const onOnline = async () => {
    if (consentPending) await consentAccepted()
    return logger.flush({ online: true })
  }
  const retry = async () => {
    if (consentPending) await consentAccepted()
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
    return logger.flush()
  }
  const finishFlushAndRequest = async (eventType, taskRef) => {
    try {
      await finishActiveEdits()
    } catch {
      // Logging remains fail-open for the primary study workflow.
    }
    void logger.flush()
    return request(eventType, taskRef)
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
  const onLogout = (event) => {
    if (event?.detail?.ownerUid !== ownerUid) return null
    const delivery = logger.flush()
    if (activeFields.size || activeQuestionRef) void finishAndFlush()
    return delivery
  }
  visibilityTarget?.addEventListener('visibilitychange', onVisibilityChange)
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
    responseChanged(questionRef, field) {
      if (!isHeuristic) return null
      const pending = activateQuestion(questionRef)
      responseTracker.change(questionRef, field)
      return pending
    },
    consentAccepted,
    resumeAfterConsent,
    taskFinished(taskIndex) {
      return finishFlushAndRequest('TASK_ATTEMPT_FINISHED', `task:${taskIndex}`)
    },
    submitted() {
      return finishFlushAndRequest('STUDY_SUBMITTED')
    },
    destroy() {
      if (activeQuestionRef) void finishAndFlush()
      clearIntervalFn(retryInterval)
      eventTarget?.removeEventListener('online', onOnline)
      eventTarget?.removeEventListener(LOGOUT_EVENT, onLogout)
      visibilityTarget?.removeEventListener(
        'visibilitychange',
        onVisibilityChange,
      )
    },
  }
}
