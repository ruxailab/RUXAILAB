import { FacialEmotions } from '../models/FacialEmotions.js'
import {
  SentimentAnalytics,
  SentimentBucket,
  SentimentSignalSlice,
} from '../models/SentimentAnalytics.js'

/**
 * @param {string|number} taskId
 * @returns {string}
 */
export const toTaskAnalyticsKey = (taskId) => `task${String(taskId)}`

/**
 * Map facial emotion percentages into Positive / Neutral / Negative.
 *
 * @param {object|null|undefined} facialSentimentResults
 * @returns {SentimentBucket}
 */
export const facialEmotionsToBucket = (facialSentimentResults) => {
  if (!facialSentimentResults || typeof facialSentimentResults !== 'object') {
    return SentimentBucket.empty()
  }

  const emotions = FacialEmotions.create(facialSentimentResults)
  const positive = emotions.Happy + emotions.Surprised
  const neutral = emotions.Neutral
  const negative =
    emotions.Sad + emotions.Angry + emotions.Disgusted + emotions.Fearful
  const total = positive + neutral + negative

  if (total <= 0) {
    return SentimentBucket.empty()
  }

  return new SentimentBucket({
    Positive: Math.round((positive / total) * 100),
    Neutral: Math.round((neutral / total) * 100),
    Negative: Math.round((negative / total) * 100),
    sampleCount: 1,
  })
}

/**
 * Collect facial sentiment contributions from an answers document.
 * Optionally override one user/task with an in-memory result (just saved).
 *
 * @param {object|null|undefined} answerData
 * @param {{ userDocId: string, taskId: string|number, emotions: object }|null} [preferResult]
 * @returns {Array<{ userDocId: string, taskId: string, facial: object|null, text: object|null }>}
 */
export const collectSentimentContributions = (
  answerData,
  preferResult = null,
) => {
  const contributions = []
  const taskAnswers = answerData?.taskAnswers || {}

  for (const [userDocId, userAnswer] of Object.entries(taskAnswers)) {
    const tasks = userAnswer?.tasks || {}
    for (const [taskId, task] of Object.entries(tasks)) {
      const facial = task?.facialSentimentResults || null
      const text = task?.textSentimentResults || null
      if (!facial && !text) continue
      contributions.push({
        userDocId,
        taskId: String(taskId),
        facial,
        text,
      })
    }
  }

  if (preferResult?.userDocId != null && preferResult?.taskId != null) {
    const taskId = String(preferResult.taskId)
    const userDocId = String(preferResult.userDocId)
    const index = contributions.findIndex(
      (item) => item.userDocId === userDocId && item.taskId === taskId,
    )
    const next = {
      userDocId,
      taskId,
      facial: preferResult.emotions ?? preferResult.facial ?? null,
      text: preferResult.text ?? null,
    }
    if (index >= 0) {
      contributions[index] = {
        ...contributions[index],
        facial: next.facial ?? contributions[index].facial,
        text: next.text ?? contributions[index].text,
      }
    } else if (next.facial || next.text) {
      contributions.push(next)
    }
  }

  return contributions
}

/**
 * Build bounded sentiment analytics (general + tasks only).
 *
 * @param {Array<{ userDocId: string, taskId: string, facial: object|null, text: object|null }>} contributions
 * @returns {SentimentAnalytics}
 */
export const buildSentimentAnalytics = (contributions = []) => {
  /** @type {Record<string, { facial: SentimentBucket[], text: SentimentBucket[] }>} */
  const taskBuckets = {}

  for (const item of contributions) {
    if (!item || item.taskId == null || item.taskId === '') continue
    const key = toTaskAnalyticsKey(item.taskId)
    if (!taskBuckets[key]) {
      taskBuckets[key] = { facial: [], text: [] }
    }

    const facialBucket = facialEmotionsToBucket(item.facial)
    if (facialBucket.sampleCount > 0) {
      taskBuckets[key].facial.push(facialBucket)
    }

    // Text sentiment placeholder: accept already-normalized buckets or skip.
    if (item.text && typeof item.text === 'object') {
      const textBucket = SentimentBucket.fromFirestore({
        Positive: item.text.Positive,
        Neutral: item.text.Neutral,
        Negative: item.text.Negative,
        sampleCount: item.text.sampleCount ?? 1,
      })
      if (textBucket.sampleCount > 0) {
        taskBuckets[key].text.push(textBucket)
      }
    }
  }

  const tasks = {}
  const generalFacial = []
  const generalText = []

  for (const [key, bucket] of Object.entries(taskBuckets)) {
    const facial = SentimentSignalSlice.mergeBuckets(bucket.facial)
    const text = SentimentSignalSlice.mergeBuckets(bucket.text)
    tasks[key] = new SentimentSignalSlice({ facial, text })
    if (facial.sampleCount > 0) generalFacial.push(facial)
    if (text.sampleCount > 0) generalText.push(text)
  }

  const general = new SentimentSignalSlice({
    facial: SentimentSignalSlice.mergeBuckets(generalFacial),
    text: SentimentSignalSlice.mergeBuckets(generalText),
  })

  return new SentimentAnalytics({ general, tasks })
}
