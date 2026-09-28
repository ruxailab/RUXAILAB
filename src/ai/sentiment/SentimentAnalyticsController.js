import { db } from '@/app/plugins/firebase'
import { doc, getDoc } from 'firebase/firestore'

const SENTIMENT_ANALYTICS_DOC_ID = 'sentiment'

/**
 * Normalize a raw SentimentBucket from Firestore into { Positive, Neutral, Negative, sampleCount }.
 * Returns null when sampleCount is 0 (signal was never analysed).
 *
 * @param {object|null|undefined} data
 * @returns {{ Positive: number, Neutral: number, Negative: number, sampleCount: number }|null}
 */
const normalizeBucket = (data) => {
  if (!data || typeof data !== 'object') return null
  const sampleCount = Number(data.sampleCount) || 0
  if (sampleCount <= 0) return null
  return {
    Positive: Number(data.Positive) || 0,
    Neutral: Number(data.Neutral) || 0,
    Negative: Number(data.Negative) || 0,
    sampleCount,
  }
}

/**
 * Normalize a raw SentimentSignalSlice (bySignal.facial / bySignal.text).
 *
 * @param {object|null|undefined} slice  Raw slice from Firestore.
 * @returns {{ facial: ReturnType<typeof normalizeBucket>, text: ReturnType<typeof normalizeBucket> }}
 */
const normalizeSlice = (slice) => {
  if (!slice || typeof slice !== 'object') {
    return { facial: null, text: null }
  }
  // Cloud Function stores signals under bySignal.{facial,text}
  const bySignal = slice.bySignal || {}
  return {
    facial: normalizeBucket(bySignal.facial ?? slice.facial),
    text: normalizeBucket(bySignal.text ?? slice.text),
  }
}

/**
 * Read answers/{answersDocId}/analytics/sentiment and return a
 * normalized shape for use in SentimentAnalysisView.
 *
 * @param {string} answersDocId
 * @returns {Promise<{
 *   general: { facial: object|null, text: object|null },
 *   tasks: Record<string, { facial: object|null, text: object|null }>,
 *   updatedAt: unknown,
 * }|null>}
 */
export default class SentimentAnalyticsController {
  async getByAnswersDocId(answersDocId) {
    if (!answersDocId) return null

    const ref = doc(
      db,
      'answers',
      String(answersDocId),
      'analytics',
      SENTIMENT_ANALYTICS_DOC_ID,
    )
    const snap = await getDoc(ref)
    if (!snap.exists()) return null

    const data = snap.data() || {}

    const tasksRaw =
      data.tasks && typeof data.tasks === 'object' && !Array.isArray(data.tasks)
        ? data.tasks
        : {}

    const tasks = {}
    for (const [key, slice] of Object.entries(tasksRaw)) {
      tasks[key] = normalizeSlice(slice)
    }

    return {
      general: normalizeSlice(data.general),
      tasks,
      updatedAt: data.updatedAt ?? null,
    }
  }
}
