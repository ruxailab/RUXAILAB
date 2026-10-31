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
import { setStudyReportHiddenValidator } from '../validators/studyReportValidators.js'

/**
 * Callable entry point: hide or unhide one participant report.
 * Client SDK updates are denied by Firestore rules.
 */
export const setStudyReportHidden = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Study report visibility update failed'),
    requireAuth,
    validateRequest(setStudyReportHiddenValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const service = new StudyReportService({
      userRepository: new FirestoreUserRepository(db),
      answerRepository: new FirestoreAnswerRepository(db),
      studyRepository: new FirestoreStudyRepository(db),
      FieldValue: admin.firestore.FieldValue,
    })

    return service.setHidden({
      uid: request.auth.uid,
      input: request.data || {},
    })
  },
})
