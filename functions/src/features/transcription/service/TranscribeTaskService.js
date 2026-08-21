import { fail } from '../../../core/errors.js'
import { TranscriptionProvider } from '../models/TranscriptionProvider.js'
import { TranscriptSide } from '../models/TranscriptSide.js'
import { Transcription } from '../models/Transcription.js'
import { transcribeAudio } from './transcribeAudio.js'
import { ROLE, assertStudyAccess } from '../../../shared/auth/index.js'

/**
 * Transcribe a moderated task and persist the result.
 */
export class TranscribeTaskService {
  /**
   * @param {object} deps
   * @param {import('../../../shared/repositories/FirestoreUserRepository.js').FirestoreUserRepository} deps.userRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {import('../../../shared/repositories/FirestoreStudyRepository.js').FirestoreStudyRepository} deps.studyRepository
   * @param {import('../repositories/FirestoreTranscriptionRepository.js').FirestoreTranscriptionRepository} deps.transcriptionRepository
   * @param {object} deps.FieldValue
   * @param {string} deps.transcriptionApiBaseUrl
   */
  constructor({
    userRepository,
    answerRepository,
    studyRepository,
    transcriptionRepository,
    FieldValue,
    transcriptionApiBaseUrl,
  }) {
    this.userRepository = userRepository
    this.answerRepository = answerRepository
    this.studyRepository = studyRepository
    this.transcriptionRepository = transcriptionRepository
    this.FieldValue = FieldValue
    this.transcriptionApiBaseUrl = transcriptionApiBaseUrl
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
      provider,
      model: modelInput,
      studyId = null,
    } = input || {}

    const transcriptionProvider = TranscriptionProvider.create({
      provider,
      model: modelInput,
    })

    const baseUrl = (this.transcriptionApiBaseUrl || '').replace(/\/$/, '')
    if (!baseUrl) {
      fail(
        'failed-precondition',
        'TRANSCRIPTION_API_BASE_URL is not configured',
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
      message: 'Task transcription is not permitted',
    })

    const task =
      answerData.taskAnswers?.[userDocId]?.tasks?.[String(taskId)] ?? null
    if (!task) {
      fail('not-found', 'Task not found for the given userDocId/taskId')
    }

    const audioUrlEvaluator = task.audioRecordURL || null
    const audioUrlModerator = task.moderatorAudioURL || null
    if (!audioUrlEvaluator && !audioUrlModerator) {
      fail('failed-precondition', 'No audio files available for this task')
    }

    const [evaluatorRaw, moderatorRaw] = await Promise.all([
      transcribeAudio({
        baseUrl,
        audioUrl: audioUrlEvaluator,
        provider: transcriptionProvider.name,
        model: transcriptionProvider.model,
        role: 'evaluator',
      }),
      transcribeAudio({
        baseUrl,
        audioUrl: audioUrlModerator,
        provider: transcriptionProvider.name,
        model: transcriptionProvider.model,
        role: 'moderator',
      }),
    ])

    const now = this.FieldValue.serverTimestamp()
    const existingTranscriptionDocId = task.transcriptionDocId || null

    let existingTranscription = null
    if (existingTranscriptionDocId) {
      existingTranscription = await this.transcriptionRepository.get(existingTranscriptionDocId)
    }

    const transcription = Transcription.create({
      id: existingTranscription?.id ?? null,
      answersDocId,
      userDocId,
      taskId,
      provider: transcriptionProvider.name,
      model: transcriptionProvider.model,
      createdAt: existingTranscription?.createdAt ?? now,
      updatedAt: now,
      evaluator: TranscriptSide.create(evaluatorRaw),
      moderator: TranscriptSide.create(moderatorRaw),
    })

    let saved
    if (existingTranscription) {
      await this.transcriptionRepository.set(
        existingTranscriptionDocId,
        transcription,
      )
      saved = transcription.withId(existingTranscriptionDocId)
    } else {
      const transcriptionId =
        await this.transcriptionRepository.create(transcription)
      saved = transcription.withId(transcriptionId)

      await this.answerRepository.setTranscriptionDocId(
        answersDocId,
        userDocId,
        saved.taskId,
        saved.id,
      )
    }

    return saved.toJSON()
  }
}
