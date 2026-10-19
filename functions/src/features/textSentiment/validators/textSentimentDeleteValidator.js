/**
 * Request validator document for textSentimentDelete.
 */
export const textSentimentDeleteValidator = {
  sentimentDocId: { type: 'string', required: true },
  studyId: { type: 'string', required: false },
}
