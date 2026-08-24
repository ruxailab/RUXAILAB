import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { STUDY_TYPES } from '../constants/methodDefinitions'
import { deleteTranscriptionsByUser } from '@/app/services/transcription/TranscriptionService'

export default class ReportController extends Controller {
  /**
   * Remove o report de um usuário e do documento de respostas.
   * For USER studies, also deletes associated transcription documents.
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
    const isUserStudy = testType === STUDY_TYPES.USER

    if (testType === STUDY_TYPES.HEURISTIC) testType = 'heuristicAnswers'
    if (testType === STUDY_TYPES.USER) testType = 'taskAnswers'
    if (testType === STUDY_TYPES.CARD_SORTING) testType = 'cardSortingAnswers'

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

      // 3 - Cascade transcriptions for User Test reports
      if (isUserStudy) {
        await deleteTranscriptionsByUser({
          answersDocId: answerId,
          userDocId: userToRemoveId,
          studyId: testId,
        })
      }

      return { success: true }
    } catch (e) {
      return { success: false, error: e }
    }
  }
}
