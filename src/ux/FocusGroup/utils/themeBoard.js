/**
 * Pure helpers powering the drag-and-drop thematic editor. Kept Vue/Firebase
 * free: the component owns the reactive `vuedraggable` lists, these
 * functions only compute plain data from/to them.
 */

/** Stable composite key so vuedraggable (and re-matching after a save) has a
 * consistent identity for a message regardless of which theme it's in. */
export function buildResponseKey({ sessionId, topicId, messageId }) {
  return `${sessionId}:${topicId}:${messageId}`
}

function hasParticipantRole(person) {
  if (person?.accessLevel !== undefined && person?.accessLevel !== null) {
    return Number(person.accessLevel) === 1
  }
  return ['participant', 'participante'].includes(
    String(person?.role ?? '').trim().toLowerCase(),
  )
}

/**
 * Flattens one session's per-topic messages into a flat, taggable list —
 * excluding the facilitator's own chat. Theming groups *participant*
 * responses into patterns; a facilitator's prompts and transitions aren't
 * response data and would only clutter the board (they still appear, marked,
 * in the plain topic transcript — just never as draggable theme material).
 *
 * @param {{ sessionId: string, facilitatorId: string, messages: Object }} session
 * @returns {Array} [{ key, sessionId, topicId, messageId, participantId, excerpt }]
 */
export function flattenSessionResponses(session) {
  const responses = []
  const roster = session?.participants ?? {}
  const hasRoster = Object.keys(roster).length > 0
  const participantIds = new Set(
    Object.entries(roster)
      .filter(([, person]) => hasParticipantRole(person))
      .map(([userId]) => userId),
  )
  Object.entries(session?.messages ?? {}).forEach(([topicId, byId]) => {
    Object.entries(byId ?? {}).forEach(([messageId, message]) => {
      const userId = message?.userId
      if (session?.facilitatorId && userId === session.facilitatorId) {
        return
      }
      if (hasRoster && !participantIds.has(userId)) return
      responses.push({
        key: buildResponseKey({
          sessionId: session.sessionId,
          topicId,
          messageId,
        }),
        sessionId: session.sessionId,
        topicId,
        messageId,
        participantId: message?.userId ?? '',
        excerpt: message?.text ?? '',
      })
    })
  })
  return responses
}

/**
 * Splits a flat response list into "unsorted" and "already tagged into a
 * theme" buckets, based on each theme's existing `responseRefs`. Responses
 * referenced by a theme but not present in this session's flattened list
 * (e.g. the ref points at a different session) are left out of both —
 * they simply don't render on this session's board.
 *
 * @param {Array} responses - from flattenSessionResponses()
 * @param {Array} themes - [{ id, responseRefs }]
 * @returns {{ unsorted: Array, buckets: Object }} buckets: { [themeId]: Array }
 */
export function partitionResponsesByTheme(responses, themes) {
  const byKey = new Map(responses.map((response) => [response.key, response]))
  const taggedKeys = new Set()
  const buckets = {}

  themes.forEach((theme) => {
    buckets[theme.id] = []
    ;(theme.responseRefs ?? []).forEach((ref) => {
      const key = buildResponseKey(ref)
      const response = byKey.get(key)
      if (!response) return
      taggedKeys.add(key)
      buckets[theme.id].push(response)
    })
  })

  const unsorted = responses.filter((response) => !taggedKeys.has(response.key))
  return { unsorted, buckets }
}

/**
 * Rebuilds each theme's response refs for the currently reviewed session,
 * preserving references belonging to all other sessions.
 *
 * @param {Array} themes - [{ id, label }]
 * @param {Object} buckets - { [themeId]: Array<response> }
 * @param {string} sessionId - the session represented by the visible board
 * @returns {Array} [{ id, label, responseRefs }]
 */
export function themesFromBuckets(themes, buckets, sessionId) {
  return themes.map((theme) => ({
    id: theme.id,
    label: theme.label,
    keywords: theme.keywords ?? [],
    frequency: theme.frequency ?? 0,
    source: theme.source ?? 'manual',
    responseRefs: [
      ...(theme.responseRefs ?? []).filter((ref) => ref.sessionId !== sessionId),
      ...(buckets[theme.id] ?? []).map(
      ({ sessionId, topicId, messageId, participantId, excerpt }) => ({
        sessionId,
        topicId,
        messageId,
        participantId,
        excerpt,
      }),
      ),
    ],
  }))
}
