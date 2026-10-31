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
 * Restores the desktop QR after a reload. Does not invalidate the token.
 */
export const getMobileTaskCompanion = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Get mobile task companion failed'),
    requireAuth,
    validateRequest(mobileTaskCompanionOwnerValidator),
  ],
  handler: async (request) => {
    const service = buildMobileTaskCompanionServiceFromAdmin(admin)
    return service.get({
      uid: request.auth?.uid || null,
      signInProvider: request.auth?.token?.firebase?.sign_in_provider || null,
      input: request.data || {},
    })
  },
})
