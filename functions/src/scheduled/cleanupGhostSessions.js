import { onSchedule } from 'firebase-functions/v2/scheduler'
import { admin } from '../core/firebase/f.firebase.js'
import logger from '../utils/logger.js'

/**
 * Whether a Focus Group RTDB room is safe to sweep: never while `live` (the
 * per-message chat doesn't bump `lastUpdate`, so a long quiet discussion must
 * not be mistaken for a ghost), only once it's `ended` (already migrated to
 * Firestore) or was never started, and only past the cutoff.
 *
 * @param {Object} roomData - The room's RTDB value ({} for a missing node).
 * @param {number} cutoffTime - Epoch ms; a room idle since before this is stale.
 * @returns {boolean}
 */
export function shouldDeleteFocusGroupRoom(roomData, cutoffTime) {
  const lastUpdate = roomData?.lastUpdate || 0
  return (
    roomData?.status !== 'live' && (lastUpdate === 0 || lastUpdate < cutoffTime)
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

      // 1. Process Rooms
      const roomsSnapshot = await roomsRef.get()
      if (roomsSnapshot.exists()) {
        roomsSnapshot.forEach((child) => {
          const roomId = child.key
          const roomData = child.val()

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
      const callsSnapshot = await callsRef.get()
      if (callsSnapshot.exists()) {
        callsSnapshot.forEach((child) => {
          const callId = child.key
          // If we already marked this call for deletion via room check, skip
          if (changes[`calls/${callId}`] === null) return

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
