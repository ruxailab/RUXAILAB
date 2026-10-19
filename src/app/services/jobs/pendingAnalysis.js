function sessionTaskRows(userAnswers) {
  const rows = []

  for (const [userKey, session] of Object.entries(userAnswers || {})) {
    if (!session || typeof session !== 'object' || session.hidden === true) {
      continue
    }

    const tasks = session.tasks
    if (!tasks || typeof tasks !== 'object') continue

    const entries = Array.isArray(tasks)
      ? tasks.map((task, index) => [String(task?.taskId ?? index), task])
      : Object.entries(tasks)

    for (const [taskKey, task] of entries) {
      if (!task || typeof task !== 'object') continue
      rows.push({
        userDocId: String(session.userDocId || userKey),
        taskId: String(taskKey),
        task,
      })
    }
  }

  return rows
}

function matchesScope(row, { userDocId, taskId } = {}) {
  if (userDocId && userDocId !== 'all' && row.userDocId !== String(userDocId)) {
    return false
  }
  if (
    taskId &&
    taskId !== 'all' &&
    row.taskId !== String(taskId) &&
    String(row.task?.taskId ?? '') !== String(taskId)
  ) {
    return false
  }
  return true
}

const IN_FLIGHT_STATUSES = new Set(['queued', 'processing'])

function isInFlight(jobs, { type, userDocId, taskId }) {
  return (jobs || []).some(
    (job) =>
      job?.type === type &&
      String(job.userDocId) === String(userDocId) &&
      String(job.taskId) === String(taskId) &&
      IN_FLIGHT_STATUSES.has(job.status),
  )
}

function findContribution(coverage, row) {
  if (!coverage) return null
  const keys = [`${row.userDocId}|${row.taskId}`]
  if (row.task?.taskId != null) {
    keys.push(`${row.userDocId}|${String(row.task.taskId)}`)
  }
  for (const key of keys) {
    if (coverage.has(key)) return coverage.get(key)
  }
  return null
}

function hasNumericSignal(data, keys) {
  if (!data || typeof data !== 'object') return false
  if (Number(data.sampleCount) > 0) return true
  return keys.some((key) => {
    const value = data[key] ?? data[key.toLowerCase()]
    return Number(value) > 0
  })
}

function mediaUrl(value) {
  if (typeof value === 'string' && value.trim()) return value
  if (value && typeof value === 'object') {
    const nested = value.url || value.downloadURL || value.downloadUrl
    if (typeof nested === 'string' && nested.trim()) return nested
  }
  return ''
}

export function webcamMediaUrl(task) {
  return mediaUrl(task?.webcamRecordURL) || mediaUrl(task?.videoRecordURL)
}

export function canRunFacialSentiment(task) {
  return Boolean(webcamMediaUrl(task))
}

export function canRunTextSentiment(task) {
  return Boolean(task?.audioRecordURL || task?.moderatorAudioURL)
}

export function canRunTranscription(task) {
  return Boolean(task?.audioRecordURL || task?.moderatorAudioURL)
}

export function hasFacialSentimentResult(task, contribution) {
  if (hasNumericSignal(contribution?.facial, [
    'Happy',
    'Sad',
    'Angry',
    'Surprised',
    'Neutral',
    'Disgusted',
    'Fearful',
  ])) {
    return true
  }
  return hasNumericSignal(task?.facialSentimentResults, [
    'Happy',
    'Sad',
    'Angry',
    'Surprised',
    'Neutral',
    'Disgusted',
    'Fearful',
  ])
}

function hasStoredTextAnalysis(data) {
  return Boolean(
    data &&
      typeof data === 'object' &&
      Object.prototype.hasOwnProperty.call(data, 'sampleCount'),
  )
}

export function hasTextSentimentResult(task, contribution) {
  const keys = ['Positive', 'Neutral', 'Negative']
  if (hasStoredTextAnalysis(contribution?.text)) return true
  if (hasNumericSignal(contribution?.text, keys)) return true
  if (Array.isArray(contribution?.text?.regions) && contribution.text.regions.length > 0) {
    return true
  }
  if (hasStoredTextAnalysis(task?.textSentimentResults)) return true
  if (hasNumericSignal(task?.textSentimentResults, keys)) return true
  return (
    Array.isArray(task?.textSentimentResults?.regions) &&
    task.textSentimentResults.regions.length > 0
  )
}

/**
 * Session tasks that have media but no stored facial or text sentiment.
 *
 * @param {object} params
 * @param {object} [params.userAnswers]
 * @param {Map<string, { facial?: object|null, text?: object|null }>} [params.coverage]
 * @param {object[]} [params.jobs] In-flight queue jobs already sent for this study.
 * @param {string} [params.userDocId]
 * @param {string} [params.taskId]
 * @param {'all'|'facial'|'text'} [params.signal]
 * @param {boolean} [params.onlyMissing] When false, every task with media is included.
 * @returns {Array<{ type: 'facial'|'text', userDocId: string, taskId: string }>}
 */
export function listPendingSentiment({
  userAnswers,
  coverage,
  jobs,
  userDocId,
  taskId,
  signal = 'all',
  onlyMissing = true,
} = {}) {
  const items = []

  for (const row of sessionTaskRows(userAnswers)) {
    if (!matchesScope(row, { userDocId, taskId })) continue
    const contribution = findContribution(coverage, row)

    if (
      signal !== 'text' &&
      canRunFacialSentiment(row.task) &&
      (!onlyMissing || !hasFacialSentimentResult(row.task, contribution)) &&
      !isInFlight(jobs, {
        type: 'facial',
        userDocId: row.userDocId,
        taskId: row.taskId,
      })
    ) {
      items.push({
        type: 'facial',
        userDocId: row.userDocId,
        taskId: row.taskId,
      })
    }

    if (
      signal !== 'facial' &&
      canRunTextSentiment(row.task) &&
      (!onlyMissing || !hasTextSentimentResult(row.task, contribution)) &&
      !isInFlight(jobs, {
        type: 'text',
        userDocId: row.userDocId,
        taskId: row.taskId,
      })
    ) {
      items.push({
        type: 'text',
        userDocId: row.userDocId,
        taskId: row.taskId,
      })
    }
  }

  return items
}

/**
 * Counts session tasks that have media but no stored facial or text sentiment.
 *
 * @param {object} params
 * @returns {{ facial: number, text: number, total: number }}
 */
export function countPendingSentiment(params = {}) {
  const items = listPendingSentiment(params)
  const facial = items.filter((item) => item.type === 'facial').length
  const text = items.filter((item) => item.type === 'text').length
  return { facial, text, total: items.length }
}

/**
 * Session tasks that have audio but no transcription document.
 *
 * @param {object} params
 * @param {object} [params.userAnswers]
 * @param {object[]} [params.jobs] In-flight queue jobs already sent for this study.
 * @param {string} [params.userDocId]
 * @param {string} [params.taskId]
 * @returns {Array<{ userDocId: string, taskId: string }>}
 */
export function listPendingTranscriptions({
  userAnswers,
  jobs,
  userDocId,
  taskId,
} = {}) {
  const items = []

  for (const row of sessionTaskRows(userAnswers)) {
    if (!matchesScope(row, { userDocId, taskId })) continue
    if (!canRunTranscription(row.task)) continue
    if (row.task.transcriptionDocId) continue
    if (
      isInFlight(jobs, {
        type: 'transcription',
        userDocId: row.userDocId,
        taskId: row.taskId,
      })
    ) {
      continue
    }
    items.push({ userDocId: row.userDocId, taskId: row.taskId })
  }

  return items
}

/**
 * Counts session tasks that have audio but no transcription document.
 *
 * @param {object} params
 * @param {object} [params.userAnswers]
 * @param {string} [params.userDocId]
 * @param {string} [params.taskId]
 * @returns {number}
 */
export function countPendingTranscriptions(params = {}) {
  return listPendingTranscriptions(params).length
}
