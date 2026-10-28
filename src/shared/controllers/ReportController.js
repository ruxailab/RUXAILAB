import { STUDY_TYPES, normalizeStudyType } from '../constants/methodDefinitions'
import { deleteTranscriptionsByUser } from '@/app/services/transcription/TranscriptionService'
import { deleteSentimentsByUser } from '@/app/services/facialSentiment/FacialSentimentService'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

const callStudyReportFunction = async (name, payload) => {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    name,
    payload,
  )
  return response?.data ?? response
}

const toStudyReportPayload = ({ report, test, answerType, extra = {} }) => ({
  answersDocId: test.answersDocId,
  userDocId: report.userDocId || report.id,
  studyId: test.id,
  answerType: answerType || test.testType,
  ...extra,
})

export default class ReportController {
  async setReportHidden({ report, test, hidden, answerType }) {
    try {
      await callStudyReportFunction(
        'setStudyReportHidden',
        toStudyReportPayload({
          report,
          test,
          answerType,
          extra: { hidden: hidden === true },
        }),
      )
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  /**
   * Remove a participant report from the answers document.
   * For USER studies, also deletes associated transcription and sentiment documents.
   *
   * @param {Object} params
   * @param {Object} params.report - The report to remove.
   * @param {Object} params.test - The current study.
   * @param {string} [params.answerType] - Type from the answers document.
   */
  async removeReport({ report, test, answerType }) {
    const payload = toStudyReportPayload({ report, test, answerType })
    const isUserStudy =
      normalizeStudyType(payload.answerType) === STUDY_TYPES.USER

    try {
      await callStudyReportFunction('removeStudyReport', payload)

      if (isUserStudy) {
        const cascadePayload = {
          answersDocId: payload.answersDocId,
          userDocId: payload.userDocId,
          studyId: payload.studyId,
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
