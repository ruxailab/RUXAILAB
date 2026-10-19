import { fail } from '../../../core/errors.js'
import { ROLE, assertStudyAccess } from '../../../shared/auth/index.js'

/**
 * Clears the text side of a sentiment document and rebuilds analytics.
 * Deletes the document when the facial side is also empty.
 */
export class DeleteTextSentimentService {
  /**
   * @param {object} deps
   * @param {import('../../../shared/repositories/FirestoreUserRepository.js').FirestoreUserRepository} deps.userRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {import('../../../shared/repositories/FirestoreStudyRepository.js').FirestoreStudyRepository} deps.studyRepository
   * @param {import('../../../shared/repositories/FirestoreSentimentRepository.js').FirestoreSentimentRepository} deps.sentimentRepository
   * @param {(answersDocId: string) => { execute: Function }} deps.createRebuildService
   * @param {{ serverTimestamp: Function }} deps.FieldValue
   */
  constructor({
    userRepository,
    answerRepository,
    studyRepository,
    sentimentRepository,
    createRebuildService,
    FieldValue,
  }) {
    this.userRepository = userRepository
    this.answerRepository = answerRepository
    this.studyRepository = studyRepository
    this.sentimentRepository = sentimentRepository
    this.createRebuildService = createRebuildService
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {{ sentimentDocId: string, studyId?: string }} params.input
   * @returns {Promise<{
   *   sentimentDocId: string|null,
   *   side: 'text',
   *   removedDocument: boolean,
   *   answersDocId: string,
   *   userDocId: string,
   *   taskId: string,
   * }>}
   */
  async execute({ uid, input }) {
    const { sentimentDocId, studyId = null } = input || {}
    const sentiment = await this.sentimentRepository.get(sentimentDocId)
    if (!sentiment) {
      fail('not-found', 'Sentiment document not found')
    }

    const { answersDocId, userDocId, taskId } = sentiment
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
        resolvedStudyId
          ? 'Study not found'
          : 'Study not found for answersDocId',
      )
    }
    if (studyId && study.answersDocId && study.answersDocId !== answersDocId) {
      fail('invalid-argument', 'studyId does not match answersDocId')
    }

    assertStudyAccess(study, uid, isSuperAdmin, {
      allowedRoles: [ROLE.ADMIN, ROLE.MANAGER],
      message: 'Text sentiment delete is not permitted',
    })

    const next = sentiment.withText(null, this.FieldValue.serverTimestamp())
    const removedDocument = !next.facial && !next.text

    if (removedDocument) {
      await this.sentimentRepository.delete(sentimentDocId)
      await this.answerRepository.setSentimentDocId(
        answersDocId,
        userDocId,
        String(taskId),
        null,
      )
    } else {
      await this.sentimentRepository.set(sentimentDocId, next, { merge: false })
    }

    await this.createRebuildService(answersDocId).execute({ answersDocId })

    return {
      sentimentDocId: removedDocument ? null : sentimentDocId,
      side: 'text',
      removedDocument,
      answersDocId,
      userDocId,
      taskId: String(taskId),
    }
  }
}
