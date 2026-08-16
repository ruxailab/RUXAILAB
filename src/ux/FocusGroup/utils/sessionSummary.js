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
