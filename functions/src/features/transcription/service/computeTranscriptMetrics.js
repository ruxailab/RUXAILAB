/**
 * @param {string|null|undefined} text
 * @returns {number}
 */
export const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/**
 * @param {object|null|undefined} side
 * @returns {number}
 */
const wordsFromSide = (side) => {
  if (!side) return 0
  if (side.transcript?.trim()) return countWords(side.transcript)
  const segments = Array.isArray(side.segments) ? side.segments : []
  return segments.reduce((total, segment) => total + countWords(segment?.text), 0)
}

/**
 * @param {object|null|undefined} side
 * @returns {{ speakingTime: number, maxEnd: number }}
 */
const timingFromSide = (side) => {
  const segments = Array.isArray(side?.segments) ? side.segments : []
  let speakingTime = 0
  let maxEnd = 0

  for (const segment of segments) {
    const start = Number(segment?.start ?? segment?.startTimeSec ?? 0)
    const end = Number(segment?.end ?? segment?.endTimeSec ?? 0)
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue
    speakingTime += Math.max(0, end - start)
    if (end > maxEnd) maxEnd = end
  }

  return { speakingTime, maxEnd }
}

/**
 * @param {number} value
 * @returns {number}
 */
const round2 = (value) => Math.round(value * 100) / 100

/**
 * Compute speaking metrics from a transcription (domain model or toJSON DTO).
 *
 * @param {object} transcription
 * @param {object} [transcription.evaluator]
 * @param {object} [transcription.moderator]
 * @returns {{
 *   sessionDuration: number,
 *   wordsSpoken: number,
 *   speakingTime: number,
 *   speechRate: number,
 * }}
 */
export const computeTranscriptMetrics = (transcription) => {
  const evaluator = transcription?.evaluator ?? null
  const moderator = transcription?.moderator ?? null

  const wordsSpoken = wordsFromSide(evaluator) + wordsFromSide(moderator)

  const evaluatorTiming = timingFromSide(evaluator)
  const moderatorTiming = timingFromSide(moderator)
  const speakingTime = round2(
    evaluatorTiming.speakingTime + moderatorTiming.speakingTime,
  )
  const sessionDurationFromAudio = Math.max(
    evaluatorTiming.maxEnd,
    moderatorTiming.maxEnd,
    0,
  )
  const sessionDuration = round2(
    sessionDurationFromAudio > 0 ? sessionDurationFromAudio : 0,
  )

  const speechRate =
    speakingTime > 0 ? Math.round(wordsSpoken / (speakingTime / 60)) : 0

  return {
    sessionDuration,
    wordsSpoken,
    speakingTime,
    speechRate,
  }
}
