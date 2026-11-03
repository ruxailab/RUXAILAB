export const MIN_SILENCE_SECONDS = 5

/** Spoken intervals of a transcription run, from every speaker. */
export function speechIntervals(run) {
  if (!run) return []
  return ['evaluator', 'moderator']
    .flatMap((role) => run?.[role]?.segments ?? [])
    .map((segment) => ({
      start: Number(segment.start),
      end: Number(segment.end),
    }))
    .filter(
      ({ start, end }) =>
        Number.isFinite(start) && Number.isFinite(end) && end > start,
    )
}

/**
 * Gaps of at least `minDuration` seconds where nobody speaks. Overlapping
 * speakers are merged first. The stretch before the first line always counts;
 * the one after the last line only when the recording `duration` is known.
 */
export function findSilences(
  intervals,
  { minDuration = MIN_SILENCE_SECONDS, duration = null } = {},
) {
  if (!intervals.length) return []
  const sorted = [...intervals].sort((a, b) => a.start - b.start)
  const silences = []
  let cursor = 0

  const addGap = (start, end) => {
    if (end - start >= minDuration) silences.push({ start, end })
  }

  sorted.forEach(({ start, end }) => {
    addGap(cursor, start)
    cursor = Math.max(cursor, end)
  })
  if (Number.isFinite(duration) && duration > cursor) addGap(cursor, duration)

  return silences
}
