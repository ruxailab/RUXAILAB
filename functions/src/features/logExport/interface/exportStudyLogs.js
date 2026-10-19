import {
  admin,
  functions,
  requireAuth,
  validateRequest,
  mapHttpsError,
} from '../../../core/firebase/index.js'
import {
  FirestoreStudyRepository,
  FirestoreUserRepository,
} from '../../../shared/repositories/index.js'
import { FirestoreStudyLogRepository } from '../repositories/FirestoreStudyLogRepository.js'
import { ExportStudyLogsService } from '../service/ExportStudyLogsService.js'
import { exportStudyLogsValidator } from '../validators/exportStudyLogsValidator.js'

/**
 * Callable entry point: one page of a sanitized study log export.
 */
export const exportStudyLogs = functions.onCall({
  options: { memory: '512MiB', timeoutSeconds: 120 },
  middlewares: [
    mapHttpsError(functions, 'Log export failed'),
    requireAuth,
    validateRequest(exportStudyLogsValidator),
  ],
  handler: async (request) => {
    const db = admin.firestore()
    const service = new ExportStudyLogsService({
      studyRepository: new FirestoreStudyRepository(db),
      userRepository: new FirestoreUserRepository(db),
      logRepository: new FirestoreStudyLogRepository(db),
    })
    return service.execute({ uid: request.auth.uid, input: request.data })
  },
})
