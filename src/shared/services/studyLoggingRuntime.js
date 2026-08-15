import {
  createAnswerEditTracker,
  createStudyLogger,
} from '@/shared/services/studyLoggingClient'

const RETRY_POLL_MS = 5000

export const createStudyLoggingRuntime = ({
  ownerUid,
  studyId,
  consentRequired = false,
  callFunction,
  createLogger = createStudyLogger,
  eventTarget = typeof window === 'undefined' ? null : window,
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
    void logger.flush({ online: true })
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
  const editHandlers = {
    focusin(event) {
      const fieldRef = editField(event.target)
      if (fieldRef)
        editTracker.begin(fieldRef, String(event.target.value || '').length)
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
      const eventId = await editTracker.finish(fieldRef)
      if (eventId) void logger.flush({ online: true })
      return eventId
    },
  }

  return {
    open,
    editHandlers,
    consentAccepted,
    resumeAfterConsent,
    taskFinished(taskIndex) {
      return request('TASK_ATTEMPT_FINISHED', `task:${taskIndex}`)
    },
    submitted() {
      void logger.flush({ online: true })
      return request('STUDY_SUBMITTED')
    },
    destroy() {
      clearIntervalFn(retryInterval)
      eventTarget?.removeEventListener('online', onOnline)
    },
  }
}
