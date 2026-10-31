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
 * Whether anyone is still in a call, by the presence the clients write into
 * RTDB. Members live under two branches of `calls/{roomId}`: `participants`
 * for ordinary testers and `staff` for moderators and observers (see
 * `memberBranch` in VideoCallMesh.vue), so a call hosted by a moderator alone
 * has an empty `participants` map and must still count as occupied.
 *
 * Scope: this reads RTDB presence only. `ModeratedTestView.startTestOnce`
 * writes it whatever video provider the study uses — the facilitator when it
 * opens a call node that did not exist yet, participants and observers as
 * they arrive — and `VideoCallMesh.joinRoom` writes it for every role on the
 * mesh provider. `VideoCallLiveKit` keeps presence in the SFU and never
 * writes it here, so one case is still uncovered: a LiveKit call whose node
 * was created by somebody who has since left, leaving no facilitator entry
 * because the node already existed when the facilitator opened the room.
 * That call looks empty and is swept on staleness alone, as it was before
 * this guard existed. Closing it needs a liveness signal out of LiveKit
 * itself (its credentials currently live only in the standalone token
 * server), not a change to this function.
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

          // Never drop a call somebody is still in, as far as RTDB presence
          // can tell (see `hasConnectedCallMember` for what that does and
          // does not cover). Staleness alone is not enough: `lastUpdate` is
          // only written on specific actions, so a long, quiet-but-active
          // call looks identical to a ghost by that field. This is the same
          // rule `shouldDeleteFocusGroupRoom` already applies to the
          // focusGroupSessions sweep below.
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

      // 4. Re-check who is in the marked calls, as late as possible. The
      // decisions above come from point-in-time snapshots, and joining a call
      // writes only under `calls/{roomId}` — never `rooms/{roomId}` — so a
      // room that was stale when it was read still looks stale once somebody
      // joins it. Without this, whoever joins while the sweep is running has
      // the call deleted underneath them.
      //
      // This narrows the window rather than closing it: RTDB has no
      // conditional multi-path write, and a transaction on `calls/{roomId}`
      // could not cover the `rooms/{roomId}` delete that goes with it. What
      // it does do is cut the exposure from the whole sweep — which includes
      // the `focusGroupSessions` read above — down to this one write.
      const markedCallIds = Object.keys(changes)
        .filter((path) => path.startsWith('calls/'))
        .map((path) => path.slice('calls/'.length))

      if (markedCallIds.length > 0) {
        const latestCallsSnapshot = await callsRef.get()

        markedCallIds
          .filter((callId) =>
            hasConnectedCallMember(latestCallsSnapshot.child(callId).val()),
          )
          .forEach((callId) => {
            // Section 1 always marks `rooms/{id}` and `calls/{id}` together,
            // so sparing the call spares its room; an orphan has no room key
            // to drop and the delete is a no-op. Either way that is one
            // room's worth of `deletedCount`.
            delete changes[`calls/${callId}`]
            delete changes[`rooms/${callId}`]
            deletedCount--
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
