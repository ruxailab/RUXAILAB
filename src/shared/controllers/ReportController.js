import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { STUDY_TYPES } from '../constants/methodDefinitions'

/**
 * Controller for managing reports and removing report references from users and answer documents.
 * @extends Controller
 */
export default class ReportController extends Controller {
  /**
   * Removes a report from a user and from the answers document.
   * Cleans up the user's myAnswers reference and the answer document's heuristic/task answer entry.
   *
   * @param {Object} params - Removal parameters
   * @param {Object} params.report - The report to remove (must include userDocId)
   * @param {Object} params.test - The test object (id, answersDocId, testType)
   * @returns {Promise<{success: boolean, error?: Error}>} Result; success true or { success: false, error }
   */
  async removeReport({ report, test }) {
    const answerId = test.answersDocId
    const userToRemoveId = report.userDocId
    let testType = test.testType
    const testId = test.id

    if (testType === STUDY_TYPES.HEURISTIC) testType = 'heuristicAnswers'
    if (testType === STUDY_TYPES.USER) testType = 'taskAnswers'

    try {
      // 1 - Remover a referência no usuário
      const userDoc = await this.readOne('users', userToRemoveId)
      if (userDoc.exists()) {
        await this.update('users', userToRemoveId, {
          [`myAnswers.${testId}`]: this.getDeleteField(),
        })
      }

      // 2 - Remover a referência no documento de respostas
      const answerDoc = await this.readOne('answers', answerId)
      if (answerDoc.exists()) {
        await this.update('answers', answerId, {
          [`${testType}.${userToRemoveId}`]: this.getDeleteField(),
        })
      }

      return { success: true }
    } catch (e) {
      return { success: false, error: e }
    }
  }
}
