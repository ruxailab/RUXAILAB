/**
 * Normalize Firestore timestamps and common date shapes to milliseconds.
 *
 * @param {unknown} ts
 * @returns {number}
 */
export const toMillis = (ts) => {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (typeof ts.toDate === 'function') return ts.toDate().getTime()
  if (typeof ts.seconds === 'number') {
    return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6)
  }
  if (ts instanceof Date) return ts.getTime()
  const d = new Date(ts)
  const ms = d.getTime()
  return Number.isNaN(ms) ? 0 : ms
}
