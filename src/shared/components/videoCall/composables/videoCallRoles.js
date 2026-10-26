import { ACCESS_LEVEL, normalizeAccessLevel } from '@/shared/utils/accessLevel'

export const VIDEO_CALL_ROLES = {
  MODERATOR: 'moderator',
  OBSERVATOR: 'observator',
  PARTICIPANT: 'participant',
}

/**
 * Maps a RUXAILAB accessLevel to a video call role.
 * Mirrors the JWT grant matrix enforced by the token server (SDD §8.5/9.8).
 */
export function roleFromAccessLevel(accessLevel) {
  const normalized = normalizeAccessLevel(accessLevel)

  if (normalized === ACCESS_LEVEL.OBSERVATOR) return VIDEO_CALL_ROLES.OBSERVATOR
  if (normalized === ACCESS_LEVEL.ADMIN) return VIDEO_CALL_ROLES.MODERATOR
  return VIDEO_CALL_ROLES.PARTICIPANT
}

/**
 * Resolves the publish/subscribe capabilities a participant should reflect in
 * the UI. The LiveKit Server is the source of truth via JWT grants; this only
 * mirrors the role so the client renders the right controls.
 */
export function mediaCapabilitiesFor(accessLevel) {
  const normalized = normalizeAccessLevel(accessLevel)
  const isObservator = normalized === ACCESS_LEVEL.OBSERVATOR
  return {
    canPublish: !isObservator,
    canSubscribe: true,
  }
}
