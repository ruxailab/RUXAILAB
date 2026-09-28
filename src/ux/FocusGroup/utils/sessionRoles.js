import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'

/** Resolve a Focus Group attendee role with the session roster taking priority. */
export function isFocusGroupParticipant({
  isFacilitator = false,
  hasScheduledSession = false,
  isSessionParticipant = false,
  isAcceptedStudyParticipant = false,
  accessLevel = null,
}) {
  if (isFacilitator) return false

  // Scheduled sessions have a stricter, per-session attendance roster.
  if (hasScheduledSession) return isSessionParticipant

  return (
    isSessionParticipant ||
    isAcceptedStudyParticipant ||
    accessLevel === ACCESS_LEVEL.EVALUATOR
  )
}

export function normalizeSessionNickname(value) {
  return typeof value === 'string' ? value.trim().slice(0, 40) : ''
}

export function canEnterFocusGroupSession({ userId, nickname }) {
  return Boolean(userId && normalizeSessionNickname(nickname))
}

export function formatElapsedSessionTime(startedAt, now = Date.now()) {
  const start = Number(startedAt)
  if (!Number.isFinite(start) || start <= 0) return '0:00'

  const elapsedSeconds = Math.max(0, Math.floor((now - start) / 1000))
  const hours = Math.floor(elapsedSeconds / 3600)
  const minutes = Math.floor((elapsedSeconds % 3600) / 60)
  const seconds = elapsedSeconds % 60
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`
}
