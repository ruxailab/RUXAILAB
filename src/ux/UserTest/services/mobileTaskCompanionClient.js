import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

/**
 * Callable wrappers for mobile task instructions.
 * The region comes from the shared Functions instance.
 * Each method returns the callable payload (`response.data`).
 *
 * @param {string} functionName
 * @param {object} data
 */
async function call(functionName, data) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    functionName,
    data,
  )
  return response?.data
}

/**
 * @param {{ studyId: string, answerId: string }} data
 */
export function createMobileTaskCompanion(data) {
  return call('createMobileTaskCompanion', data)
}

/**
 * Restores the pairing after a desktop reload. Does not invalidate the token.
 *
 * @param {{ studyId: string, answerId: string }} data
 */
export function getMobileTaskCompanion(data) {
  return call('getMobileTaskCompanion', data)
}

/**
 * Desktop only, on Start task. A failure must not stop the computer task.
 *
 * @param {{ studyId: string, answerId: string, taskIndex: number, taskId: string }} data
 */
export function activateMobileTask(data) {
  return call('activateMobileTask', data)
}

/**
 * Desktop sends studyId and answerId. The phone sends studyId,
 * participantUid and token, and no auth.
 * The stored outcome in a resolved payload wins over the pressed button.
 *
 * @param {object} data
 */
export function submitMobileTaskOutcome(data) {
  return call('submitMobileTaskOutcome', data)
}

/**
 * Ends the pairing. Call when the participant turns the mode off and before
 * the final study submit. Do not call it on page reload.
 *
 * @param {{ studyId: string, answerId: string }} data
 */
export function endMobileTaskCompanion(data) {
  return call('endMobileTaskCompanion', data)
}
