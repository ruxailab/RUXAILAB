import { fail } from '../../../core/errors.js'
import { ROLE, assertStudyAccess } from '../../../shared/auth/index.js'

/**
 * Delete a transcription document, update the task pointer, and rebuild analytics.
 */
export class DeleteTranscriptionService {
  /**
   * @param {object} deps
   * @param {import('../../../shared/repositories/FirestoreUserRepository.js').FirestoreUserRepository} deps.userRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {import('../../../shared/repositories/FirestoreStudyRepository.js').FirestoreStudyRepository} deps.studyRepository
   * @param {import('../repositories/FirestoreTranscriptionRepository.js').FirestoreTranscriptionRepository} deps.transcriptionRepository
   * @param {(answersDocId: string) => import('./RebuildTranscriptionAnalyticsService.js').RebuildTranscriptionAnalyticsService} deps.createRebuildService
   */
  constructor({
    userRepository,
    answerRepository,
    studyRepository,
    transcriptionRepository,
    createRebuildService,
  }) {
    this.userRepository = userRepository
    this.answerRepository = answerRepository
    this.studyRepository = studyRepository
    this.transcriptionRepository = transcriptionRepository
    this.createRebuildService = createRebuildService
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @param {string} params.input.transcriptionId
   * @param {string} [params.input.studyId]
   * @returns {Promise<{
   *   id: string,
   *   answersDocId: string,
   *   userDocId: string,
   *   taskId: string,
   *   transcriptionDocId: string|null,
   * }>}
   */
  async execute({ uid, input }) {
    const { transcriptionId, studyId = null } = input || {}

    const transcription =
      await this.transcriptionRepository.get(transcriptionId)
    if (!transcription) {
      fail('not-found', 'Transcription document not found')
    }

    const { answersDocId, userDocId, taskId } = transcription

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
      message: 'Transcription delete is not permitted',
    })

    const siblings = await this.transcriptionRepository.listByAnswerUserTask(
      answersDocId,
      userDocId,
      taskId,
    )
    const remaining = siblings.filter(
      (item) => String(item.id) !== String(transcriptionId),
    )
    const newLatestId = remaining[0]?.id ?? null

    const currentPointer =
      answerData.taskAnswers?.[userDocId]?.tasks?.[String(taskId)]
        ?.transcriptionDocId ?? null
    const wasPointer = String(currentPointer || '') === String(transcriptionId)
    const nextPointer = wasPointer ? newLatestId : currentPointer || null

    await this.transcriptionRepository.delete(transcriptionId)

    if (wasPointer) {
      await this.answerRepository.setTranscriptionDocId(
        answersDocId,
        userDocId,
        String(taskId),
        nextPointer,
      )
    }

    const rebuildService = this.createRebuildService(answersDocId)
    await rebuildService.execute({ answersDocId })

    return {
      id: transcriptionId,
      answersDocId,
      userDocId,
      taskId: String(taskId),
      transcriptionDocId: nextPointer,
    }
  }
}
