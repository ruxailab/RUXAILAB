/**
 * Extract full transcript text (moderator + evaluator)
 */
export function getAllTranscriptText(transcription) {
  if (!transcription) return ''

  const moderatorText = transcription.moderator?.transcript || ''
  const evaluatorText = transcription.evaluator?.transcript || ''

  return `${moderatorText} ${evaluatorText}`.trim()
}

/**
 * Get all segments (moderator + evaluator)
 */
export function getAllSegments(transcription) {
  if (!transcription) return []

  const moderatorSegments = transcription.moderator?.segments || []
  const evaluatorSegments = transcription.evaluator?.segments || []

  return [...moderatorSegments, ...evaluatorSegments]
}

/**
 * Prepare segments for NLP processing
 */
export function prepareSegmentsForNLP(transcription) {
  const segments = getAllSegments(transcription)

  return segments.map((segment, index) => ({
    id: index,
    text: segment.text,
    start: segment.start,
    end: segment.end
  }))
}