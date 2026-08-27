import { db } from '@/app/plugins/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { normalizeMetricsBucket } from '@/ai/transcriptions/transcriptionAnalyticsUtils'

const TRANSCRIPTION_ANALYTICS_DOC_ID = 'transcription'
const TRANSCRIPTIONS_COLLECTION = 'transcriptions'

/**
 * Map a raw transcription Firestore doc to metric fields only.
 *
 * @param {string} id
 * @param {object} data
 * @returns {{
 *   id: string,
 *   userDocId: string|null,
 *   taskId: string|null,
 *   sessionDuration: number,
 *   wordsSpoken: number,
 *   speakingTime: number,
 *   speechRate: number,
 *   keywords: Record<string, number>,
 * }}
 */
const toTranscriptionMetrics = (id, data = {}) => {
  const metrics = normalizeMetricsBucket(data)
  return {
    id,
    userDocId: data.userDocId != null ? String(data.userDocId) : null,
    taskId: data.taskId != null ? String(data.taskId) : null,
    ...metrics,
  }
}

/**
 * Controller for reading aggregated and per-doc transcription analytics.
 */
export default class TranscriptionAnalyticsController {
  /**
   * Load answers/{answersDocId}/analytics/transcription.
   *
   * @param {string} answersDocId
   * @returns {Promise<{
   *   general: object,
   *   tasks: Record<string, object>,
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
      TRANSCRIPTION_ANALYTICS_DOC_ID,
    )
    const snap = await getDoc(ref)
    if (!snap.exists()) return null

    const data = snap.data() || {}
    const tasksRaw =
      data.tasks && typeof data.tasks === 'object' && !Array.isArray(data.tasks)
        ? data.tasks
        : {}

    const tasks = {}
    for (const [key, bucket] of Object.entries(tasksRaw)) {
      tasks[key] = normalizeMetricsBucket(bucket)
    }

    return {
      general: normalizeMetricsBucket(data.general),
      tasks,
      updatedAt: data.updatedAt ?? null,
    }
  }

  /**
   * Load metric fields from transcription documents by id (parallel).
   *
   * @param {string[]} ids
   * @returns {Promise<Array<ReturnType<typeof toTranscriptionMetrics>>>}
   */
  async getMetricsByIds(ids = []) {
    const uniqueIds = [
      ...new Set(
        (ids || []).map((id) => String(id || '').trim()).filter(Boolean),
      ),
    ]
    if (uniqueIds.length === 0) return []

    const results = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, TRANSCRIPTIONS_COLLECTION, id))
          if (!snap.exists()) return null
          return toTranscriptionMetrics(snap.id, snap.data())
        } catch {
          return null
        }
      }),
    )

    return results.filter(Boolean)
  }
}
