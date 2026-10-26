/** Highest task index activateMobileTask accepts. Indexes above this stay desktop-only. */
export const MAX_MOBILE_TASK_INDEX = 15

/** 32 random bytes, hex. Same width as the pairing token. */
export const MOBILE_TASK_TOKEN_PATTERN = /^[a-f0-9]{64}$/

export const MOBILE_TASK_UI_STATE = Object.freeze({
  LOADING: 'loading',
  WAITING: 'waiting',
  ACTIVE: 'active',
  SENDING: 'sending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  DISCONNECTED: 'disconnected',
  ENDED: 'ended',
})

/** Local “Saved” flash after an outcome. The server then goes back to waiting. */
export const MOBILE_TASK_SAVED_CONFIRMATION_MS = 2000

const SERVER_STATES = new Set([
  MOBILE_TASK_UI_STATE.WAITING,
  MOBILE_TASK_UI_STATE.ACTIVE,
  MOBILE_TASK_UI_STATE.ACCEPTED,
  MOBILE_TASK_UI_STATE.COMPLETED,
  MOBILE_TASK_UI_STATE.ENDED,
])

/**
 * Same identity the desktop stores on TaskAnswer and sends to the server.
 *
 * @param {{ id?: string|number }|null|undefined} task
 * @param {number} taskIndex
 * @returns {string}
 */
export function mobileTaskId(task, taskIndex) {
  return String(task?.id || taskIndex)
}

/**
 * @param {number} taskIndex
 * @returns {boolean}
 */
export function isMobileTaskIndexEligible(taskIndex) {
  return (
    Number.isInteger(taskIndex) &&
    taskIndex >= 0 &&
    taskIndex <= MAX_MOBILE_TASK_INDEX
  )
}

/**
 * Path encoded into the desktop QR. The phone uses studyId and token for
 * the public view; participantUid stays in the URL for submit.
 *
 * @param {{ studyId?: string|null, participantUid?: string|null, token?: string|null }} params
 * @returns {string}
 */
export function mobileTaskPairingPath({
  studyId,
  participantUid,
  token,
} = {}) {
  if (!studyId || !participantUid || !token) return ''
  return `/mobile-task/${encodeURIComponent(studyId)}/${encodeURIComponent(participantUid)}/${encodeURIComponent(token)}`
}

/**
 * RTDB path for phone presence. The token is the capability.
 *
 * @param {string|null|undefined} token
 * @returns {string}
 */
export function mobileTaskPresencePath(token) {
  if (typeof token !== 'string' || !MOBILE_TASK_TOKEN_PATTERN.test(token)) {
    return ''
  }
  return `mobileTaskPresence/${token}`
}

/**
 * @param {boolean|null|undefined} connected
 * @returns {boolean}
 */
export function isPhoneConnected(connected) {
  return connected === true
}

/**
 * Server state plus the phone's local flags. `sending` and `loading` exist
 * only on the client. A network failure is never the accepted confirmation.
 * `null` before the first snapshot is loading, not disconnected.
 *
 * @param {{
 *   serverState?: string|null,
 *   submitting?: boolean,
 *   networkFailure?: boolean,
 *   localAccepted?: boolean,
 *   localAcceptedAttemptId?: string|null,
 *   serverAttemptId?: string|null,
 * }} [input]
 * @returns {'loading'|'waiting'|'active'|'sending'|'accepted'|'completed'|'disconnected'|'ended'}
 */
export function mapMobileTaskUiState({
  serverState = null,
  submitting = false,
  networkFailure = false,
  localAccepted = false,
  localAcceptedAttemptId = null,
  serverAttemptId = null,
} = {}) {
  if (submitting) return MOBILE_TASK_UI_STATE.SENDING
  if (networkFailure) return MOBILE_TASK_UI_STATE.DISCONNECTED
  if (serverState == null) return MOBILE_TASK_UI_STATE.LOADING
  if (serverState === MOBILE_TASK_UI_STATE.ENDED) {
    return MOBILE_TASK_UI_STATE.ENDED
  }
  if (serverState === MOBILE_TASK_UI_STATE.COMPLETED) {
    return MOBILE_TASK_UI_STATE.COMPLETED
  }
  if (localAccepted) {
    const nextTaskStarted =
      serverState === MOBILE_TASK_UI_STATE.ACTIVE &&
      typeof serverAttemptId === 'string' &&
      serverAttemptId.length > 0 &&
      serverAttemptId !== localAcceptedAttemptId
    if (!nextTaskStarted) return MOBILE_TASK_UI_STATE.ACCEPTED
  }
  if (SERVER_STATES.has(serverState)) return serverState
  return MOBILE_TASK_UI_STATE.DISCONNECTED
}

/**
 * Success is only a resolved callable with `accepted: true`.
 * The displayed outcome is the server's, including a duplicate of the
 * opposite button. A missing payload is not success.
 *
 * @param {object|null|undefined} response
 * @returns {{
 *   success: boolean,
 *   outcome: string|null,
 *   completed: boolean|null,
 *   duplicate: boolean,
 *   taskIndex?: number,
 *   taskId?: string,
 *   attemptId?: string,
 *   startedAt?: number,
 *   endedAt?: number,
 *   taskTime?: number,
 *   participationMode?: string,
 * }}
 */
export function resolveDisplayedOutcome(response) {
  if (!response || response.accepted !== true) {
    return {
      success: false,
      outcome: null,
      completed: null,
      duplicate: false,
    }
  }

  return {
    success: true,
    outcome: response.outcome,
    completed: response.completed === true,
    duplicate: response.duplicate === true,
    taskIndex: response.taskIndex,
    taskId: response.taskId,
    attemptId: response.attemptId,
    startedAt: response.startedAt,
    endedAt: response.endedAt,
    taskTime: response.taskTime,
    participationMode: response.participationMode,
  }
}

/**
 * A thrown submit is not success. The caller must not show the saved
 * confirmation when this returns `success: false`.
 *
 * @param {() => Promise<object>} submit
 */
export async function settleMobileTaskSubmit(submit) {
  try {
    const response = await submit()
    return resolveDisplayedOutcome(response)
  } catch {
    return resolveDisplayedOutcome(null)
  }
}

/**
 * Copy the accepted server outcome onto the local task before the next save.
 * Observations, media, and questionnaire fields are left untouched.
 *
 * @param {object|null|undefined} task
 * @param {{ success?: boolean, completed?: boolean|null, startedAt?: number, endedAt?: number, taskTime?: number, participationMode?: string }} outcome
 * @returns {object|null|undefined}
 */
export function applyAcceptedOutcome(task, outcome) {
  if (!task || outcome?.success !== true) return task
  task.completed = outcome.completed === true
  task.attempted = true
  task.startedAt = outcome.startedAt
  task.endedAt = outcome.endedAt
  task.taskTime = outcome.taskTime
  task.participationMode = outcome.participationMode
  return task
}
