import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import { activateMobileTaskValidator } from '../validators/mobileTaskCompanionValidators.js'
import { buildMobileTaskCompanionServiceFromAdmin } from '../service/buildMobileTaskCompanionService.js'

/**
 * Desktop only. Called when the participant starts a task.
 * A failure must not stop the computer-only flow.
 */
export const activateMobileTask = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Activate mobile task failed'),
    requireAuth,
    validateRequest(activateMobileTaskValidator),
  ],
  handler: async (request) => {
    const service = buildMobileTaskCompanionServiceFromAdmin(admin)
    return service.activate({
      uid: request.auth?.uid || null,
      signInProvider: request.auth?.token?.firebase?.sign_in_provider || null,
      input: request.data || {},
    })
  },
})
