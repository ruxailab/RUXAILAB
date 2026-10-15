// One capture attempt owns its original task, even if the view advances during upload.
export const getRecordingFailureMessage = ({ mediaType, stage, reason }) => {
  if (
    mediaType === 'screen' &&
    stage === 'permission' &&
    ['cancelled', 'unsupported', 'wrongSurface', 'error'].includes(reason)
  ) {
    return {
      key: `errors.screenShare.${reason}`,
      severity: reason === 'cancelled' ? 'warning' : 'error',
    }
  }

  const supportedMediaTypes = ['webcam', 'audio', 'screen']
  const normalizedMediaType = supportedMediaTypes.includes(mediaType)
    ? mediaType
    : 'webcam'
  const supportedReasons = [
    'permissionDenied',
    'deviceUnavailable',
    'captureError',
    'emptyRecording',
    'uploadError',
  ]
  const normalizedReason = supportedReasons.includes(reason)
    ? reason
    : stage === 'upload'
      ? 'uploadError'
      : 'captureError'

  return {
    key: `errors.recordingFailure.${normalizedReason}`,
    mediaKey: `errors.recordingMedia.${normalizedMediaType}`,
    severity: normalizedReason === 'deviceUnavailable' ? 'warning' : 'error',
  }
}

export const createRecordingAttempt = (
  taskIndex,
  mediaType,
  emit,
  onFailure,
) => {
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
        const details = {
          taskRef: `task:${taskIndex}`,
          mediaType,
          outcome,
          stage,
          ...(reason ? { reason } : {}),
        }
        emit('recording-result', details)
        if (
          outcome === 'failed' ||
          outcome === 'cancelled' ||
          outcome === 'permission_denied'
        ) {
          onFailure?.(getRecordingFailureMessage(details))
        }
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
    if (error?.name === 'AbortError') return ['failed', stage, 'captureError']
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
