import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Cancel a job that is still queued.
 *
 * @param {Object} payload
 * @param {string} payload.jobId
 * @returns {Promise<{ status: 'cancelled', jobId: string }>}
 */
export async function cancelQueuedJob(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'cancelQueuedJob',
    payload,
  )
  return response?.data ?? response
}
