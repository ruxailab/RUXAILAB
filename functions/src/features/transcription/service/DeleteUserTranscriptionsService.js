import { fail } from '../../../core/errors.js'
import { ROLE, assertStudyAccess } from '../../../shared/auth/index.js'

/**
 * Delete all transcription documents for an answersDocId + userDocId pair
 * and rebuild answer-level analytics once.
 */
export class DeleteUserTranscriptionsService {
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
   * @param {string} params.input.answersDocId
   * @param {string} params.input.userDocId
   * @param {string} [params.input.studyId]
   * @returns {Promise<{
   *   deletedCount: number,
   *   answersDocId: string,
   *   userDocId: string,
   * }>}
   */
  async execute({ uid, input }) {
    const { answersDocId, userDocId, studyId = null } = input || {}

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

    const items = await this.transcriptionRepository.listByAnswerUser(
      answersDocId,
      userDocId,
    )
    const ids = items.map((item) => item.id)
    const deletedCount = await this.transcriptionRepository.deleteMany(ids)

    const rebuildService = this.createRebuildService(answersDocId)
    await rebuildService.execute({ answersDocId })

    return {
      deletedCount,
      answersDocId,
      userDocId,
    }
  }
}
