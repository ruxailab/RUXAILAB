/**
 * Pure helpers for rendering a finished Focus Group session (as persisted by
 * `toSessionRecord()` under `answers/{answersDocId}.sessions.{sessionId}`).
 * Kept Vue/Firebase-free so they're trivially unit-testable.
 */

/**
 * Turns the `sessions` map into an array, most recent first.
 *
 * @param {Object} sessions - { [sessionId]: { startedAt, ... } }
 * @returns {Array} [{ sessionId, ...session }], sorted newest-first.
 */
export function sortSessionsByStartedAt(sessions) {
  return Object.entries(sessions ?? {})
    .map(([sessionId, session]) => ({ sessionId, ...session }))
    .sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))
}

/**
 * Chronological message list for one topic within a session's messages tree.
 *
 * @param {Object} messages - { [topicId]: { [messageId]: {...} } }
 * @param {string} topicId
 * @returns {Array} [{ id, userId, name, text, timestamp }]
 */
export function flattenTopicMessages(messages, topicId) {
  const byTopic = messages?.[topicId] ?? {}
  return Object.entries(byTopic)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
}

/**
 * Groups one topic's chronological messages by the prompt that was active
 * when each was sent (see `promptText` on the message, stamped by
 * `sendMessage`) — so a topic with several prompts reviews as separate
 * sub-lists instead of one undifferentiated stream. Messages sent with no
 * active prompt (open-floor discussion, or recorded before this field
 * existed) land in a single untitled group, always shown first.
 *
 * @param {Object} messages - { [topicId]: { [messageId]: {...} } }
 * @param {string} topicId
 * @returns {Array} [{ promptText: string|null, messages: Array }]
 */
export function groupTopicMessagesByPrompt(messages, topicId) {
  const flat = flattenTopicMessages(messages, topicId)
  const order = []
  const byPrompt = new Map()

  flat.forEach((message) => {
    const key = message.promptText || null
    if (!byPrompt.has(key)) {
      byPrompt.set(key, [])
      order.push(key)
    }
    byPrompt.get(key).push(message)
  })

  order.sort((a, b) => (a === null ? -1 : b === null ? 1 : 0))
  return order.map((promptText) => ({
    promptText,
    messages: byPrompt.get(promptText),
  }))
}

/**
 * How many messages were posted per topic, for a compact session overview.
 *
 * @param {Object} messages - { [topicId]: { [messageId]: {...} } }
 * @returns {Object} { [topicId]: count }
 */
export function countMessagesByTopic(messages) {
  const counts = {}
  Object.entries(messages ?? {}).forEach(([topicId, byId]) => {
    counts[topicId] = Object.keys(byId ?? {}).length
  })
  return counts
}
