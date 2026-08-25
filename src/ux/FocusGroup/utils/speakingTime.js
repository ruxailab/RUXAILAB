/**
 * Pure accumulator for LiveKit's `ActiveSpeakersChanged` event: turns a
 * sequence of "who's speaking right now" snapshots into accumulated
 * speaking duration per identity. Kept LiveKit/Vue-free so it's trivially
 * unit-testable — the composable that calls this owns the room listener.
 *
 * Time is only added to `accumulatedMs` when a speaker *stops* (transitions
 * out of the active-speakers set), not continuously — simpler than a
 * ticking clock, and in real conversation people pause often enough that
 * this still updates the UI at a natural cadence.
 *
 * @param {Object} params
 * @param {Object} params.accumulatedMs - { [identity]: ms } so far.
 * @param {Object} params.activeSince - { [identity]: timestamp } for
 *   identities currently mid-speech (started but not yet stopped).
 * @param {string[]} params.speakingIdentities - who LiveKit reports as
 *   actively speaking right now.
 * @param {number} params.now - current time in ms (injectable for tests).
 * @returns {{ accumulatedMs: Object, activeSince: Object }} new state;
 *   inputs are not mutated.
 */
export function applyActiveSpeakersChange({
  accumulatedMs,
  activeSince,
  speakingIdentities,
  now,
}) {
  const nextAccumulated = { ...accumulatedMs }
  const nextActiveSince = { ...activeSince }
  const speakingSet = new Set(speakingIdentities ?? [])

  Object.keys(nextActiveSince).forEach((identity) => {
    if (speakingSet.has(identity)) return
    const startedAt = nextActiveSince[identity]
    delete nextActiveSince[identity]
    nextAccumulated[identity] =
      (nextAccumulated[identity] ?? 0) + Math.max(0, now - startedAt)
  })

  speakingSet.forEach((identity) => {
    if (!(identity in nextActiveSince)) {
      nextActiveSince[identity] = now
    }
  })

  return { accumulatedMs: nextAccumulated, activeSince: nextActiveSince }
}
