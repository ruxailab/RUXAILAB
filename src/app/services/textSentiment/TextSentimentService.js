import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Orchestrates task-level text/transcription sentiment analysis via Cloud Function.
 * The function resolves the audio recording from the answer task,
 * calls the transcription sentiment API, and stores results on a sentiment
 * document pointed by sentimentDocId on the task under answers/{answersDocId}.
 *
 * @param {Object} payload
 * @param {string} payload.answersDocId
 * @param {string} payload.userDocId
 * @param {string|number} payload.taskId
 * @param {string} [payload.studyId]
 * @returns {Promise<{
 *   answersDocId: string,
 *   userDocId: string,
 *   taskId: string,
 *   sentimentDocId: string,
 *   text: { Positive: number, Neutral: number, Negative: number, sampleCount: number },
 * }>}
 */
export async function analyzeTextSentimentTask(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'textSentimentTask',
    payload,
    { timeout: 540_000 },
  )
  return response?.data ?? response
}
