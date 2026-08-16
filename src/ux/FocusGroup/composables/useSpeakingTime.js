import { ref, watch, onBeforeUnmount } from 'vue'
import { RoomEvent } from 'livekit-client'
import { applyActiveSpeakersChange } from '@/ux/FocusGroup/utils/speakingTime'

/**
 * Tracks accumulated LiveKit speaking time per participant identity, for as
 * long as this client stays connected to the room. Ephemeral/client-side
 * only (like message counts are already read live, nothing new is written
 * to RTDB) — every connected client, including the facilitator, receives
 * `ActiveSpeakersChanged` for the whole room, so this needs no new backend.
 *
 * @param {import('vue').Ref} roomRef - the LiveKit Room ref from useLiveKitRoom.
 * @returns {{ speakingMs: import('vue').Ref<Object> }} { [identity]: ms }
 */
export function useSpeakingTime(roomRef) {
  const speakingMs = ref({})
  let activeSince = {}
  let attachedRoom = null

  function handleActiveSpeakersChanged(speakers) {
    const result = applyActiveSpeakersChange({
      accumulatedMs: speakingMs.value,
      activeSince,
      speakingIdentities: speakers.map((participant) => participant.identity),
      now: Date.now(),
    })
    speakingMs.value = result.accumulatedMs
    activeSince = result.activeSince
  }

  function detach() {
    if (attachedRoom) {
      attachedRoom.off(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged)
      attachedRoom = null
    }
  }

  watch(
    roomRef,
    (room) => {
      detach()
      if (room) {
        room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged)
        attachedRoom = room
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(detach)

  return { speakingMs }
}
