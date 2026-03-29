/**
 * Utility functions for processing transcription data
 */

/**
 * Extract full transcript text (moderator + evaluator)
 * @param {Object} transcription
 * @returns {string}
 */
export function getAllTranscriptText(transcription) {
  if (!transcription) return ''

  const moderatorText = transcription.moderator?.transcript || ''
  const evaluatorText = transcription.evaluator?.transcript || ''

  return `${moderatorText} ${evaluatorText}`.trim()
}

/**
 * Extract all segments (moderator + evaluator)
 * @param {Object} transcription
 * @returns {Array}
 */
export function getAllSegments(transcription) {
  if (!transcription) return []

  const moderatorSegments = transcription.moderator?.segments || []
  const evaluatorSegments = transcription.evaluator?.segments || []

  return [...moderatorSegments, ...evaluatorSegments]
}

/**
 * Prepare segments for NLP / analysis
 * @param {Object} transcription
 * @returns {Array}
 */
export function prepareSegmentsForAnalysis(transcription) {
  const segments = getAllSegments(transcription)

  return segments.map((seg, idx) => ({
    id: idx,
    text: seg.text || '',
    start: seg.start,
    end: seg.end,
  }))
}
