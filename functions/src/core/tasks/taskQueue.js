import { getFunctions } from 'firebase-admin/functions'
import { getRegion } from '../firebase/f.firebase.js'

/**
 * Cloud Tasks queue bound to a deployed function in the functions region.
 *
 * @param {string} functionName Exported Cloud Function name.
 * @returns {import('firebase-admin/functions').TaskQueue}
 */
export function taskQueue(functionName) {
  return getFunctions().taskQueue(
    `locations/${getRegion()}/functions/${functionName}`,
  )
}
