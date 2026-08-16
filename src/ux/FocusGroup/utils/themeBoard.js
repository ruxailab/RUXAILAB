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

/**
 * Flattens one session's per-topic messages into a flat, taggable list.
 *
 * @param {{ sessionId: string, messages: Object }} session
 * @returns {Array} [{ key, sessionId, topicId, messageId, participantId, excerpt }]
 */
export function flattenSessionResponses(session) {
  const responses = []
  Object.entries(session?.messages ?? {}).forEach(([topicId, byId]) => {
    Object.entries(byId ?? {}).forEach(([messageId, message]) => {
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
 * Rebuilds each theme's `responseRefs` from the current bucket contents,
 * after a drag-and-drop change moved responses between buckets.
 *
 * @param {Array} themes - [{ id, label }]
 * @param {Object} buckets - { [themeId]: Array<response> }
 * @returns {Array} [{ id, label, responseRefs }]
 */
export function themesFromBuckets(themes, buckets) {
  return themes.map((theme) => ({
    id: theme.id,
    label: theme.label,
    responseRefs: (buckets[theme.id] ?? []).map(
      ({ sessionId, topicId, messageId, participantId, excerpt }) => ({
        sessionId,
        topicId,
        messageId,
        participantId,
        excerpt,
      }),
    ),
  }))
}
