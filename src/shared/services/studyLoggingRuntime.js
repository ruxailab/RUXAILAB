import {
  createAnswerEditTracker,
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
  let consentPending = false
  let opened = false

  const request = async (eventType, taskRef) => {
    try {
      const response = await callFunction('requestLogEvent', {
        studyId,
        eventType,
        ...(taskRef ? { taskRef } : {}),
      })
      return response?.data || response
    } catch {
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
    if (!['accepted', 'duplicate'].includes(acknowledgement?.status))
      return null
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
  const activeFields = new Set()
  const finishField = async (fieldRef) => {
    if (!activeFields.delete(fieldRef)) return null
    return editTracker.finish(fieldRef)
  }
  const finishActiveEdits = () =>
    Promise.all([...activeFields].map((fieldRef) => finishField(fieldRef)))
  const finishAndFlush = async () => {
    await finishActiveEdits()
    return logger.flush()
  }
  const onVisibilityChange = () => {
    if (visibilityTarget?.hidden) return finishAndFlush()
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
    if (activeFields.size) void finishAndFlush()
    return delivery
  }
  visibilityTarget?.addEventListener('visibilitychange', onVisibilityChange)
  eventTarget?.addEventListener(LOGOUT_EVENT, onLogout)
  const editHandlers = {
    focusin(event) {
      const fieldRef = editField(event.target)
      if (fieldRef) {
        activeFields.add(fieldRef)
        editTracker.begin(fieldRef, String(event.target.value || '').length)
      }
    },
    input(event) {
      const fieldRef = editField(event.target)
      if (!fieldRef) return
      editTracker.input(fieldRef, String(event.target.value || '').length, {
        pasted: event.inputType === 'insertFromPaste',
      })
    },
    async focusout(event) {
      const fieldRef = editField(event.target)
      if (!fieldRef) return null
      const eventId = await finishField(fieldRef)
      if (eventId) void logger.flush()
      return eventId
    },
  }

  return {
    open,
    editHandlers,
    consentAccepted,
    resumeAfterConsent,
    taskFinished(taskIndex) {
      void finishAndFlush()
      return request('TASK_ATTEMPT_FINISHED', `task:${taskIndex}`)
    },
    submitted() {
      void finishAndFlush()
      return request('STUDY_SUBMITTED')
    },
    destroy() {
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
