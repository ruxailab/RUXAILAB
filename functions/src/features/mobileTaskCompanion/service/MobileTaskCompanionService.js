import { fail } from '../../../core/errors.js'
import {
  COMPANION_STATUS,
  COMPANION_TOKEN_PATTERN,
  MobileTaskCompanion,
  PARTICIPANT_UID_PATTERN,
} from '../models/MobileTaskCompanion.js'
import { publicViewWrite, toDesktopCompanion } from './publicCompanionState.js'
import {
  assertAnswerLinked,
  assertDocumentId,
  assertMobileTaskInstructionsAllowed,
  assertParticipantUid,
  assertUnmoderatedParticipant,
  decideActivation,
  decideEnd,
  decideTaskOutcome,
  decideTaskPhaseComplete,
  isParticipantAnswerSubmitted,
  resolveStudyTask,
} from './taskSession.js'

/**
 * Pairs a phone to an existing unmoderated user test and records one
 * server-side outcome per task attempt.
 *
 * Persistence goes through the repositories. This class does not touch Firestore.
 */
export class MobileTaskCompanionService {
  /**
   * @param {object} deps
   * @param {object} deps.companionRepository
   * @param {{ get: Function }} deps.studyRepository
   * @param {{ get: Function }} deps.answerRepository
   * @param {{ remove: Function }} [deps.presenceRepository]
   * @param {() => number} deps.now epoch milliseconds
   * @param {() => string} deps.createToken 32 random bytes, hex
   * @param {() => string} deps.createAttemptId
   */
  constructor({
    companionRepository,
    studyRepository,
    answerRepository,
    presenceRepository = { remove: async () => {} },
    now,
    createToken,
    createAttemptId,
  }) {
    this.companionRepository = companionRepository
    this.studyRepository = studyRepository
    this.answerRepository = answerRepository
    this.presenceRepository = presenceRepository
    this.now = now
    this.createToken = createToken
    this.createAttemptId = createAttemptId
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {string|null} params.signInProvider
   * @param {{ studyId: string, answerId: string }} params.input
   */
  async create({ uid, signInProvider, input }) {
    const { study, studyId, answerId, answer } = await this.loadOwnedContext({
      uid,
      signInProvider,
      studyId: input.studyId,
      answerId: input.answerId,
    })
    assertMobileTaskInstructionsAllowed(study)
    if (isParticipantAnswerSubmitted(answer, uid)) {
      fail('failed-precondition', 'Answer is already submitted')
    }

    const companion = await this.companionRepository.openPairedSession({
      studyId,
      participantUid: uid,
      answerId,
      buildFresh: () =>
        MobileTaskCompanion.create({
          id: uid,
          studyId,
          token: this.createToken(),
          participantUid: uid,
          answerId,
          status: COMPANION_STATUS.PAIRED,
          companionLastSeenAt: null,
          activeTask: null,
          lastOutcome: null,
          taskPhaseCompleted: false,
          createdAt: this.now(),
          endedAt: null,
        }),
    })

    return { companion: toDesktopCompanion(companion) }
  }

  /**
   * Restores the QR after a desktop reload. Does not rotate or clear the token.
   *
   * @param {object} params
   * @param {string} params.uid
   * @param {string|null} params.signInProvider
   * @param {{ studyId: string, answerId: string }} params.input
   */
  async get({ uid, signInProvider, input }) {
    const { study, studyId, answerId } = await this.loadOwnedContext({
      uid,
      signInProvider,
      studyId: input.studyId,
      answerId: input.answerId,
    })
    assertMobileTaskInstructionsAllowed(study)
    const companion = await this.companionRepository.findByParticipant(
      studyId,
      uid,
    )
    if (!companion || companion.answerId !== answerId) {
      return { companion: null }
    }
    return { companion: toDesktopCompanion(companion) }
  }

  /**
   * Desktop only, on Start task. Failure here must not block the computer flow.
   *
   * @param {object} params
   * @param {string} params.uid
   * @param {string|null} params.signInProvider
   * @param {{ studyId: string, answerId: string, taskIndex: number, taskId: string|number }} params.input
   */
  async activate({ uid, signInProvider, input }) {
    const { study, studyId, answerId } = await this.loadOwnedContext({
      uid,
      signInProvider,
      studyId: input.studyId,
      answerId: input.answerId,
    })
    assertMobileTaskInstructionsAllowed(study)
    const task = resolveStudyTask(study, input.taskIndex, input.taskId)
    const existing = await this.companionRepository.findByParticipant(
      studyId,
      uid,
    )
    if (
      !existing ||
      existing.answerId !== answerId ||
      existing.status !== COMPANION_STATUS.PAIRED
    ) {
      fail('not-found', 'Mobile task companion not found')
    }

    return this.companionRepository.commitSessionChange({
      studyId,
      companionId: existing.id,
      answerId,
      decide: ({ companion, answer }) =>
        this.withPublicView(
          decideActivation({
            companion,
            answer,
            task,
            now: this.now(),
            createAttemptId: this.createAttemptId,
          }),
          companion,
          answer,
        ),
    })
  }

  /**
   * Desktop calls as the owning uid. The phone calls with studyId,
   * participantUid and token, and no auth.
   * A resolved response is the stored outcome. Callers must use that outcome
   * and must not treat a thrown error as success.
   *
   * @param {object} params
   * @param {string|null} params.uid
   * @param {string|null} [params.signInProvider]
   * @param {object} params.input
   */
  async submitOutcome({ uid = null, signInProvider = null, input }) {
    const token = typeof input?.token === 'string' ? input.token : ''
    if (!token && !uid) {
      fail('unauthenticated', 'Authentication is required')
    }

    const request = normalizeOutcomeRequest(input)
    const located = token
      ? await this.locateByPhone(input)
      : await this.locateOwned(uid, signInProvider, input.studyId, input.answerId)

    return this.companionRepository.commitSessionChange({
      studyId: located.studyId,
      companionId: located.companion.id,
      answerId: located.companion.answerId,
      decide: ({ companion, answer }) =>
        this.withPublicView(
          decideTaskOutcome({
            companion,
            answer,
            request: {
              ...request,
              token: token || null,
              uid: token ? null : uid,
            },
            now: this.now(),
          }),
          companion,
          answer,
        ),
    })
  }

  /**
   * Call when the participant turns the mode off, and on final submit
   * before the client sets `submitted: true`. Reloading must not call this.
   *
   * @param {object} params
   * @param {string} params.uid
   * @param {string|null} params.signInProvider
   * @param {{ studyId: string, answerId: string }} params.input
   */
  async end({ uid, signInProvider, input }) {
    const { studyId, answerId } = await this.loadOwnedContext({
      uid,
      signInProvider,
      studyId: input.studyId,
      answerId: input.answerId,
    })
    const existing = await this.companionRepository.findByParticipant(
      studyId,
      uid,
    )
    if (!existing || existing.answerId !== answerId) {
      fail('not-found', 'Mobile task companion not found')
    }

    const token = existing.token
    const result = await this.companionRepository.commitSessionChange({
      studyId,
      companionId: existing.id,
      answerId,
      decide: ({ companion, answer }) =>
        this.withPublicView(
          decideEnd({
            companion,
            answer,
            uid,
            now: this.now(),
          }),
          companion,
          answer,
        ),
    })
    await this.presenceRepository.remove(token)
    return result
  }

  /**
   * Desktop calls this when the participant leaves the last task for
   * post-test or finish. The pairing stays live so the phone can show
   * thank-you. Final submit still calls `end`.
   *
   * @param {object} params
   * @param {string} params.uid
   * @param {string|null} params.signInProvider
   * @param {{ studyId: string, answerId: string }} params.input
   */
  async completeTaskPhase({ uid, signInProvider, input }) {
    const { studyId, answerId } = await this.loadOwnedContext({
      uid,
      signInProvider,
      studyId: input.studyId,
      answerId: input.answerId,
    })
    const existing = await this.companionRepository.findByParticipant(
      studyId,
      uid,
    )
    if (!existing || existing.answerId !== answerId) {
      fail('not-found', 'Mobile task companion not found')
    }

    return this.companionRepository.commitSessionChange({
      studyId,
      companionId: existing.id,
      answerId,
      decide: ({ companion, answer }) =>
        this.withPublicView(
          decideTaskPhaseComplete({
            companion,
            answer,
            uid,
          }),
          companion,
          answer,
        ),
    })
  }

  /**
   * @param {object} decision
   * @param {object|null} companion
   * @param {object|null} answer
   */
  withPublicView(decision, companion, answer) {
    return {
      ...decision,
      view: publicViewWrite({
        companion,
        answer,
        companionUpdate: decision.companionUpdate,
        clearToken: decision.clearToken === true,
      }),
    }
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {string|null} params.signInProvider
   * @param {string} params.studyId
   * @param {string} params.answerId
   */
  async loadOwnedContext({ uid, signInProvider, studyId, answerId }) {
    assertParticipantUid(uid)
    assertDocumentId(studyId, 'studyId')
    assertDocumentId(answerId, 'answerId')

    const [study, answer] = await Promise.all([
      this.studyRepository.get(studyId),
      this.answerRepository.get(answerId),
    ])
    assertUnmoderatedParticipant(study, uid, signInProvider)
    assertAnswerLinked(study, answer, answerId)
    return { study, answer, studyId, answerId }
  }

  /**
   * @param {object} input
   */
  async locateByPhone(input) {
    const studyId = input?.studyId
    const participantUid = input?.participantUid
    const token = input?.token
    if (!locatorIsValid({ studyId, participantUid, token })) {
      fail('not-found', 'Mobile task session is not available')
    }
    const companion = await this.companionRepository.findByParticipant(
      studyId,
      participantUid,
    )
    if (!companion || companion.token !== token) {
      fail('not-found', 'Mobile task session is not available')
    }
    return { studyId, companion }
  }

  /**
   * @param {string} uid
   * @param {string|null} signInProvider
   * @param {string} studyId
   * @param {string} answerId
   */
  async locateOwned(uid, signInProvider, studyId, answerId) {
    if (!studyId || !answerId) {
      fail('invalid-argument', 'studyId and answerId are required')
    }
    const owned = await this.loadOwnedContext({
      uid,
      signInProvider,
      studyId,
      answerId,
    })
    const companion = await this.companionRepository.findByParticipant(
      studyId,
      uid,
    )
    if (!companion || companion.answerId !== answerId) {
      fail('not-found', 'Mobile task companion not found')
    }
    return { studyId: owned.studyId, companion }
  }
}

/**
 * @param {unknown} token
 * @returns {boolean}
 */
function tokenIsValid(token) {
  return typeof token === 'string' && COMPANION_TOKEN_PATTERN.test(token)
}

/**
 * @param {object} params
 * @param {unknown} params.studyId
 * @param {unknown} params.participantUid
 * @param {unknown} params.token
 * @returns {boolean}
 */
function locatorIsValid({ studyId, participantUid, token }) {
  return (
    tokenIsValid(token) &&
    typeof studyId === 'string' &&
    studyId.length > 0 &&
    studyId.length <= 200 &&
    !studyId.includes('/') &&
    typeof participantUid === 'string' &&
    PARTICIPANT_UID_PATTERN.test(participantUid)
  )
}

/**
 * @param {object} input
 */
function normalizeOutcomeRequest(input) {
  const taskIndex = input?.taskIndex
  if (!Number.isInteger(taskIndex) || taskIndex < 0) {
    fail('invalid-argument', 'Task index is out of range')
  }
  if (
    input.outcome !== 'completed' &&
    input.outcome !== 'not_completed'
  ) {
    fail('invalid-argument', 'Outcome is not valid')
  }
  if (typeof input.attemptId !== 'string' || input.attemptId.length === 0) {
    fail('invalid-argument', 'attemptId is required')
  }
  if (input.taskId == null || input.taskId === '') {
    fail('invalid-argument', 'taskId is required')
  }
  return {
    taskIndex,
    taskId: String(input.taskId),
    attemptId: input.attemptId,
    outcome: input.outcome,
  }
}
