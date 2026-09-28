const TASK_TYPES = new Set([
  'no-answer',
  'post-test',
  'text-area',
  'post-form',
  'nasa-tlx',
  'sus',
  'tam-1',
  'tam-2',
  'tam-3',
  'sart',
])
const MEDIA_FLAGS = {
  audio: 'hasAudioRecord',
  webcam: 'hasCamRecord',
  screen: 'hasScreenRecord',
}

const taskFor = (study, taskRef) => {
  if (study.testType !== 'USER' || study.subType !== 'USER_UNMODERATED')
    return null
  const match = /^task:(0|[1-9]\d*)$/.exec(taskRef)
  return match ? study.testStructure?.userTasks?.[Number(match[1])] : null
}

export const taskContext = (study, taskRef, includeRecordingTypes = false) => {
  const task = taskFor(study, taskRef)
  if (!task) return {}
  return {
    ...(TASK_TYPES.has(task.taskType) ? { taskType: task.taskType } : {}),
    ...(includeRecordingTypes
      ? {
          recordingTypes: Object.keys(MEDIA_FLAGS).filter(
            (type) => task[MEDIA_FLAGS[type]] === true,
          ),
        }
      : {}),
  }
}

// Browser observations are not verified media integrity or participant intent.
export const recordingPolicy = (study, details) => {
  const allowed = ['taskRef', 'mediaType', 'outcome', 'stage', 'reason']
  if (Object.keys(details).some((key) => !allowed.includes(key))) return null
  const { taskRef, mediaType, outcome, stage, reason } = details
  if (
    ![taskRef, mediaType, outcome, stage].every(
      (value) => typeof value === 'string',
    )
  )
    return null
  const task = taskFor(study, taskRef)
  if (
    !Object.hasOwn(MEDIA_FLAGS, mediaType) ||
    task?.[MEDIA_FLAGS[mediaType]] !== true
  )
    return null

  const reasons = {
    'completed:upload': [],
    'permission_denied:permission': ['permissionDenied'],
    'cancelled:permission': mediaType === 'screen' ? ['cancelled'] : null,
    'failed:permission': [
      'deviceUnavailable',
      'captureError',
      ...(mediaType === 'screen'
        ? ['unsupported', 'wrongSurface', 'error']
        : []),
    ],
    'failed:capture': ['captureError', 'emptyRecording'],
    'failed:upload': ['uploadError'],
  }[`${outcome}:${stage}`]
  if (!reasons || (reason !== undefined && !reasons.includes(reason)))
    return null
  const messages = {
    completed: 'Recording captured and saved',
    failed: 'Recording failed',
    permission_denied: 'Recording permission was not granted',
    cancelled: 'Screen sharing was cancelled',
  }
  return {
    layer: 'technical',
    level:
      outcome === 'completed'
        ? 'info'
        : outcome === 'failed'
          ? 'error'
          : 'warning',
    message: messages[outcome],
    details: {
      taskRef,
      mediaType,
      outcome,
      stage,
      ...(reason !== undefined ? { reason } : {}),
      ...taskContext(study, taskRef),
    },
  }
}
