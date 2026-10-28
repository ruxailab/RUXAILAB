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
  WAITING_FOR_ANSWER: 'waitingForAnswer',
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
 * Short Answer (`post-test`) and Paragraph Answer (`text-area`) keep the
 * computer on the task so the participant can type. The phone only asks
 * the desktop to close the external site.
 *
 * @param {string|null|undefined} taskType
 * @returns {boolean}
 */
export function isReturnToTaskOnlyType(taskType) {
  return taskType === 'post-test' || taskType === 'text-area'
}

/**
 * Path encoded into the desktop QR. The phone uses studyId and token for
 * the live channel; participantUid stays in the URL for submit.
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
 * RTDB path for the live task channel. The token is the capability.
 * The desktop writes task changes here; the phone listens and writes
 * `connected` on the same node.
 *
 * @param {string|null|undefined} token
 * @returns {string}
 */
export function mobileTaskLivePath(token) {
  if (typeof token !== 'string' || !MOBILE_TASK_TOKEN_PATTERN.test(token)) {
    return ''
  }
  return `mobileTaskLive/${token}`
}

/**
 * RTDB path for phone presence. A child of the live node so one token
 * owns both the task and the connection flag.
 *
 * @param {string|null|undefined} token
 * @returns {string}
 */
export function mobileTaskLiveConnectedPath(token) {
  const path = mobileTaskLivePath(token)
  return path ? `${path}/connected` : ''
}

/**
 * RTDB path the phone writes so the desktop closes the external site
 * without finishing the task.
 *
 * @param {string|null|undefined} token
 * @returns {string}
 */
export function mobileTaskLiveReturnToTaskPath(token) {
  const path = mobileTaskLivePath(token)
  return path ? `${path}/returnToTaskAt` : ''
}

/**
 * Picks what the phone shows from the Realtime Database live node.
 * `undefined` means the listener has not answered yet. `null` means it
 * answered and the session node is gone. A node with only `connected`
 * is still pairing.
 *
 * @param {{
 *   rtdb?: object|null,
 *   rtdbFailed?: boolean,
 *   sawPayload?: boolean,
 * }} [input]
 * @returns {{ status: 'loading'|'payload'|'ended'|'disconnected', payload?: object }}
 */
export function resolveMobileTaskChannel({
  rtdb,
  rtdbFailed = false,
  sawPayload = false,
} = {}) {
  if (rtdb && typeof rtdb === 'object' && typeof rtdb.state === 'string') {
    return { status: 'payload', payload: rtdb }
  }
  if (rtdb === undefined) return { status: 'loading' }
  if (rtdbFailed) return { status: 'disconnected' }
  // A valid QR has no task yet. Missing nodes mean "waiting", not "ended",
  // until this phone has already seen a session that then disappeared.
  if (!sawPayload) return { status: 'payload', payload: { state: 'waiting' } }
  return { status: 'ended' }
}

/** 16 random bytes, hex. The server accepts this shape as the attempt id. */
const CLIENT_ATTEMPT_ID_PATTERN = /^[a-f0-9]{32}$/

/**
 * @param {(size: number) => Uint8Array} [randomBytes]
 * @returns {string}
 */
export function createMobileTaskAttemptId(randomBytes = defaultRandomBytes) {
  const bytes = randomBytes(16)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * @param {number} size
 * @returns {Uint8Array}
 */
function defaultRandomBytes(size) {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return bytes
}

/**
 * Payload the desktop writes so the phone can show the task without waiting
 * for a Cloud Function. Active tasks carry the attempt id the server stores.
 *
 * @param {object} input
 * @param {'waiting'|'active'|'accepted'|'completed'} input.state
 * @param {number} [input.taskIndex]
 * @param {string|number|null} [input.taskId]
 * @param {string|null} [input.attemptId]
 * @param {number} [input.taskNumber]
 * @param {string} [input.title]
 * @param {string} [input.description]
 * @param {string} [input.taskType]
 * @param {number} [input.updatedAt]
 * @returns {object|null}
 */
export function buildMobileTaskLivePayload({
  state,
  taskIndex,
  taskId,
  attemptId,
  taskNumber,
  title,
  description,
  taskType,
  updatedAt = Date.now(),
} = {}) {
  if (
    state !== 'waiting' &&
    state !== 'active' &&
    state !== 'accepted' &&
    state !== 'completed'
  ) {
    return null
  }
  if (!Number.isFinite(updatedAt)) return null
  const payload = { state, updatedAt }
  if (state !== 'active') return payload
  if (!isMobileTaskIndexEligible(taskIndex)) return null
  if (typeof attemptId !== 'string' || !CLIENT_ATTEMPT_ID_PATTERN.test(attemptId)) {
    return null
  }
  if (taskId == null || taskId === '') return null
  const taskIdText = String(taskId)
  if (taskIdText.length > 200) return null
  const next = {
    ...payload,
    taskNumber: Number.isInteger(taskNumber) ? taskNumber : taskIndex + 1,
    title: typeof title === 'string' ? title : '',
    description: typeof description === 'string' ? description : '',
    taskIndex,
    taskId: taskIdText,
    attemptId,
  }
  if (typeof taskType === 'string' && taskType.length > 0 && taskType.length <= 50) {
    next.taskType = taskType
  }
  return next
}

const LIVE_TASK_KEYS = [
  'taskNumber',
  'title',
  'description',
  'taskIndex',
  'taskId',
  'attemptId',
  'taskType',
]

/**
 * RTDB `update()` payload. Inactive states clear leftover task fields
 * without touching `connected`.
 *
 * @param {object|null|undefined} payload
 * @returns {object|null}
 */
export function mobileTaskLiveUpdate(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.state === 'active') return { ...payload }
  const update = { ...payload }
  for (const key of LIVE_TASK_KEYS) {
    update[key] = null
  }
  update.returnToTaskAt = null
  return update
}

/**
 * Payload the desktop queues on RTDB `onDisconnect`. The pairing node stays
 * so the phone goes back to waiting instead of ended.
 *
 * @param {number} [updatedAt]
 * @returns {object|null}
 */
export function mobileTaskLiveDisconnectUpdate(updatedAt = Date.now()) {
  return mobileTaskLiveUpdate(
    buildMobileTaskLivePayload({ state: 'waiting', updatedAt }),
  )
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
 *   returnedToTask?: boolean,
 *   returnedAttemptId?: string|null,
 *   serverAttemptId?: string|null,
 * }} [input]
 * @returns {'loading'|'waiting'|'active'|'sending'|'accepted'|'waitingForAnswer'|'completed'|'disconnected'|'ended'}
 */
export function mapMobileTaskUiState({
  serverState = null,
  submitting = false,
  networkFailure = false,
  localAccepted = false,
  localAcceptedAttemptId = null,
  returnedToTask = false,
  returnedAttemptId = null,
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
  if (returnedToTask) {
    const nextTaskStarted =
      serverState === MOBILE_TASK_UI_STATE.ACTIVE &&
      typeof serverAttemptId === 'string' &&
      serverAttemptId.length > 0 &&
      serverAttemptId !== returnedAttemptId
    if (!nextTaskStarted && serverState === MOBILE_TASK_UI_STATE.ACTIVE) {
      return MOBILE_TASK_UI_STATE.WAITING_FOR_ANSWER
    }
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
