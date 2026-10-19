import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Enqueues task-level facial sentiment analysis.
 * The Cloud Tasks worker persists the result.
 *
 * @param {Object} payload
 * @param {string} payload.answersDocId
 * @param {string} payload.userDocId
 * @param {string|number} payload.taskId
 * @param {string} [payload.studyId]
 * @returns {Promise<{ status: 'queued', jobId: string, jobDocId: string }>}
 */
export async function analyzeFacialSentimentTask(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'facialSentimentTask',
    payload,
  )
  return response?.data ?? response
}

/**
 * Listen to a queued job until the caller unsubscribes.
 *
 * @param {string} jobDocId
 * @param {(job: object|null) => void} onChange
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function watchFacialSentimentJob(jobDocId, onChange, onError) {
  return onSnapshot(
    doc(db, 'jobs', jobDocId),
    (snap) => {
      onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    },
    onError,
  )
}
