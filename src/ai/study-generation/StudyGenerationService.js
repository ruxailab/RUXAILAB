import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Calls the generateStudyDraft Cloud Function.
 *
 * @param {{
 *   messages: Array<{ role: 'user' | 'model', text: string }>,
 *   locale?: string,
 *   preferredMethod?: string | null,
 * }} payload
 * @returns {Promise<{ draft: object, model: string, usage?: object }>}
 */
export async function generateStudyDraft(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'generateStudyDraft',
    payload,
  )
  return response.data
}
