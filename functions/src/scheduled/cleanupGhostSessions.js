import { onSchedule } from 'firebase-functions/v2/scheduler'
import { admin } from '../core/firebase/f.firebase.js'
import logger from '../utils/logger.js'

/**
 * Whether a Focus Group RTDB room is safe to sweep: never while `live` (the
 * per-message chat doesn't bump `lastUpdate`, so a long quiet discussion must
 * not be mistaken for a ghost), never while anyone is actually connected
 * (joining an idle scheduled lobby doesn't bump `lastUpdate` either — only a
 * facilitator/topic action does — so someone can be genuinely waiting in a
 * room that still looks stale by that field alone), only once it's `ended`
 * (already migrated to Firestore) or was never started, and only past the
 * cutoff.
 *
 * @param {Object} roomData - The room's RTDB value ({} for a missing node).
 * @param {number} cutoffTime - Epoch ms; a room idle since before this is stale.
 * @returns {boolean}
 */
export function shouldDeleteFocusGroupRoom(roomData, cutoffTime) {
  const lastUpdate = roomData?.lastUpdate || 0
  const hasConnectedParticipant = Object.values(
    roomData?.participants || {},
  ).some((participant) => participant?.connected === true)

  return (
    roomData?.status !== 'live' &&
    !hasConnectedParticipant &&
    (lastUpdate === 0 || lastUpdate < cutoffTime)
  )
}

/**
 * Whether anyone is still in a call. Members live under two branches of
 * `calls/{roomId}`: `participants` for ordinary testers and `staff` for
 * moderators and observers (see `memberBranch` in VideoCallMesh.vue), so a
 * call hosted by a moderator alone has an empty `participants` map and must
 * still count as occupied.
 *
 * @param {Object} callData - The call's RTDB value ({} for a missing node).
 * @returns {boolean}
 */
export function hasConnectedCallMember(callData) {
  return ['participants', 'staff'].some((branch) =>
    Object.values(callData?.[branch] || {}).some(
      (member) => member?.connected === true,
    ),
  )
}

// Run every 6 hours
export const cleanupGhostSessions = onSchedule(
  'every 6 hours',
  async (event) => {
    const db = admin.database()
    const roomsRef = db.ref('rooms')
    const callsRef = db.ref('calls')
    const focusGroupSessionsRef = db.ref('focusGroupSessions')

    const now = Date.now()
    const cutoffTime = now - 6 * 60 * 60 * 1000 // 6 hours ago

    try {
      const changes = {}
      let deletedCount = 0

      // `calls` is read up front: the rooms sweep below needs to know who is
      // connected, and that lives under `calls/{roomId}`, not on the room.
      const [roomsSnapshot, callsSnapshot] = await Promise.all([
        roomsRef.get(),
        callsRef.get(),
      ])

      // 1. Process Rooms
      if (roomsSnapshot.exists()) {
        roomsSnapshot.forEach((child) => {
          const roomId = child.key
          const roomData = child.val()

          // Never drop a call somebody is still in. Staleness alone is not
          // enough: `lastUpdate` is only written on specific actions, so a
          // long, quiet-but-active call looks identical to a ghost by that
          // field. This is the same rule `shouldDeleteFocusGroupRoom`
          // already applies to the focusGroupSessions sweep below.
          if (hasConnectedCallMember(callsSnapshot.child(roomId).val())) return

          const createdAt = roomData.createdAt || 0
          const lastUpdate = roomData.lastUpdate || 0
          const lastActive = Math.max(createdAt, lastUpdate)

          // Check if room is stale
          if ((lastActive > 0 && lastActive < cutoffTime) || lastActive === 0) {
            changes[`rooms/${roomId}`] = null
            changes[`calls/${roomId}`] = null // Ensure call is deleted too
            deletedCount++
          }
        })
      }

      // 2. Process Calls (Check for orphans)
      if (callsSnapshot.exists()) {
        callsSnapshot.forEach((child) => {
          const callId = child.key
          // If we already marked this call for deletion via room check, skip
          if (changes[`calls/${callId}`] === null) return

          // An orphaned call is still a live call if anyone is connected.
          if (hasConnectedCallMember(child.val())) return

          // If a call exists but NO room exists for it, it is an orphan -> DELETE.
          const roomExists = roomsSnapshot.hasChild(callId)
          if (!roomExists) {
            changes[`calls/${callId}`] = null
            deletedCount++
          }
        })
      }

      // 3. Process Focus Group session rooms (one per live room, per
      // `roomId` — either a bare studyId or `${studyId}-${sessionId}`) and
      // their matching backroom transcript, keyed the same way. Only a
      // room that is NOT currently live is ever touched: an ended session's
      // data is already migrated to Firestore by `endFocusGroupSession`, so
      // its RTDB copy is safe to drop past the cutoff, and so is a room that
      // was created but never started. A `live` room is never swept here no
      // matter how stale `lastUpdate` looks — the chat itself doesn't bump
      // it, so a long, quiet-but-active discussion must not be mistaken for
      // a ghost; only "End session" (or this job, once it *is* ended) clears
      // a live room.
      const fgSessionsSnapshot = await focusGroupSessionsRef.get()
      if (fgSessionsSnapshot.exists()) {
        fgSessionsSnapshot.forEach((child) => {
          const roomId = child.key

          if (shouldDeleteFocusGroupRoom(child.val(), cutoffTime)) {
            changes[`focusGroupSessions/${roomId}`] = null
            changes[`focusGroupBackroom/${roomId}`] = null
            deletedCount++
          }
        })
      }

      if (deletedCount > 0) {
        await db.ref().update(changes)
        logger.info('cleanupGhostSessions: cleaned up ghost sessions', {
          deletedCount,
        })
      }
    } catch (error) {
      logger.error('cleanupGhostSessions: failed to clean up ghost sessions', {
        error: error.message,
      })
    }
  },
)
