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
 * Invalidates the token when the participant turns the mode off, and on
 * final submit before the answer is marked submitted. Reloading must not
 * call this.
 */
export const endMobileTaskCompanion = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'End mobile task companion failed'),
    requireAuth,
    validateRequest(mobileTaskCompanionOwnerValidator),
  ],
  handler: async (request) => {
    const service = buildMobileTaskCompanionServiceFromAdmin(admin)
    return service.end({
      uid: request.auth?.uid || null,
      signInProvider: request.auth?.token?.firebase?.sign_in_provider || null,
      input: request.data || {},
    })
  },
})
