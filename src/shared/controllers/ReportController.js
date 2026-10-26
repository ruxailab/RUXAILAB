import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { STUDY_TYPES, normalizeStudyType } from '../constants/methodDefinitions'
import { deleteTranscriptionsByUser } from '@/app/services/transcription/TranscriptionService'
import { deleteSentimentsByUser } from '@/app/services/facialSentiment/FacialSentimentService'

export default class ReportController extends Controller {
  async setReportHidden({ report, test, hidden }) {
    const testType = normalizeStudyType(test.testType)
    const answerCollection =
      testType === STUDY_TYPES.USER
        ? 'taskAnswers'
        : testType === STUDY_TYPES.CARD_SORTING
          ? 'cardSortingAnswers'
          : 'heuristicAnswers'
    const userDocId = report.userDocId || report.id

    try {
      await this.update('answers', test.answersDocId, {
        [`${answerCollection}.${userDocId}.hidden`]: hidden === true,
      })
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  /**
   * Remove o report de um usuário e do documento de respostas.
   * For USER studies, also deletes associated transcription and sentiment documents.
   *
   * @param {Object} params
   * @param {Object} params.report - O report a ser removido.
   * @param {Object} params.test - O objeto do teste atual.
   * @param {string} [params.answerType] - Type from the answers document.
   */
  async removeReport({ report, test, answerType }) {
    const answerId = test.answersDocId
    const userToRemoveId = report.userDocId || report.id
    const testId = test.id
    const normalizedType = normalizeStudyType(answerType || test.testType)
    const isUserStudy = normalizedType === STUDY_TYPES.USER
    const answerCollection =
      normalizedType === STUDY_TYPES.USER
        ? 'taskAnswers'
        : normalizedType === STUDY_TYPES.CARD_SORTING
          ? 'cardSortingAnswers'
          : 'heuristicAnswers'

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
          [`${answerCollection}.${userToRemoveId}`]: this.getDeleteField(),
        })
      }

      // 3 - Cascade transcriptions and sentiments for User Test reports
      if (isUserStudy) {
        const cascadePayload = {
          answersDocId: answerId,
          userDocId: userToRemoveId,
          studyId: testId,
        }
        await Promise.all([
          deleteTranscriptionsByUser(cascadePayload),
          deleteSentimentsByUser(cascadePayload),
        ])
      }

      return { success: true }
    } catch (e) {
      return { success: false, error: e }
    }
  }
}
