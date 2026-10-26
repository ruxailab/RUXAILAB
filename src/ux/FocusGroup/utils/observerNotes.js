/** RTDB can return dense numeric-keyed arrays as either arrays or objects. */
export function normalizeObserverNotes(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  return Object.values(value)
}

export function mergeFinalObserverNotes(
  liveNotes,
  persistedNotes,
  { userId, isObserver = false, observerNotes = [] } = {},
) {
  const merged = Object.fromEntries(
    Object.entries({ ...(liveNotes || {}), ...(persistedNotes || {}) }).map(
      ([observerId, value]) => [observerId, normalizeObserverNotes(value)],
    ),
  )

  if (userId && isObserver) {
    merged[userId] = normalizeObserverNotes(observerNotes)
  }

  return merged
}

export function getObserverNoteEntries(notes) {
  return Object.entries(notes || {})
    .map(([userId, value]) => ({
      userId,
      notes: normalizeObserverNotes(value),
    }))
    .filter((entry) => entry.notes.length)
    .map(({ userId, notes }) => ({
      userId,
      displayName:
        notes.find((note) => note?.observerName)?.observerName ||
        `Observer ${userId.slice(0, 6)}`,
      notes,
    }))
}
