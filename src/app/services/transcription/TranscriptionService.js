import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Enqueues task-level transcription. The Cloud Tasks worker persists the result.
 *
 * @param {Object} payload
 * @param {string} payload.answersDocId
 * @param {string} payload.userDocId
 * @param {string|number} payload.taskId
 * @param {'whisper'|'openai'} payload.provider
 * @param {string} [payload.model]
 * @param {string} [payload.studyId]
 * @returns {Promise<{ status: 'queued', jobId: string, jobDocId: string }>}
 */
export async function transcribeTask(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'transcriptionTask',
    payload,
  )
  return response?.data ?? response
}

/**
 * Listen to the transcription job until the caller unsubscribes.
 *
 * @param {string} jobDocId
 * @param {(job: object|null) => void} onChange
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function watchTranscriptionJob(jobDocId, onChange, onError) {
  return onSnapshot(
    doc(db, 'jobs', jobDocId),
    (snap) => {
      onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    },
    onError,
  )
}

/**
 * Delete a transcription document and rebuild answer-level analytics.
 *
 * @param {Object} payload
 * @param {string} payload.transcriptionId
 * @param {string} [payload.studyId]
 * @returns {Promise<{
 *   id: string,
 *   answersDocId: string,
 *   userDocId: string,
 *   taskId: string,
 *   transcriptionDocId: string|null,
 * }>}
 */
export async function deleteTranscription(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'transcriptionDelete',
    payload,
  )
  return response?.data ?? response
}

/**
 * Delete all transcription documents for a user answer and rebuild analytics.
 *
 * @param {Object} payload
 * @param {string} payload.answersDocId
 * @param {string} payload.userDocId
 * @param {string} [payload.studyId]
 * @returns {Promise<{
 *   deletedCount: number,
 *   answersDocId: string,
 *   userDocId: string,
 * }>}
 */
export async function deleteTranscriptionsByUser(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'transcriptionDeleteByUser',
    payload,
  )
  return response?.data ?? response
}
