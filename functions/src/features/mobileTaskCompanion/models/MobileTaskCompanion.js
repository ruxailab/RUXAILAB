/**
 * Device pairing for unmoderated task instructions.
 * This is not a Study Session and not a Moderated Session.
 *
 * Persisted at tests/{studyId}/mobileTaskCompanions/{participantUid}.
 * `id` and `studyId` are path data and are not stored on the document.
 */

export const COMPANION_STATUS = Object.freeze({
  PAIRED: 'paired',
  ENDED: 'ended',
})

export const TASK_OUTCOME = Object.freeze({
  COMPLETED: 'completed',
  NOT_COMPLETED: 'not_completed',
})

export const PUBLIC_COMPANION_STATE = Object.freeze({
  WAITING: 'waiting',
  ACTIVE: 'active',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  ENDED: 'ended',
})

/** Written on the task answer when the outcome is accepted by the server. */
export const PARTICIPATION_MODE = 'mobile-task-instructions'

/**
 * Highest task index the server will activate and the rules will lock.
 * `tasks` is a map keyed by this index ("0".."15"). Firestore rules can only
 * check a fixed set of keys without blowing the evaluation budget.
 */
export const MAX_TASK_INDEX = 15

/** 32 random bytes, hex, same width as study invite tokens. */
export const COMPANION_TOKEN_PATTERN = /^[a-f0-9]{64}$/

/** Safe as a Firestore document id and as one segment of a field path. */
export const PARTICIPANT_UID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/

/**
 * Domain model for a mobile task companion document.
 */
export class MobileTaskCompanion {
  /**
   * @param {object} params
   * @param {string|null} [params.id]
   * @param {string|null} [params.studyId]
   * @param {string|null} [params.token]
   * @param {string|null} [params.participantUid]
   * @param {string|null} [params.answerId]
   * @param {string} [params.status]
   * @param {number|null} [params.companionLastSeenAt]
   * @param {object|null} [params.activeTask]
   * @param {object|null} [params.lastOutcome]
   * @param {boolean} [params.taskPhaseCompleted]
   * @param {number|null} [params.createdAt]
   * @param {number|null} [params.endedAt]
   */
  constructor({
    id = null,
    studyId = null,
    token = null,
    participantUid = null,
    answerId = null,
    status = COMPANION_STATUS.PAIRED,
    companionLastSeenAt = null,
    activeTask = null,
    lastOutcome = null,
    taskPhaseCompleted = false,
    createdAt = null,
    endedAt = null,
  } = {}) {
    this.id = id
    this.studyId = studyId
    this.token = token || null
    this.participantUid = participantUid || id
    this.answerId = answerId
    this.status = status
    this.companionLastSeenAt = companionLastSeenAt ?? null
    this.activeTask = mapActiveTask(activeTask)
    this.lastOutcome = mapLastOutcome(lastOutcome)
    this.taskPhaseCompleted = taskPhaseCompleted === true
    this.createdAt = createdAt ?? null
    this.endedAt = endedAt ?? null
  }

  /**
   * @param {object} params
   * @returns {MobileTaskCompanion}
   */
  static create(params) {
    return new MobileTaskCompanion(params)
  }

  /**
   * Hydrate from a Firestore document. `id` is the participant uid and
   * `studyId` comes from the parent path.
   *
   * @param {object} [data]
   * @param {string|null} [id]
   * @param {string|null} [studyId]
   * @returns {MobileTaskCompanion}
   */
  static fromFirestore(data = {}, id = null, studyId = null) {
    return MobileTaskCompanion.create({
      id,
      studyId,
      token: data.token ?? null,
      participantUid: data.participantUid ?? id,
      answerId: data.answerId ?? null,
      status: data.status ?? COMPANION_STATUS.PAIRED,
      companionLastSeenAt: data.companionLastSeenAt ?? null,
      activeTask: data.activeTask ?? null,
      lastOutcome: data.lastOutcome ?? null,
      taskPhaseCompleted: data.taskPhaseCompleted === true,
      createdAt: data.createdAt ?? null,
      endedAt: data.endedAt ?? null,
    })
  }

  /**
   * Persistable Firestore document (without path fields).
   *
   * @returns {object}
   */
  toFirestore() {
    return {
      token: this.token,
      participantUid: this.participantUid,
      answerId: this.answerId,
      status: this.status,
      companionLastSeenAt: this.companionLastSeenAt,
      activeTask: this.activeTask,
      lastOutcome: this.lastOutcome,
      taskPhaseCompleted: this.taskPhaseCompleted,
      createdAt: this.createdAt,
      endedAt: this.endedAt,
    }
  }
}

/**
 * @param {object|null|undefined} value
 * @returns {object|null}
 */
function mapActiveTask(value) {
  if (!value || typeof value !== 'object') return null
  return {
    taskIndex: value.taskIndex,
    taskId: value.taskId,
    attemptId: value.attemptId,
    startedAt: value.startedAt,
    taskNumber: value.taskNumber,
    title: typeof value.title === 'string' ? value.title : '',
    description: typeof value.description === 'string' ? value.description : '',
    taskType: typeof value.taskType === 'string' ? value.taskType : '',
  }
}

/**
 * @param {object|null|undefined} value
 * @returns {object|null}
 */
function mapLastOutcome(value) {
  if (!value || typeof value !== 'object') return null
  return {
    taskIndex: value.taskIndex,
    taskId: value.taskId,
    attemptId: value.attemptId,
    outcome: value.outcome,
    completed: value.completed === true,
    startedAt: value.startedAt,
    endedAt: value.endedAt,
    taskTime: value.taskTime,
    participationMode: value.participationMode ?? PARTICIPATION_MODE,
  }
}
