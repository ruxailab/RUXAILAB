import {
  COMPANION_STATUS,
  MobileTaskCompanion,
  PUBLIC_COMPANION_STATE,
} from '../models/MobileTaskCompanion.js'
import { isParticipantAnswerSubmitted } from './taskSession.js'

/**
 * Payload returned to the phone. No token, uid, email, name, answer id,
 * study id, or task link.
 *
 * The active state also includes taskIndex, taskId, and attemptId. The phone
 * has to send those back to submitMobileTaskOutcome. The live RTDB node is
 * the channel that delivers them.
 * Waiting, accepted, completed, and ended stay without task data.
 *
 * Invalid, ended, and submitted sessions all return the same ended state.
 * A clean finish of the task phase is `completed`, not `ended`.
 *
 * @param {import('../models/MobileTaskCompanion.js').MobileTaskCompanion|null|undefined} companion
 * @param {object|null|undefined} answer
 * @returns {{
 *   state: 'ended'|'waiting'|'accepted'|'active'|'completed',
 *   taskNumber?: number,
 *   title?: string,
 *   description?: string,
 *   taskIndex?: number,
 *   taskId?: string,
 *   attemptId?: string,
 *   taskType?: string,
 * }}
 */
export function toPublicCompanionState(companion, answer) {
  if (
    !companion ||
    companion.status !== COMPANION_STATUS.PAIRED ||
    !companion.token ||
    isParticipantAnswerSubmitted(answer, companion.participantUid)
  ) {
    return { state: PUBLIC_COMPANION_STATE.ENDED }
  }

  if (companion.taskPhaseCompleted) {
    return { state: PUBLIC_COMPANION_STATE.COMPLETED }
  }

  const active = companion.activeTask
  const last = companion.lastOutcome
  if (
    active?.attemptId &&
    last?.attemptId === active.attemptId &&
    Number(last.taskIndex) === Number(active.taskIndex)
  ) {
    return { state: PUBLIC_COMPANION_STATE.ACCEPTED }
  }

  if (active?.attemptId) {
    const view = {
      state: PUBLIC_COMPANION_STATE.ACTIVE,
      taskNumber: active.taskNumber,
      title: typeof active.title === 'string' ? active.title : '',
      description:
        typeof active.description === 'string' ? active.description : '',
      taskIndex: active.taskIndex,
      taskId: String(active.taskId),
      attemptId: active.attemptId,
    }
    if (typeof active.taskType === 'string' && active.taskType) {
      view.taskType = active.taskType
    }
    return view
  }

  return { state: PUBLIC_COMPANION_STATE.WAITING }
}

/**
 * Live-node write that follows the companion change. Ended sessions delete
 * the node so the phone listener sees `exists: false`. Completed (thank-you)
 * keeps the node so the phone can show the message.
 *
 * @param {object} params
 * @param {import('../models/MobileTaskCompanion.js').MobileTaskCompanion|null|undefined} params.companion
 * @param {object|null|undefined} params.answer
 * @param {object} [params.companionUpdate]
 * @param {boolean} [params.clearToken]
 * @returns {{ studyId: string, token: string, payload?: object, delete?: boolean }|null}
 */
export function publicViewWrite({
  companion,
  answer,
  companionUpdate,
  clearToken = false,
} = {}) {
  const token = companion?.token
  const studyId = companion?.studyId
  if (!token || !studyId) return null

  if (clearToken) {
    return { studyId, token, delete: true }
  }

  const next = companionAfterDecision(companion, companionUpdate)
  const payload = toPublicCompanionState(next, answer)
  if (payload.state === PUBLIC_COMPANION_STATE.ENDED) {
    return { studyId, token, delete: true }
  }
  return { studyId, token, payload }
}

/**
 * @param {import('../models/MobileTaskCompanion.js').MobileTaskCompanion} companion
 * @param {object} [companionUpdate]
 * @returns {import('../models/MobileTaskCompanion.js').MobileTaskCompanion}
 */
function companionAfterDecision(companion, companionUpdate) {
  if (!companionUpdate || Object.keys(companionUpdate).length === 0) {
    return companion
  }
  return MobileTaskCompanion.fromFirestore(
    { ...companion.toFirestore(), ...companionUpdate },
    companion.id,
    companion.studyId,
  )
}

/**
 * Desktop restore payload. The phone must never receive this object:
 * it contains the token.
 *
 * @param {import('../models/MobileTaskCompanion.js').MobileTaskCompanion|null|undefined} companion
 * @returns {object|null}
 */
export function toDesktopCompanion(companion) {
  if (
    !companion ||
    companion.status !== COMPANION_STATUS.PAIRED ||
    !companion.token
  ) {
    return null
  }

  return {
    companionId: companion.id,
    token: companion.token,
    status: companion.status,
    companionLastSeenAt: companion.companionLastSeenAt ?? null,
    activeTask: companion.activeTask
      ? {
          taskIndex: companion.activeTask.taskIndex,
          taskId: companion.activeTask.taskId,
          attemptId: companion.activeTask.attemptId,
          startedAt: companion.activeTask.startedAt,
          taskNumber: companion.activeTask.taskNumber,
          title: companion.activeTask.title ?? '',
          description: companion.activeTask.description ?? '',
          taskType: companion.activeTask.taskType ?? '',
        }
      : null,
    lastOutcome: companion.lastOutcome
      ? {
          taskIndex: companion.lastOutcome.taskIndex,
          taskId: companion.lastOutcome.taskId,
          attemptId: companion.lastOutcome.attemptId,
          outcome: companion.lastOutcome.outcome,
          completed: companion.lastOutcome.completed === true,
          startedAt: companion.lastOutcome.startedAt,
          endedAt: companion.lastOutcome.endedAt,
          taskTime: companion.lastOutcome.taskTime,
          participationMode: companion.lastOutcome.participationMode,
        }
      : null,
  }
}
