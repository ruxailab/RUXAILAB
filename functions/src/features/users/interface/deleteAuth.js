import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import {
  FirestoreUserRepository,
  FirestoreStudyRepository,
  FirestoreAnswerRepository,
} from '../../../shared/repositories/index.js'
import { UserStorageRepository } from '../repositories/UserStorageRepository.js'
import { UserAuthRepository } from '../repositories/UserAuthRepository.js'
import { DeleteUserService } from '../service/DeleteUserService.js'
import { deleteAuthValidator } from '../validators/deleteAuthValidator.js'

/**
 * Callable Cloud Function: delete user account, Firestore data, tests, and storage files.
 */
export const deleteAuth = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Error deleting user'),
    requireAuth,
    validateRequest(deleteAuthValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const service = new DeleteUserService({
      userRepository: new FirestoreUserRepository(db),
      studyRepository: new FirestoreStudyRepository(db),
      answerRepository: new FirestoreAnswerRepository(db),
      storageRepository: new UserStorageRepository(admin.storage()),
      authRepository: new UserAuthRepository(admin.auth()),
    })

    return service.execute({
      uid: request.auth.uid,
      input: request.data || {},
    })
  },
})

