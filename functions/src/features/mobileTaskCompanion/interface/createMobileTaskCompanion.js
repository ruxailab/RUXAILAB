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
 * Authenticated caller who can answer this unmoderated study, including the
 * owner and anonymous participants. Returns the pairing token. The desktop
 * builds `{origin}/mobile-task/{studyId}/{participantUid}/{token}`.
 */
export const createMobileTaskCompanion = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Create mobile task companion failed'),
    requireAuth,
    validateRequest(mobileTaskCompanionOwnerValidator),
  ],
  handler: async (request) => {
    const service = buildMobileTaskCompanionServiceFromAdmin(admin)
    return service.create({
      uid: request.auth?.uid || null,
      signInProvider: request.auth?.token?.firebase?.sign_in_provider || null,
      input: request.data || {},
    })
  },
})
