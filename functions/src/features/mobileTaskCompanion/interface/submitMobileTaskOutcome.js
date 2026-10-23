import {
  admin,
  functions,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import { submitMobileTaskOutcomeValidator } from '../validators/mobileTaskCompanionValidators.js'
import { buildMobileTaskCompanionServiceFromAdmin } from '../service/buildMobileTaskCompanionService.js'

/**
 * Desktop submits as the owning uid. The phone submits with studyId,
 * participantUid and token, so this callable does not require auth for
 * every caller.
 * A thrown error means the attempt was not accepted. A resolved response is
 * the stored outcome, which may be an earlier choice when `duplicate` is true.
 */
export const submitMobileTaskOutcome = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Submit mobile task outcome failed'),
    validateRequest(submitMobileTaskOutcomeValidator),
  ],
  handler: async (request) => {
    const service = buildMobileTaskCompanionServiceFromAdmin(admin)
    return service.submitOutcome({
      uid: request.auth?.uid || null,
      signInProvider: request.auth?.token?.firebase?.sign_in_provider || null,
      input: request.data || {},
    })
  },
})
