
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { admin } from '../f.firebase.js'

// Run every 6 hours
export const cleanupGhostSessions = onSchedule('every 6 hours', async (event) => {
  const db = admin.database()
  const roomsRef = db.ref('rooms')

  const now = Date.now()
  const cutoffTime = now - 6 * 60 * 60 * 1000 // 6 hours ago

  try {
    const snapshot = await roomsRef.get()
    if (!snapshot.exists()) return

    const updates = {}
    let deletedCount = 0

    snapshot.forEach((child) => {
      const roomId = child.key
      const roomData = child.val()

      const createdAt = roomData.createdAt || 0
      const lastHeartbeat = roomData.lastHeartbeat || 0
      const lastActive = Math.max(createdAt, lastHeartbeat)

      if (lastActive > 0 && lastActive < cutoffTime) {
        // Stale session
        updates[`rooms/${roomId}`] = null
        updates[`calls/${roomId}`] = null
        deletedCount++
      } else if (lastActive === 0) {
        // No timestamps, consider it stale
        updates[`rooms/${roomId}`] = null
        updates[`calls/${roomId}`] = null
        deletedCount++
      }
    })

    if (deletedCount > 0) {
      await db.ref().update(updates)
      console.log(`Cleaned up ${deletedCount} ghost sessions.`)
    }
  } catch (error) {
    console.error('Error cleaning up ghost sessions:', error)
  }
})
