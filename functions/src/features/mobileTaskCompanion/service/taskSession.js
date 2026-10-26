import { fail } from '../../../core/errors.js'
import { ROLE, resolveStudyRole } from '../../../shared/auth/index.js'
import {
  COMPANION_STATUS,
  MAX_TASK_INDEX,
  PARTICIPANT_UID_PATTERN,
  PARTICIPATION_MODE,
  PUBLIC_COMPANION_STATE,
  TASK_OUTCOME,
} from '../models/MobileTaskCompanion.js'

/**
 * @param {unknown} value
 * @param {string} label
 */
export function assertDocumentId(value, label) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > 200 ||
    value.includes('/')
  ) {
    fail('invalid-argument', `${label} is not valid`)
  }
}

/**
 * @param {unknown} uid
 */
export function assertParticipantUid(uid) {
  if (typeof uid !== 'string' || !PARTICIPANT_UID_PATTERN.test(uid)) {
    fail(
      'failed-precondition',
      'Participant id cannot own a mobile task companion',
    )
  }
}

/**
 * Unmoderated user test only. Anyone who can answer that study may pair:
 * invited participants, the owner, study admins and managers, and a
 * signed-in account on a public study. Observators and unrelated accounts
 * cannot. The companion stays scoped to the caller's uid.
 *
 * @param {object|null|undefined} study
 * @param {string} uid
 * @param {string|null} signInProvider
 */
export function assertUnmoderatedParticipant(study, uid, signInProvider) {
  if (!study) fail('not-found', 'Study not found')

  const studyType = String(study.testType || '').toUpperCase()
  if (studyType !== 'USER' || study.subType === 'USER_MODERATED') {
    fail(
      'failed-precondition',
      'Mobile task instructions are only available for unmoderated user tests',
    )
  }

  const role = resolveStudyRole(study, uid)
  const canAnswer =
    role === ROLE.USER || role === ROLE.ADMIN || role === ROLE.MANAGER
  const publicAccount =
    study.isPublic === true &&
    typeof signInProvider === 'string' &&
    signInProvider.length > 0 &&
    signInProvider !== 'anonymous'

  if (!canAnswer && !publicAccount) {
    fail(
      'permission-denied',
      'This account cannot use mobile task instructions for this study',
    )
  }
}

/**
 * Admin kill switch. A missing field keeps the legacy default (on).
 *
 * @param {object|null|undefined} study
 */
export function assertMobileTaskInstructionsAllowed(study) {
  if (study?.allowMobileTaskInstructions === false) {
    fail(
      'failed-precondition',
      'Mobile task instructions are disabled for this study',
    )
  }
}

/**
 * @param {object} study
 * @param {object|null|undefined} answer
 * @param {string} answerId
 */
export function assertAnswerLinked(study, answer, answerId) {
  if (!answer) fail('not-found', 'Answer document not found')
  if (!study.answersDocId || study.answersDocId !== answerId) {
    fail('failed-precondition', 'Answer document does not belong to this study')
  }
  if (answer.studyId && answer.studyId !== study.id) {
    fail('failed-precondition', 'Answer document does not belong to this study')
  }
}

/**
 * @param {object|null|undefined} answer
 * @param {string} participantUid
 * @returns {boolean}
 */
export function isParticipantAnswerSubmitted(answer, participantUid) {
  return answer?.taskAnswers?.[participantUid]?.submitted === true
}

/**
 * @param {object|null|undefined} answer
 * @param {string} participantUid
 * @param {number} taskIndex
 * @returns {object|null}
 */
export function readStoredTask(answer, participantUid, taskIndex) {
  const tasks = answer?.taskAnswers?.[participantUid]?.tasks
  if (!tasks) return null
  if (Array.isArray(tasks)) return tasks[taskIndex] || null
  return tasks[String(taskIndex)] || tasks[taskIndex] || null
}

/**
 * Same identity the desktop stores on TaskAnswer: `String(task.id || taskIndex)`.
 *
 * @param {object} study
 * @param {number} taskIndex
 * @param {string|number} requestedTaskId
 */
export function resolveStudyTask(study, taskIndex, requestedTaskId) {
  if (
    !Number.isInteger(taskIndex) ||
    taskIndex < 0 ||
    taskIndex > MAX_TASK_INDEX
  ) {
    fail('invalid-argument', 'Task index is out of range')
  }

  const tasks = study?.testStructure?.userTasks
  if (!Array.isArray(tasks) || taskIndex >= tasks.length) {
    fail('invalid-argument', 'Task index is out of range')
  }

  const task = tasks[taskIndex] || {}
  const taskId = String(task.id || taskIndex)
  if (String(requestedTaskId) !== taskId) {
    fail('invalid-argument', 'Task id does not match this study task')
  }

  return {
    taskIndex,
    taskId,
    taskNumber: taskIndex + 1,
    title: typeof task.taskName === 'string' ? task.taskName : '',
    description:
      typeof task.taskDescription === 'string' ? task.taskDescription : '',
  }
}

/**
 * @param {object} lastOutcome
 * @param {boolean} duplicate
 */
function toStoredOutcome(lastOutcome, duplicate) {
  return {
    accepted: true,
    duplicate,
    taskIndex: lastOutcome.taskIndex,
    taskId: lastOutcome.taskId,
    attemptId: lastOutcome.attemptId,
    outcome: lastOutcome.outcome,
    completed: lastOutcome.completed === true,
    startedAt: lastOutcome.startedAt,
    endedAt: lastOutcome.endedAt,
    taskTime: lastOutcome.taskTime,
    participationMode: PARTICIPATION_MODE,
  }
}

/**
 * First outcome for the active attempt wins. A retry of that attemptId
 * returns the stored outcome and writes nothing. A different attemptId
 * does not match the active attempt and fails.
 *
 * @param {object} params
 * @param {object|null} params.companion
 * @param {object|null} params.answer
 * @param {object} params.request
 * @param {number} params.now
 */
export function decideTaskOutcome({ companion, answer, request, now }) {
  if (
    !companion ||
    companion.status !== COMPANION_STATUS.PAIRED ||
    !companion.token
  ) {
    fail('failed-precondition', 'Mobile task session has ended')
  }
  if (request.token && request.token !== companion.token) {
    fail('not-found', 'Mobile task session is not available')
  }
  if (request.uid && request.uid !== companion.participantUid) {
    fail('permission-denied', 'Only the participant can submit this task outcome')
  }
  if (!answer) fail('not-found', 'Answer document not found')
  if (isParticipantAnswerSubmitted(answer, companion.participantUid)) {
    fail('failed-precondition', 'Answer is already submitted')
  }

  const active = companion.activeTask
  const sameAttempt =
    active?.attemptId &&
    Number(request.taskIndex) === Number(active.taskIndex) &&
    String(request.taskId) === String(active.taskId) &&
    request.attemptId === active.attemptId

  const last = companion.lastOutcome
  if (
    last?.attemptId &&
    last.attemptId === request.attemptId &&
    Number(request.taskIndex) === Number(last.taskIndex) &&
    String(request.taskId) === String(last.taskId)
  ) {
    return { result: toStoredOutcome(last, true) }
  }

  if (!sameAttempt) {
    fail('failed-precondition', 'Task attempt is no longer active')
  }

  const startedAt = Number(active.startedAt)
  if (!Number.isFinite(startedAt)) {
    fail('failed-precondition', 'Active task is missing a start time')
  }

  assertParticipantUid(companion.participantUid)
  if (
    !Number.isInteger(active.taskIndex) ||
    active.taskIndex < 0 ||
    active.taskIndex > MAX_TASK_INDEX
  ) {
    fail('failed-precondition', 'Task index is out of range')
  }

  const completed = request.outcome === TASK_OUTCOME.COMPLETED
  const endedAt = now
  const lastOutcome = {
    taskIndex: active.taskIndex,
    taskId: String(active.taskId),
    attemptId: active.attemptId,
    outcome: completed ? TASK_OUTCOME.COMPLETED : TASK_OUTCOME.NOT_COMPLETED,
    completed,
    startedAt,
    endedAt,
    taskTime: endedAt - startedAt,
    participationMode: PARTICIPATION_MODE,
  }
  const prefix = `taskAnswers.${companion.participantUid}.tasks.${active.taskIndex}`

  return {
    result: toStoredOutcome(lastOutcome, false),
    companionUpdate: { lastOutcome, activeTask: null },
    answerUpdate: {
      [`${prefix}.completed`]: completed,
      [`${prefix}.attempted`]: true,
      [`${prefix}.startedAt`]: startedAt,
      [`${prefix}.endedAt`]: endedAt,
      [`${prefix}.participationMode`]: PARTICIPATION_MODE,
      [`${prefix}.taskTime`]: lastOutcome.taskTime,
    },
  }
}

/**
 * Generates attemptId and startedAt only when this task has no outcome yet.
 * Repeating Start for the same open attempt keeps the existing ids.
 *
 * @param {object} params
 * @param {object|null} params.companion
 * @param {object|null} params.answer
 * @param {object} params.task
 * @param {number} params.now
 * @param {() => string} params.createAttemptId
 */
export function decideActivation({
  companion,
  answer,
  task,
  now,
  createAttemptId,
}) {
  if (
    !companion ||
    companion.status !== COMPANION_STATUS.PAIRED ||
    !companion.token
  ) {
    fail('failed-precondition', 'Mobile task session has ended')
  }
  if (!answer) fail('not-found', 'Answer document not found')
  if (isParticipantAnswerSubmitted(answer, companion.participantUid)) {
    fail('failed-precondition', 'Answer is already submitted')
  }

  const stored = readStoredTask(
    answer,
    companion.participantUid,
    task.taskIndex,
  )
  if (stored?.attempted === true) {
    fail('failed-precondition', 'Task already has an outcome')
  }
  if (
    companion.lastOutcome &&
    Number(companion.lastOutcome.taskIndex) === task.taskIndex
  ) {
    fail('failed-precondition', 'Task already has an outcome')
  }

  const active = companion.activeTask
  const sameOpenAttempt =
    active?.attemptId &&
    Number(active.taskIndex) === task.taskIndex &&
    String(active.taskId) === task.taskId &&
    companion.lastOutcome?.attemptId !== active.attemptId

  if (sameOpenAttempt) {
    return {
      result: {
        attemptId: active.attemptId,
        startedAt: active.startedAt,
        taskIndex: active.taskIndex,
        taskId: active.taskId,
        taskNumber: active.taskNumber,
      },
    }
  }

  const activeTask = {
    taskIndex: task.taskIndex,
    taskId: task.taskId,
    attemptId: createAttemptId(),
    startedAt: now,
    taskNumber: task.taskNumber,
    title: task.title,
    description: task.description,
  }

  return {
    companionUpdate: { activeTask },
    result: {
      attemptId: activeTask.attemptId,
      startedAt: activeTask.startedAt,
      taskIndex: activeTask.taskIndex,
      taskId: activeTask.taskId,
      taskNumber: activeTask.taskNumber,
    },
  }
}

/**
 * Invalidates the token. A reload must not call this.
 * Rejects when the answer is already submitted and the token is still live,
 * so the desktop has to end the companion before it marks the answer submitted.
 * A second call after the token is gone succeeds without another write.
 *
 * @param {object} params
 * @param {object|null} params.companion
 * @param {object|null} params.answer
 * @param {string} params.uid
 * @param {number} params.now
 */
export function decideEnd({ companion, answer, uid, now }) {
  if (!companion || companion.participantUid !== uid) {
    fail('not-found', 'Mobile task companion not found')
  }

  if (companion.status === COMPANION_STATUS.ENDED || !companion.token) {
    if (companion.token) {
      return {
        clearToken: true,
        companionUpdate: {
          status: COMPANION_STATUS.ENDED,
          endedAt: companion.endedAt ?? now,
        },
        result: { status: COMPANION_STATUS.ENDED },
      }
    }
    return { result: { status: COMPANION_STATUS.ENDED } }
  }

  if (isParticipantAnswerSubmitted(answer, uid)) {
    fail('failed-precondition', 'Answer is already submitted')
  }

  return {
    clearToken: true,
    companionUpdate: {
      status: COMPANION_STATUS.ENDED,
      endedAt: now,
      activeTask: null,
    },
    result: { status: COMPANION_STATUS.ENDED },
  }
}

/**
 * Desktop signals that the participant left the last task for post-test
 * or finish. The phone shows thank-you. The token and public view stay
 * so that message is not `ended`. Final submit still calls decideEnd.
 *
 * @param {object} params
 * @param {object|null} params.companion
 * @param {object|null} params.answer
 * @param {string} params.uid
 */
export function decideTaskPhaseComplete({ companion, answer, uid }) {
  if (!companion || companion.participantUid !== uid) {
    fail('not-found', 'Mobile task companion not found')
  }
  if (
    companion.status !== COMPANION_STATUS.PAIRED ||
    !companion.token
  ) {
    fail('failed-precondition', 'Mobile task session has ended')
  }
  if (isParticipantAnswerSubmitted(answer, uid)) {
    fail('failed-precondition', 'Answer is already submitted')
  }
  if (companion.taskPhaseCompleted) {
    return { result: { status: PUBLIC_COMPANION_STATE.COMPLETED } }
  }

  return {
    companionUpdate: {
      taskPhaseCompleted: true,
      activeTask: null,
    },
    result: { status: PUBLIC_COMPANION_STATE.COMPLETED },
  }
}
