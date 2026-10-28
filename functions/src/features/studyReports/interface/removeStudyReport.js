import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import {
  FirestoreUserRepository,
  FirestoreAnswerRepository,
  FirestoreStudyRepository,
} from '../../../shared/repositories/index.js'
import { StudyReportService } from '../service/StudyReportService.js'
import { removeStudyReportValidator } from '../validators/studyReportValidators.js'

/**
 * Callable entry point: remove one participant report from the answers
 * document. Client SDK updates are denied by Firestore rules.
 */
export const removeStudyReport = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Study report delete failed'),
    requireAuth,
    validateRequest(removeStudyReportValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const service = new StudyReportService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository: new FirestoreAnswerRepository(db),
      studyRepository: new FirestoreStudyRepository(db),
      FieldValue: admin.firestore.FieldValue,
    })

    return service.remove({
      uid: request.auth.uid,
      input: request.data || {},
    })
  },
})
