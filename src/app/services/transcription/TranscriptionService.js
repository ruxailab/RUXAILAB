import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Orchestrates task-level transcription via Cloud Function.
 * The function downloads evaluator/moderator audios from the answer task,
 * calls the Whisper API, persists to Firestore, and updates transcriptionDocId.
 *
 * @param {Object} payload
 * @param {string} payload.answersDocId
 * @param {string} payload.userDocId
 * @param {string|number} payload.taskId
 * @param {'whisper'|'openai'} payload.provider
 * @param {string} [payload.model]
 * @param {string} [payload.studyId]
 * @returns {Promise<{
 *   id: string,
 *   answersDocId: string,
 *   userDocId: string,
 *   taskId: string,
 *   provider: string,
 *   model: string,
 *   evaluator: { language: string|null, transcript: string, segments: Array },
 *   moderator: { language: string|null, transcript: string, segments: Array },
 * }>}
 */
export async function transcribeTask(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'transcriptionTask',
    payload,
    { timeout: 540_000 },
  )
  return response?.data ?? response
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
