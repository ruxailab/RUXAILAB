import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Enqueues task-level text sentiment analysis.
 * The Cloud Tasks worker persists the result.
 *
 * @param {Object} payload
 * @param {string} payload.answersDocId
 * @param {string} payload.userDocId
 * @param {string|number} payload.taskId
 * @param {string} [payload.studyId]
 * @returns {Promise<{ status: 'queued', jobId: string, jobDocId: string }>}
 */
export async function analyzeTextSentimentTask(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'textSentimentTask',
    payload,
  )
  return response?.data ?? response
}

/**
 * Clear the text side of a sentiment document and rebuild analytics.
 *
 * @param {Object} payload
 * @param {string} payload.sentimentDocId
 * @param {string} [payload.studyId]
 * @returns {Promise<{ sentimentDocId: string|null, side: 'text', removedDocument: boolean }>}
 */
export async function deleteTextSentiment(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'textSentimentDelete',
    payload,
  )
  return response?.data ?? response
}
