/**
 * Each participant's share of the session's discussion messages, as a
 * percentage of the total. Purely derived from data already tracked by
 * `useFocusGroupSession` (RTDB `messages/{topicId}/{messageId}`) — no new
 * writes needed. Facilitator-only signal: "identify the percentage
 * participation of each user".
 *
 * @param {Object} messages - { [topicId]: { [messageId]: { userId, ... } } }
 * @returns {Object} { [userId]: percent } — percent is 0-100, rounded to the
 *   nearest whole number. Empty when no messages have been sent yet.
 */
export function computeParticipation(messages) {
  const counts = {}
  let total = 0

  Object.values(messages ?? {}).forEach((topicMessages) => {
    Object.values(topicMessages ?? {}).forEach((message) => {
      const userId = message?.userId
      if (!userId) return
      counts[userId] = (counts[userId] ?? 0) + 1
      total += 1
    })
  })

  if (total === 0) return {}

  const percentages = {}
  Object.entries(counts).forEach(([userId, count]) => {
    percentages[userId] = Math.round((count / total) * 100)
  })
  return percentages
}
