
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { admin } from '../f.firebase.js'

// Run every 6 hours
export const cleanupGhostSessions = onSchedule('every 6 hours', async (event) => {
  const db = admin.database()
  const roomsRef = db.ref('rooms')
  const callsRef = db.ref('calls')

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

      // Check if room is stale
      // 1. If it has a createdAt timestamp, check that.
      // 2. If it has a lastHeartbeat timestamp, check that.
      // 3. Fallback: If no timestamp, we might be risky deleting it, but ghost sessions usually have no recent activity.
      // Let's assume we add createdAt/lastHeartbeat to all sessions going forward.
      // For legacy sessions without timestamps, we might skip them or use a different heuristic.
      
      const createdAt = roomData.createdAt || 0
      const lastHeartbeat = roomData.lastHeartbeat || 0
      const lastActive = Math.max(createdAt, lastHeartbeat)

      if (lastActive > 0 && lastActive < cutoffTime) {
        // Stale session
        updates[`rooms/${roomId}`] = null
        updates[`calls/${roomId}`] = null
        deletedCount++
      } else if (lastActive === 0) {
          // If no timestamp, check if it's empty or clearly abandoned.
          // For safety, we only delete if we have a timestamp.
          // TO-DO: Ensure creation sets createdAt.
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
