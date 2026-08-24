export const TOP_KEYWORDS_LIMIT = 30

/**
 * @param {string|number} taskId
 * @returns {string}
 */
export const toTaskAnalyticsKey = (taskId) => `task${String(taskId)}`

/**
 * @returns {{
 *   sessionDuration: number,
 *   wordsSpoken: number,
 *   speakingTime: number,
 *   speechRate: number,
 *   keywords: Record<string, number>,
 * }}
 */
export const emptyMetricsBucket = () => ({
  sessionDuration: 0,
  wordsSpoken: 0,
  speakingTime: 0,
  speechRate: 0,
  keywords: {},
})

/**
 * @param {Record<string, number>|null|undefined} map
 * @param {number} [limit]
 * @returns {Record<string, number>}
 */
export const limitKeywordMap = (map, limit = TOP_KEYWORDS_LIMIT) => {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return {}
  const max = Math.max(0, Number(limit) || 0)
  if (max === 0) return {}

  const entries = Object.entries(map)
    .map(([word, count]) => [word, Number(count) || 0])
    .filter(([word, count]) => word && count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)

  return Object.fromEntries(entries)
}

/**
 * @param {Array<Record<string, number>|null|undefined>} maps
 * @returns {Record<string, number>}
 */
export const mergeKeywordMaps = (maps) => {
  const counts = {}

  for (const map of maps) {
    if (!map || typeof map !== 'object' || Array.isArray(map)) continue
    for (const [word, count] of Object.entries(map)) {
      const value = Number(count) || 0
      if (!word || value <= 0) continue
      counts[word] = (counts[word] || 0) + value
    }
  }

  return counts
}

/**
 * @param {object} bucket
 * @returns {{
 *   sessionDuration: number,
 *   wordsSpoken: number,
 *   speakingTime: number,
 *   speechRate: number,
 *   keywords: Record<string, number>,
 * }}
 */
export const finalizeSpeechRate = (bucket) => {
  const speakingTime =
    Math.round((Number(bucket?.speakingTime) || 0) * 100) / 100
  const wordsSpoken = Number(bucket?.wordsSpoken) || 0

  return {
    sessionDuration:
      Math.round((Number(bucket?.sessionDuration) || 0) * 100) / 100,
    wordsSpoken,
    speakingTime,
    speechRate:
      speakingTime > 0 ? Math.round(wordsSpoken / (speakingTime / 60)) : 0,
    keywords: bucket?.keywords || {},
  }
}

/**
 * Aggregate per-transcription metrics into general + tasks buckets.
 * Mirrors functions buildTranscriptionAnalytics (without the model class).
 *
 * @param {Array<object>} transcriptions
 * @returns {{
 *   general: ReturnType<typeof emptyMetricsBucket>,
 *   tasks: Record<string, ReturnType<typeof emptyMetricsBucket>>,
 * }}
 */
export const aggregateTranscriptionMetrics = (transcriptions = []) => {
  const taskBuckets = {}

  for (const item of transcriptions) {
    if (!item || item.taskId == null || item.taskId === '') continue
    const key = toTaskAnalyticsKey(item.taskId)
    if (!taskBuckets[key]) {
      taskBuckets[key] = emptyMetricsBucket()
    }

    const bucket = taskBuckets[key]
    bucket.sessionDuration += Number(item.sessionDuration) || 0
    bucket.wordsSpoken += Number(item.wordsSpoken) || 0
    bucket.speakingTime += Number(item.speakingTime) || 0
    bucket.keywords = mergeKeywordMaps([bucket.keywords, item.keywords])
  }

  const tasks = {}
  const general = emptyMetricsBucket()

  for (const [key, bucket] of Object.entries(taskBuckets)) {
    const finalized = finalizeSpeechRate(bucket)
    tasks[key] = {
      ...finalized,
      keywords: limitKeywordMap(finalized.keywords),
    }
    general.sessionDuration += finalized.sessionDuration
    general.wordsSpoken += finalized.wordsSpoken
    general.speakingTime += finalized.speakingTime
    general.keywords = mergeKeywordMaps([general.keywords, finalized.keywords])
  }

  const generalFinalized = finalizeSpeechRate(general)
  return {
    general: {
      ...generalFinalized,
      keywords: limitKeywordMap(generalFinalized.keywords),
    },
    tasks,
  }
}

/**
 * @param {number|null|undefined} totalSeconds
 * @returns {string}
 */
export const formatSeconds = (totalSeconds) => {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0))
  if (seconds === 0) return '0s'

  const minutes = Math.floor(seconds / 60)
  const rem = seconds % 60
  if (minutes === 0) return `${rem}s`
  if (rem === 0) return `${minutes}m`
  return `${minutes}m ${rem}s`
}

/**
 * @param {Record<string, number>|null|undefined} keywords
 * @returns {Array<{ word: string, count: number }>}
 */
export const keywordsToSortedList = (keywords) => {
  if (!keywords || typeof keywords !== 'object' || Array.isArray(keywords)) {
    return []
  }

  return Object.entries(keywords)
    .map(([word, count]) => ({ word, count: Number(count) || 0 }))
    .filter((item) => item.word && item.count > 0)
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
}

/**
 * Normalize a metrics bucket from Firestore (or empty defaults).
 *
 * @param {object|null|undefined} data
 * @returns {ReturnType<typeof emptyMetricsBucket>}
 */
export const normalizeMetricsBucket = (data) => {
  if (!data || typeof data !== 'object') return emptyMetricsBucket()

  return {
    sessionDuration: Number(data.sessionDuration) || 0,
    wordsSpoken: Number(data.wordsSpoken) || 0,
    speakingTime: Number(data.speakingTime) || 0,
    speechRate: Number(data.speechRate) || 0,
    keywords:
      data.keywords &&
      typeof data.keywords === 'object' &&
      !Array.isArray(data.keywords)
        ? { ...data.keywords }
        : {},
  }
}
