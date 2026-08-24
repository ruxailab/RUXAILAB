import { onSchedule } from 'firebase-functions/v2/scheduler'
import { admin } from '../core/firebase/f.firebase.js'
import logger from '../utils/logger.js'

// Run every 6 hours
export const cleanupGhostSessions = onSchedule(
  'every 6 hours',
  async (event) => {
    const db = admin.database()
    const roomsRef = db.ref('rooms')
    const callsRef = db.ref('calls')

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
