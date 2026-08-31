import { fail } from '../../../core/errors.js'
import { processFacialVideo } from './processFacialVideo.js'
import { extractVideoNameFromUrl } from './extractVideoNameFromUrl.js'
import { ROLE, assertStudyAccess } from '../../../shared/auth/index.js'

/**
 * Analyze facial sentiment for a task webcam recording and persist
 * emotions on the answer task as facialSentimentResults.
 */
export class AnalyzeFacialSentimentTaskService {
  /**
   * @param {object} deps
   * @param {import('../../../shared/repositories/FirestoreUserRepository.js').FirestoreUserRepository} deps.userRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {import('../../../shared/repositories/FirestoreStudyRepository.js').FirestoreStudyRepository} deps.studyRepository
   * @param {string} deps.facialSentimentApiBaseUrl
   */
  constructor({
    userRepository,
    answerRepository,
    studyRepository,
    facialSentimentApiBaseUrl,
  }) {
    this.userRepository = userRepository
    this.answerRepository = answerRepository
    this.studyRepository = studyRepository
    this.facialSentimentApiBaseUrl = facialSentimentApiBaseUrl
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @returns {Promise<object>}
   */
  async execute({ uid, input }) {
    const {
      answersDocId,
      userDocId,
      taskId,
      studyId = null,
    } = input || {}

    const baseUrl = (this.facialSentimentApiBaseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      fail(
        'failed-precondition',
        'FACIAL_SENTIMENT_API_BASE_URL is not configured',
      )
    }

    const [answerData, isSuperAdmin] = await Promise.all([
      this.answerRepository.get(answersDocId),
      this.userRepository.isSuperAdmin(uid),
    ])

    if (!answerData) {
      fail('not-found', 'Answer document not found')
    }

    const resolvedStudyId = studyId || answerData.studyId || null
    const study = resolvedStudyId
      ? await this.studyRepository.get(resolvedStudyId)
      : await this.studyRepository.findByAnswersDocId(answersDocId)

    if (!study) {
      fail(
        'not-found',
        resolvedStudyId ? 'Study not found' : 'Study not found for answersDocId',
      )
    }
    if (studyId && study.answersDocId && study.answersDocId !== answersDocId) {
      fail('invalid-argument', 'studyId does not match answersDocId')
    }

    assertStudyAccess(study, uid, isSuperAdmin, {
      allowedRoles: [ROLE.ADMIN, ROLE.MANAGER],
      message: 'Facial sentiment analysis is not permitted',
    })

    const normalizedTaskId = String(taskId)
    const task =
      answerData.taskAnswers?.[userDocId]?.tasks?.[normalizedTaskId] ?? null
    if (!task) {
      fail('not-found', 'Task not found for the given userDocId/taskId')
    }

    const webcamRecordURL = task.webcamRecordURL || null
    if (!webcamRecordURL) {
      fail('failed-precondition', 'No webcam recording available for this task')
    }

    const videoName = extractVideoNameFromUrl(webcamRecordURL)
    if (!videoName) {
      fail('failed-precondition', 'Could not resolve video path from webcam URL')
    }

    const emotions = await processFacialVideo({
      baseUrl,
      videoName,
    })
    const emotionsPayload = emotions.toJSON()

    await this.answerRepository.setFacialSentimentResults(
      answersDocId,
      userDocId,
      normalizedTaskId,
      emotionsPayload,
    )

    return {
      answersDocId,
      userDocId,
      taskId: normalizedTaskId,
      videoName,
      emotions: emotionsPayload,
    }
  }
}
