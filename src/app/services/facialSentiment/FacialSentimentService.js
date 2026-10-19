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
 * Clear the facial side of a sentiment document and rebuild analytics.
 *
 * @param {Object} payload
 * @param {string} payload.sentimentDocId
 * @param {string} [payload.studyId]
 * @returns {Promise<{ sentimentDocId: string|null, side: 'facial', removedDocument: boolean }>}
 */
export async function deleteFacialSentiment(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'sentimentDelete',
    { ...payload, side: 'facial' },
  )
  return response?.data ?? response
}
