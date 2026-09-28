import { fail } from '../../../core/errors.js'
import { processAudioSentiment } from './processAudioSentiment.js'
import { ROLE, assertStudyAccess } from '../../../shared/auth/index.js'
import { Sentiment } from '../../../shared/models/Sentiment.js'

/**
 * Analyze text/transcription sentiment for a task audio recording and persist
 * the Positive/Neutral/Negative bucket on the shared sentiment document.
 */
export class AnalyzeTextSentimentTaskService {
  /**
   * @param {object} deps
   * @param {import('../../../shared/repositories/FirestoreUserRepository.js').FirestoreUserRepository} deps.userRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {import('../../../shared/repositories/FirestoreStudyRepository.js').FirestoreStudyRepository} deps.studyRepository
   * @param {import('../../../shared/repositories/FirestoreSentimentRepository.js').FirestoreSentimentRepository} deps.sentimentRepository
   * @param {object} deps.FieldValue
   * @param {string} deps.textSentimentApiBaseUrl
   */
  constructor({
    userRepository,
    answerRepository,
    studyRepository,
    sentimentRepository,
    FieldValue,
    textSentimentApiBaseUrl,
  }) {
    this.userRepository = userRepository
    this.answerRepository = answerRepository
    this.studyRepository = studyRepository
    this.sentimentRepository = sentimentRepository
    this.FieldValue = FieldValue
    this.textSentimentApiBaseUrl = textSentimentApiBaseUrl
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

    const baseUrl = (this.textSentimentApiBaseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      fail(
        'failed-precondition',
        'TRANSCRIPTION_SENTIMENT_API_BASE_URL is not configured',
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
      message: 'Text sentiment analysis is not permitted',
    })

    const normalizedTaskId = String(taskId)
    const task =
      answerData.taskAnswers?.[userDocId]?.tasks?.[normalizedTaskId] ?? null
    if (!task) {
      fail('not-found', 'Task not found for the given userDocId/taskId')
    }

    const audioRecordURL = task.audioRecordURL || null
    if (!audioRecordURL) {
      fail('failed-precondition', 'No audio recording available for this task')
    }

    const textResults = await processAudioSentiment({
      baseUrl,
      audioUrl: audioRecordURL,
    })
    const textPayload = textResults.toJSON()

    const now = this.FieldValue.serverTimestamp()
    const existingSentimentDocId = task.sentimentDocId || null
    let existingSentiment = null
    if (existingSentimentDocId) {
      existingSentiment = await this.sentimentRepository.get(
        existingSentimentDocId,
      )
    }

    let saved
    if (existingSentiment) {
      const updated = existingSentiment.withText(textPayload, now)
      await this.sentimentRepository.set(existingSentimentDocId, updated, {
        merge: false,
      })
      saved = updated.withId(existingSentimentDocId)
    } else {
      const draft = Sentiment.create({
        answersDocId,
        userDocId,
        taskId: normalizedTaskId,
        facial: null,
        text: textPayload,
        createdAt: now,
        updatedAt: now,
      })
      const sentimentId = await this.sentimentRepository.create(draft)
      saved = draft.withId(sentimentId)
      await this.answerRepository.setSentimentDocId(
        answersDocId,
        userDocId,
        normalizedTaskId,
        saved.id,
      )
    }

    return {
      answersDocId,
      userDocId,
      taskId: normalizedTaskId,
      sentimentDocId: saved.id,
      text: textPayload,
      sentiment: saved.toJSON(),
    }
  }
}
