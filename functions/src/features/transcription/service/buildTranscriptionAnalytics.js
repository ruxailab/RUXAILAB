import {
  limitKeywordMap,
  mergeKeywordMaps,
} from './extractKeywords.js'
import { TranscriptionAnalytics } from '../models/TranscriptionAnalytics.js'

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
const emptyBucket = () => ({
  sessionDuration: 0,
  wordsSpoken: 0,
  speakingTime: 0,
  speechRate: 0,
  keywords: {},
})

/**
 * @param {object} bucket
 * @returns {object}
 */
const finalizeSpeechRate = (bucket) => {
  const speakingTime =
    Math.round((Number(bucket.speakingTime) || 0) * 100) / 100
  const wordsSpoken = Number(bucket.wordsSpoken) || 0
  return {
    sessionDuration:
      Math.round((Number(bucket.sessionDuration) || 0) * 100) / 100,
    wordsSpoken,
    speakingTime,
    speechRate:
      speakingTime > 0 ? Math.round(wordsSpoken / (speakingTime / 60)) : 0,
    keywords: bucket.keywords || {},
  }
}

/**
 * Build aggregated analytics from latest transcription documents.
 * Keyword maps are truncated to top-N only after full aggregation.
 *
 * @param {Array<object>} transcriptions
 * @returns {TranscriptionAnalytics}
 */
export const buildTranscriptionAnalytics = (transcriptions = []) => {
  const taskBuckets = {}

  for (const item of transcriptions) {
    if (!item || item.taskId == null || item.taskId === '') continue
    const key = toTaskAnalyticsKey(item.taskId)
    if (!taskBuckets[key]) {
      taskBuckets[key] = emptyBucket()
    }

    const bucket = taskBuckets[key]
    bucket.sessionDuration += Number(item.sessionDuration) || 0
    bucket.wordsSpoken += Number(item.wordsSpoken) || 0
    bucket.speakingTime += Number(item.speakingTime) || 0
    bucket.keywords = mergeKeywordMaps([bucket.keywords, item.keywords])
  }

  const tasks = {}
  const general = emptyBucket()

  for (const [key, bucket] of Object.entries(taskBuckets)) {
    // Keep full keyword maps while aggregating so general is not built from
    // already-truncated per-task tops.
    const finalized = finalizeSpeechRate(bucket)
    tasks[key] = {
      ...finalized,
      keywords: limitKeywordMap(finalized.keywords),
    }
    general.sessionDuration += finalized.sessionDuration
    general.wordsSpoken += finalized.wordsSpoken
    general.speakingTime += finalized.speakingTime
    general.keywords = mergeKeywordMaps([
      general.keywords,
      finalized.keywords,
    ])
  }

  const generalFinalized = finalizeSpeechRate(general)
  return new TranscriptionAnalytics({
    general: {
      ...generalFinalized,
      keywords: limitKeywordMap(generalFinalized.keywords),
    },
    tasks,
  })
}

/**
 * Collect latest transcriptionDocId pointers from an answers document.
 *
 * @param {object|null|undefined} answerData
 * @returns {string[]}
 */
export const collectTranscriptionDocIds = (answerData) => {
  const ids = new Set()
  const taskAnswers = answerData?.taskAnswers || {}

  for (const userAnswer of Object.values(taskAnswers)) {
    const tasks = userAnswer?.tasks || {}
    for (const task of Object.values(tasks)) {
      if (task?.transcriptionDocId) {
        ids.add(String(task.transcriptionDocId))
      }
    }
  }

  return [...ids]
}
