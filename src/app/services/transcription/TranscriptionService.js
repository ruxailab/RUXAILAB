import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Orchestrates task-level transcription via Cloud Function.
 * The function downloads evaluator/moderator audios from the answer task,
 * calls the Whisper API, persists to Firestore, and updates latestTranscriptionDocId.
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
  return await FirebaseFunctionsController.callHttpsCallableFunction('workerTranscriptTask', payload)
}