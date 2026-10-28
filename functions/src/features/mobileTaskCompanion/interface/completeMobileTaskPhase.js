import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import { mobileTaskCompanionOwnerValidator } from '../validators/mobileTaskCompanionValidators.js'
import { buildMobileTaskCompanionServiceFromAdmin } from '../service/buildMobileTaskCompanionService.js'

/**
 * Desktop signals that the participant left the last task for post-test
 * or finish. The phone shows thank-you. Reloading must not call this.
 * Final submit still calls endMobileTaskCompanion.
 */
export const completeMobileTaskPhase = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Complete mobile task phase failed'),
    requireAuth,
    validateRequest(mobileTaskCompanionOwnerValidator),
  ],
  handler: async (request) => {
    const service = buildMobileTaskCompanionServiceFromAdmin(admin)
    return service.completeTaskPhase({
      uid: request.auth?.uid || null,
      signInProvider: request.auth?.token?.firebase?.sign_in_provider || null,
      input: request.data || {},
    })
  },
})
