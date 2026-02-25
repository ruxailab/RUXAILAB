import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { STUDY_TYPES } from '../constants/methodDefinitions'

export default class ReportController extends Controller {
  /**
   * Remove o report de um usuário e do documento de respostas.
   *
   * @param {Object} params
   * @param {Object} params.report - O report a ser removido.
   * @param {Object} params.test - O objeto do teste atual.
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
