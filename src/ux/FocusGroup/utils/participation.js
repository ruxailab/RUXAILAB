/**
 * Each participant's share of the session's overall activity, as a
 * percentage. Blends two independent signals so a participant who mostly
 * talks isn't invisible next to one who mostly types:
 *
 * - message share: text messages posted, from RTDB `messages/{topicId}/{messageId}`
 * - speaking share: LiveKit active-speaker time, from useSpeakingTime()
 *
 * Facilitator-only signal: "identify the percentage participation of each
 * user". When only one signal has any data, that signal alone decides the
 * split — averaging against an all-zero signal would otherwise flatten
 * everyone toward 50%.
 *
 * @param {Object} params
 * @param {Object} params.messages - { [topicId]: { [messageId]: { userId, ... } } }
 * @param {Object} [params.speakingMs] - { [userId]: accumulated milliseconds speaking }
 * @returns {Object} { [userId]: percent } — percent is 0-100, rounded to the
 *   nearest whole number. Empty when neither signal has any data yet.
 */
export function computeParticipation({ messages, speakingMs } = {}) {
  const messageShares = sharesFromCounts(countMessagesByUser(messages))
  const speakingShares = sharesFromCounts(speakingMs ?? {})

  const hasMessages = Object.keys(messageShares).length > 0
  const hasSpeaking = Object.keys(speakingShares).length > 0
  if (!hasMessages && !hasSpeaking) return {}

  const userIds = new Set([
    ...Object.keys(messageShares),
    ...Object.keys(speakingShares),
  ])

  const percentages = {}
  userIds.forEach((userId) => {
    const blended =
      hasMessages && hasSpeaking
        ? ((messageShares[userId] ?? 0) + (speakingShares[userId] ?? 0)) / 2
        : (messageShares[userId] ?? speakingShares[userId] ?? 0)
    percentages[userId] = Math.round(blended)
  })
  return percentages
}

/**
 * Raw message count per author, across every topic in the session.
 *
 * @param {Object} messages - { [topicId]: { [messageId]: { userId, ... } } }
 * @returns {Object} { [userId]: count }
 */
export function countMessagesByUser(messages) {
  const counts = {}
  Object.values(messages ?? {}).forEach((topicMessages) => {
    Object.values(topicMessages ?? {}).forEach((message) => {
      const userId = message?.userId
      if (!userId) return
      counts[userId] = (counts[userId] ?? 0) + 1
    })
  })
  return counts
}

/**
 * Normalizes a { [userId]: quantity } map (message counts, milliseconds
 * spoken, anything additive) into each key's percentage share of the total.
 *
 * @param {Object} counts - { [userId]: number }
 * @returns {Object} { [userId]: percent } — unrounded; empty when the total is 0.
 */
function sharesFromCounts(counts) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  if (total === 0) return {}
  const shares = {}
  Object.entries(counts).forEach(([userId, count]) => {
    shares[userId] = (count / total) * 100
  })
  return shares
}
