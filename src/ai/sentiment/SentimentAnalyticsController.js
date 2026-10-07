import { db } from '@/app/plugins/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import {
  emptySignalSlice,
  normalizeSignalSlice,
} from '@/ai/sentiment/sentimentAnalyticsUtils'

const SENTIMENT_ANALYTICS_DOC_ID = 'sentiment'
const SENTIMENT_COLLECTION = 'sentiment'

/**
 * Map a raw sentiment Firestore doc to the fields used by analytics.
 *
 * @param {string} id
 * @param {object} data
 * @returns {{
 *   id: string,
 *   userDocId: string|null,
 *   taskId: string|null,
 *   facial: object|null,
 *   text: object|null,
 * }}
 */
const toSentimentContribution = (id, data = {}) => ({
  id,
  userDocId: data.userDocId != null ? String(data.userDocId) : null,
  taskId: data.taskId != null ? String(data.taskId) : null,
  facial: data.facial && typeof data.facial === 'object' ? data.facial : null,
  text: data.text && typeof data.text === 'object' ? data.text : null,
})

/**
 * Controller for reading aggregated and per-doc sentiment analytics.
 */
export default class SentimentAnalyticsController {
  /**
   * Load answers/{answersDocId}/analytics/sentiment.
   *
   * @param {string} answersDocId
   * @returns {Promise<{
   *   general: ReturnType<typeof emptySignalSlice>,
   *   tasks: Record<string, ReturnType<typeof emptySignalSlice>>,
   *   updatedAt: unknown,
   * }|null>}
   */
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
      tasks[key] = normalizeSignalSlice(slice)
    }

    return {
      general: data.general
        ? normalizeSignalSlice(data.general)
        : emptySignalSlice(),
      tasks,
      updatedAt: data.updatedAt ?? null,
    }
  }

  /**
   * Load sentiment documents by id (parallel).
   *
   * @param {string[]} ids
   * @returns {Promise<Array<ReturnType<typeof toSentimentContribution>>>}
   */
  async getByIds(ids = []) {
    const uniqueIds = [
      ...new Set(
        (ids || []).map((id) => String(id || '').trim()).filter(Boolean),
      ),
    ]
    if (uniqueIds.length === 0) return []

    const results = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, SENTIMENT_COLLECTION, id))
          if (!snap.exists()) return null
          return toSentimentContribution(snap.id, snap.data())
        } catch {
          return null
        }
      }),
    )

    return results.filter(Boolean)
  }

  /**
   * Load sentiment documents for one user in an answers document.
   *
   * @param {string} answersDocId
   * @param {string} userDocId
   * @returns {Promise<Array<ReturnType<typeof toSentimentContribution>>>}
   */
  async getByAnswersDocIdAndUser(answersDocId, userDocId) {
    if (!answersDocId || !userDocId) return []

    const q = query(
      collection(db, SENTIMENT_COLLECTION),
      where('answersDocId', '==', String(answersDocId)),
      where('userDocId', '==', String(userDocId)),
    )
    const snap = await getDocs(q)
    return snap.docs.map((item) =>
      toSentimentContribution(item.id, item.data()),
    )
  }
}
