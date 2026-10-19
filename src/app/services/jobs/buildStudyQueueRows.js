const UI_TYPE = {
  transcription: 'transcription',
  facial: 'facialSentiment',
  text: 'textSentiment',
}

const EXPECTED = [
  {
    type: 'transcription',
    when: (task) => Boolean(task?.audioRecordURL || task?.moderatorAudioURL),
  },
  {
    type: 'facialSentiment',
    when: (task) => Boolean(task?.webcamRecordURL),
  },
  {
    type: 'textSentiment',
    when: (task) => Boolean(task?.audioRecordURL || task?.moderatorAudioURL),
  },
]

function taskEntries(tasks) {
  if (!tasks) return []
  if (Array.isArray(tasks)) {
    return tasks.map((task, index) => [String(task?.taskId ?? index), task])
  }
  return Object.entries(tasks).map(([key, task]) => [
    String(task?.taskId ?? key),
    task,
  ])
}

function taskMeta(taskId, userTasks) {
  const list = Array.isArray(userTasks) ? userTasks : []
  const id = String(taskId)
  const byId = list.find(
    (task) => String(task?.id ?? task?.taskId ?? '') === id,
  )
  const index = Number(id)
  const byIndex = Number.isInteger(index) ? list[index] : null
  const task = byId || byIndex
  const taskNumber = Number.isInteger(index) ? index + 1 : null
  return {
    taskLabel: task?.taskName || null,
    taskNumber,
  }
}

function progressOf(job) {
  if (typeof job?.progress === 'number') return job.progress
  if (job?.status === 'done') return 100
  return 0
}

function rowKey(type, userDocId, taskId) {
  return `${type}|${userDocId}|${String(taskId)}`
}

function toMillis(value) {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.toDate === 'function') {
    const time = value.toDate()?.getTime?.()
    return Number.isFinite(time) ? time : null
  }
  if (typeof value.seconds === 'number') {
    return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6)
  }
  if (typeof value._seconds === 'number') {
    return (
      value._seconds * 1000 + Math.floor((value._nanoseconds || 0) / 1e6)
    )
  }
  if (typeof value === 'string') {
    const time = Date.parse(value)
    return Number.isFinite(time) ? time : null
  }
  return null
}

function byUpdatedAtDesc(left, right) {
  if (left.updatedAt == null && right.updatedAt == null) return 0
  if (left.updatedAt == null) return 1
  if (right.updatedAt == null) return -1
  return right.updatedAt - left.updatedAt
}

/**
 * Turns stored queue jobs and participant answers into rows for the study dashboard.
 * A row is missing when the answer already has the media that job expects and no job exists.
 *
 * @param {object} params
 * @param {object[]} [params.jobs]
 * @param {object} [params.taskAnswers]
 * @param {object[]} [params.userTasks]
 * @returns {object[]}
 */
export function buildStudyQueueRows({
  jobs = [],
  taskAnswers = {},
  userTasks = [],
} = {}) {
  const participants = new Map()
  Object.entries(taskAnswers || {}).forEach(([key, answer]) => {
    if (!answer || typeof answer !== 'object' || answer.hidden === true) return
    const userDocId = answer.userDocId || key
    participants.set(String(userDocId), answer.fullName || '')
  })

  const covered = new Set()
  const rows = []
  jobs.forEach((job) => {
    const type = UI_TYPE[job.type] || job.type
    const userDocId = job.userDocId ? String(job.userDocId) : ''
    const taskId = job.taskId != null ? String(job.taskId) : ''
    if (type && userDocId && taskId) {
      covered.add(rowKey(type, userDocId, taskId))
    }
    if (job.status === 'cancelled') return
    rows.push({
      id: job.id || job.jobId,
      type,
      participant: participants.get(userDocId) || '',
      userDocId,
      ...taskMeta(taskId, userTasks),
      status: job.status || 'queued',
      progress: progressOf(job),
      error: job.error || null,
      updatedAt: toMillis(job.updatedAt),
    })
  })

  Object.entries(taskAnswers || {}).forEach(([key, answer]) => {
    if (!answer || typeof answer !== 'object' || answer.hidden === true) return
    const userDocId = String(answer.userDocId || key)
    taskEntries(answer.tasks).forEach(([taskId, task]) => {
      EXPECTED.forEach(({ type, when }) => {
        if (!when(task)) return
        const key = rowKey(type, userDocId, taskId)
        if (covered.has(key)) return
        covered.add(key)
        rows.push({
          id: `missing:${key}`,
          type,
          participant: answer.fullName || '',
          userDocId,
          ...taskMeta(taskId, userTasks),
          status: 'missing',
          progress: 0,
          error: null,
          updatedAt: null,
        })
      })
    })
  })

  return rows.sort(byUpdatedAtDesc)
}
