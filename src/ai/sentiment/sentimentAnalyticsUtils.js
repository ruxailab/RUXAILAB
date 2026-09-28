import { toTaskAnalyticsKey } from '@/ai/transcriptions/transcriptionAnalyticsUtils'

export { toTaskAnalyticsKey }

/**
 * @returns {{
 *   Positive: number,
 *   Neutral: number,
 *   Negative: number,
 *   dominant: string|null,
 *   sampleCount: number,
 * }}
 */
export const emptySentimentBucket = () => ({
  Positive: 0,
  Neutral: 0,
  Negative: 0,
  dominant: null,
  sampleCount: 0,
})

/**
 * @param {{ Positive?: number, Neutral?: number, Negative?: number }} scores
 * @returns {'Positive'|'Neutral'|'Negative'|null}
 */
export const computeDominant = (scores = {}) => {
  const entries = [
    ['Positive', Number(scores.Positive) || 0],
    ['Neutral', Number(scores.Neutral) || 0],
    ['Negative', Number(scores.Negative) || 0],
  ]
  const total = entries.reduce((sum, [, value]) => sum + value, 0)
  if (total <= 0) return null
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}

/**
 * @param {object|null|undefined} data
 * @returns {ReturnType<typeof emptySentimentBucket>}
 */
export const normalizeSentimentBucket = (data = {}) => {
  const Positive = Number(data?.Positive) || 0
  const Neutral = Number(data?.Neutral) || 0
  const Negative = Number(data?.Negative) || 0
  const sampleCount = Number(data?.sampleCount) || 0

  return {
    Positive,
    Neutral,
    Negative,
    sampleCount,
    dominant: data?.dominant || computeDominant({ Positive, Neutral, Negative }),
  }
}

/**
 * Weighted average of buckets by sampleCount.
 *
 * @param {Array<ReturnType<typeof emptySentimentBucket>|null|undefined>} buckets
 * @returns {ReturnType<typeof emptySentimentBucket>}
 */
export const mergeSentimentBuckets = (buckets = []) => {
  let positive = 0
  let neutral = 0
  let negative = 0
  let sampleCount = 0

  for (const bucket of buckets) {
    const count = Number(bucket?.sampleCount) || 0
    if (count <= 0) continue
    positive += (Number(bucket.Positive) || 0) * count
    neutral += (Number(bucket.Neutral) || 0) * count
    negative += (Number(bucket.Negative) || 0) * count
    sampleCount += count
  }

  if (sampleCount <= 0) return emptySentimentBucket()

  return normalizeSentimentBucket({
    Positive: Math.round(positive / sampleCount),
    Neutral: Math.round(neutral / sampleCount),
    Negative: Math.round(negative / sampleCount),
    sampleCount,
  })
}

/**
 * Map facial emotion percentages into Positive / Neutral / Negative.
 *
 * @param {object|null|undefined} facial
 * @returns {ReturnType<typeof emptySentimentBucket>}
 */
export const facialEmotionsToBucket = (facial) => {
  if (!facial || typeof facial !== 'object') return emptySentimentBucket()

  const Happy = Number(facial.Happy ?? facial.happy) || 0
  const Surprised = Number(facial.Surprised ?? facial.surprised) || 0
  const Neutral = Number(facial.Neutral ?? facial.neutral) || 0
  const Sad = Number(facial.Sad ?? facial.sad) || 0
  const Angry = Number(facial.Angry ?? facial.angry) || 0
  const Disgusted = Number(facial.Disgusted ?? facial.disgusted) || 0
  const Fearful = Number(facial.Fearful ?? facial.fearful) || 0

  const positive = Happy + Surprised
  const negative = Sad + Angry + Disgusted + Fearful
  const total = positive + Neutral + negative

  if (total <= 0) return emptySentimentBucket()

  return normalizeSentimentBucket({
    Positive: Math.round((positive / total) * 100),
    Neutral: Math.round((Neutral / total) * 100),
    Negative: Math.round((negative / total) * 100),
    sampleCount: 1,
  })
}

/**
 * @returns {{
 *   combined: ReturnType<typeof emptySentimentBucket>,
 *   bySignal: {
 *     facial: ReturnType<typeof emptySentimentBucket>,
 *     text: ReturnType<typeof emptySentimentBucket>,
 *   },
 * }}
 */
export const emptySignalSlice = () => ({
  combined: emptySentimentBucket(),
  bySignal: {
    facial: emptySentimentBucket(),
    text: emptySentimentBucket(),
  },
})

/**
 * @param {object|null|undefined} facial
 * @param {object|null|undefined} text
 * @returns {ReturnType<typeof emptySignalSlice>}
 */
export const createSignalSlice = (facial, text) => {
  const facialBucket = normalizeSentimentBucket(facial)
  const textBucket = normalizeSentimentBucket(text)

  return {
    combined: mergeSentimentBuckets([facialBucket, textBucket]),
    bySignal: {
      facial: facialBucket,
      text: textBucket,
    },
  }
}

/**
 * @param {object|null|undefined} data
 * @returns {ReturnType<typeof emptySignalSlice>}
 */
export const normalizeSignalSlice = (data = {}) => {
  const facial = normalizeSentimentBucket(data?.bySignal?.facial ?? data?.facial)
  const text = normalizeSentimentBucket(data?.bySignal?.text ?? data?.text)
  const combined = data?.combined
    ? normalizeSentimentBucket(data.combined)
    : mergeSentimentBuckets([facial, text])

  return {
    combined,
    bySignal: { facial, text },
  }
}

/**
 * @param {ReturnType<typeof emptySentimentBucket>|null|undefined} bucket
 * @returns {boolean}
 */
export const bucketHasData = (bucket) => Number(bucket?.sampleCount) > 0

/**
 * @param {ReturnType<typeof emptySignalSlice>|null|undefined} slice
 * @returns {boolean}
 */
export const sliceHasData = (slice) =>
  bucketHasData(slice?.combined) ||
  bucketHasData(slice?.bySignal?.facial) ||
  bucketHasData(slice?.bySignal?.text)

/**
 * @param {ReturnType<typeof emptySentimentBucket>|null|undefined} bucket
 * @returns {{ Positive: number, Neutral: number, Negative: number }}
 */
export const bucketToCounts = (bucket) => ({
  Positive: Number(bucket?.Positive) || 0,
  Neutral: Number(bucket?.Neutral) || 0,
  Negative: Number(bucket?.Negative) || 0,
})

/**
 * @param {string|null|undefined} dominant
 * @returns {string}
 */
export const dominantColor = (dominant) => {
  if (dominant === 'Positive') return 'success'
  if (dominant === 'Negative') return 'error'
  if (dominant === 'Neutral') return 'grey'
  return 'grey'
}

/**
 * @param {Array<{
 *   userDocId?: string,
 *   taskId?: string|number,
 *   facial?: object|null,
 *   text?: object|null,
 * }>} contributions
 * @returns {{
 *   general: ReturnType<typeof emptySignalSlice>,
 *   tasks: Record<string, ReturnType<typeof emptySignalSlice>>,
 * }}
 */
export const aggregateSentimentContributions = (contributions = []) => {
  /** @type {Record<string, { facial: object[], text: object[] }>} */
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

    if (item.text && typeof item.text === 'object') {
      const textBucket = normalizeSentimentBucket({
        ...item.text,
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
    const facial = mergeSentimentBuckets(bucket.facial)
    const text = mergeSentimentBuckets(bucket.text)
    tasks[key] = createSignalSlice(facial, text)
    if (facial.sampleCount > 0) generalFacial.push(facial)
    if (text.sampleCount > 0) generalText.push(text)
  }

  return {
    general: createSignalSlice(
      mergeSentimentBuckets(generalFacial),
      mergeSentimentBuckets(generalText),
    ),
    tasks,
  }
}
