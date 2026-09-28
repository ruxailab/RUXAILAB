import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Orchestrates task-level facial sentiment analysis via Cloud Function.
 * The function resolves the webcam recording from the answer task,
 * calls the facial sentiment API, and stores results on a sentiment document
 * pointed by sentimentDocId on the task under answers/{answersDocId}.
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
 *   emotions: Record<string, number>,
 *   videoName: string|null,
 * }>}
 */
export async function analyzeFacialSentimentTask(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'facialSentimentTask',
    payload,
    { timeout: 540_000 },
  )
  return response?.data ?? response
}
