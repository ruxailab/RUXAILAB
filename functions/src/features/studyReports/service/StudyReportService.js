import { fail } from '../../../core/errors.js'
import {
  ROLE,
  assertStudyAccess,
  normalizeStudyType,
} from '../../../shared/auth/index.js'

const ANSWER_COLLECTION = Object.freeze({
  USER: 'taskAnswers',
  CARD_SORTING: 'cardSortingAnswers',
  HEURISTIC: 'heuristicAnswers',
})

/**
 * @param {string} [type]
 * @returns {'taskAnswers'|'cardSortingAnswers'|'heuristicAnswers'}
 */
export function answerCollectionFor(type) {
  const normalized = normalizeStudyType(type)
  return ANSWER_COLLECTION[normalized] || ANSWER_COLLECTION.HEURISTIC
}

/**
 * Answers are stored as a map keyed by participant id. Older anonymous
 * unmoderated entries may use an Ev* key while `userDocId` lives inside
 * the entry (or the other way around).
 *
 * @param {object} answersMap
 * @param {string} userDocId
 * @returns {string|null}
 */
export function resolveAnswerKey(answersMap, userDocId) {
  if (!userDocId) return null
  if (answersMap?.[userDocId]) return userDocId
  const match = Object.entries(answersMap || {}).find(
    ([, entry]) => entry?.userDocId === userDocId,
  )
  return match ? match[0] : userDocId
}

/**
 * Admin/manager report operations on the answers document. Client SDK
 * writes are rejected by Firestore rules because participants may only
 * change their own unsubmitted entry.
 */
export class StudyReportService {
  /**
   * @param {object} deps
   * @param {import('../../../shared/repositories/FirestoreUserRepository.js').FirestoreUserRepository} deps.userRepository
   * @param {import('../../../shared/repositories/FirestoreAnswerRepository.js').FirestoreAnswerRepository} deps.answerRepository
   * @param {import('../../../shared/repositories/FirestoreStudyRepository.js').FirestoreStudyRepository} deps.studyRepository
   * @param {{ delete: Function }} deps.FieldValue
   */
  constructor({
    userRepository,
    answerRepository,
    studyRepository,
    FieldValue,
  }) {
    this.userRepository = userRepository
    this.answerRepository = answerRepository
    this.studyRepository = studyRepository
    this.FieldValue = FieldValue
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @returns {Promise<{
   *   answersDocId: string,
   *   userDocId: string,
   *   answerKey: string,
   *   collectionKey: string,
   *   study: object,
   *   answersMap: object,
   * }>}
   */
  async authorize({ uid, input }) {
    const { answersDocId, userDocId, studyId = null, answerType = null } =
      input || {}

    const [answerData, isSuperAdmin] = await Promise.all([
      this.answerRepository.get(answersDocId),
      this.userRepository.isSuperAdmin(uid),
    ])

    if (!answerData) fail('not-found', 'Answer document not found')

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
      message: 'Managing study reports is not permitted',
    })

    const collectionKey = answerCollectionFor(
      answerType || answerData.type || study.testType,
    )
    const answersMap = answerData[collectionKey] || {}
    const answerKey = resolveAnswerKey(answersMap, userDocId)

    return {
      answersDocId,
      userDocId,
      answerKey,
      collectionKey,
      study,
      answersMap,
    }
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @returns {Promise<{
   *   success: true,
   *   answersDocId: string,
   *   userDocId: string,
   *   answerKey: string,
   * }>}
   */
  async remove({ uid, input }) {
    const context = await this.authorize({ uid, input })

    await this.answerRepository.update(context.answersDocId, {
      [`${context.collectionKey}.${context.answerKey}`]:
        this.FieldValue.delete(),
    })

    const user = await this.userRepository.get(context.userDocId)
    if (user && context.study?.id) {
      await this.userRepository.update(context.userDocId, {
        [`myAnswers.${context.study.id}`]: this.FieldValue.delete(),
      })
    }

    return {
      success: true,
      answersDocId: context.answersDocId,
      userDocId: context.userDocId,
      answerKey: context.answerKey,
    }
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @returns {Promise<{
   *   success: true,
   *   hidden: boolean,
   *   answersDocId: string,
   *   userDocId: string,
   * }>}
   */
  async setHidden({ uid, input }) {
    const context = await this.authorize({ uid, input })
    if (!context.answersMap[context.answerKey]) {
      fail('not-found', 'Report not found')
    }

    const hidden = input?.hidden === true
    await this.answerRepository.update(context.answersDocId, {
      [`${context.collectionKey}.${context.answerKey}.hidden`]: hidden,
    })

    return {
      success: true,
      hidden,
      answersDocId: context.answersDocId,
      userDocId: context.userDocId,
    }
  }
}
