// One capture attempt owns its original task, even if the view advances during upload.
export const createRecordingAttempt = (taskIndex, mediaType, emit) => {
  let finished = false
  let uploading = false
  return {
    beginUpload() {
      if (finished || uploading) return false
      uploading = true
      return true
    },
    discard() {
      finished = true
    },
    finish(outcome, stage, reason) {
      if (finished) return false
      finished = true
      try {
        emit('recording-result', {
          taskRef: `task:${taskIndex}`,
          mediaType,
          outcome,
          stage,
          ...(reason ? { reason } : {}),
        })
      } catch {
        // Observing an outcome must never change the recording workflow.
      }
      return true
    },
  }
}

export const captureFailure = (error, stage) => {
  if (stage === 'permission') {
    if (['NotAllowedError', 'PermissionDeniedError'].includes(error?.name)) {
      return ['permission_denied', stage, 'permissionDenied']
    }
    if (error?.name === 'AbortError') return ['cancelled', stage, 'cancelled']
    if (['NotFoundError', 'DevicesNotFoundError'].includes(error?.name)) {
      return ['failed', stage, 'deviceUnavailable']
    }
  }
  return ['failed', stage, 'captureError']
}

// This holds metadata only. The existing answer state remains the owner of media URLs.
export const createRecordingOutcomeTracker = (record) => {
  const pending = new Map()
  const delivered = new WeakSet()
  const keyFor = ({ taskRef, mediaType }) => `${taskRef}:${mediaType}`
  const restorePending = (details) => {
    delivered.delete(details)
    const key = keyFor(details)
    if (!pending.has(key) || pending.get(key) === details)
      pending.set(keyFor(details), details)
  }
  const deliver = (details) => {
    try {
      Promise.resolve(record(details)).catch(() => {})
    } catch {
      // Logging is secondary to successful answer persistence.
    }
  }
  const deliverSaved = (details) => {
    try {
      const result = record(details)
      if (result === null) {
        restorePending(details)
        return
      }
      if (result && typeof result.then === 'function') {
        Promise.resolve(result)
          .then((value) => {
            if (value === null) restorePending(details)
          })
          .catch(() => restorePending(details))
      }
    } catch {
      restorePending(details)
    }
  }
  return {
    observe(details) {
      if (details.outcome === 'completed') pending.set(keyFor(details), details)
      else deliver(details)
    },
    beforeSave() {
      return [...pending.values()]
    },
    saved(snapshot) {
      for (const details of snapshot) {
        if (delivered.has(details)) continue
        delivered.add(details)
        if (pending.get(keyFor(details)) === details)
          pending.delete(keyFor(details))
        deliverSaved(details)
      }
    },
  }
}
