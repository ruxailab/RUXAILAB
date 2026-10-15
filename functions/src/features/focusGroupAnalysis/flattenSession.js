/**
 * Reshapes a persisted Focus Group session record (`answers/{id}.sessions.{sessionId}`,
 * as written by `toSessionRecord()` in the frontend's `useFocusGroupSession.js`)
 * into the shapes the Tier 1 NLP modules need. Deliberately reimplemented here
 * rather than imported from `src/ux/FocusGroup/utils/themeBoard.js` — the
 * frontend and Cloud Functions are separate deploy units with no shared
 * package, so the (small, framework-free) flattening logic is mirrored, not
 * shared. Keep in sync with `flattenSessionResponses` there if the session
 * message shape ever changes.
 *
 * @param {{ sessionId: string, facilitatorId?: string, messages: Object }} session
 * @param {Set<string>} [participantIds] - when supplied, restrict output to
 *   this session's participant roster (never facilitator/observer messages).
 * @returns {Array<{ sessionId, topicId, messageId, participantId, text }>}
 */
export function flattenSessionMessages(session, participantIds) {
  const flattened = []
  Object.entries(session?.messages ?? {}).forEach(([topicId, byId]) => {
    Object.entries(byId ?? {}).forEach(([messageId, message]) => {
      const participantId = message?.userId ?? ''
      if (participantIds && !participantIds.has(participantId)) return
      if (session?.facilitatorId && participantId === session.facilitatorId) return
      flattened.push({
        sessionId: session.sessionId,
        topicId,
        messageId,
        participantId,
        text: message?.text ?? '',
        timestamp: message?.timestamp ?? 0,
      })
    })
  })
  return flattened
}

/**
 * Groups flattened messages into one concatenated text block per
 * (topic, participant) — richer input for keyword extraction, summarization,
 * and consensus scoring than any single short chat message would give.
 *
 * @param {Array<{ topicId, participantId, text, timestamp }>} flatMessages
 * @returns {Object} { [topicId]: Array<{ participantId, text }> }, chronological within each participant
 */
export function groupTextByTopicAndParticipant(flatMessages) {
  const byTopic = {}
  flatMessages.forEach((message) => {
    if (!byTopic[message.topicId]) byTopic[message.topicId] = new Map()
    const byParticipant = byTopic[message.topicId]
    const existing = byParticipant.get(message.participantId) ?? []
    existing.push(message)
    byParticipant.set(message.participantId, existing)
  })

  const result = {}
  Object.entries(byTopic).forEach(([topicId, byParticipant]) => {
    result[topicId] = [...byParticipant.entries()].map(([participantId, msgs]) => ({
      participantId,
      text: msgs
        .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
        .map((m) => m.text)
        .join(' '),
    }))
  })
  return result
}
