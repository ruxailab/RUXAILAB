/**
 * Request validator document for textSentimentTask.
 */
export const textSentimentTaskValidator = {
  answersDocId: { type: 'string', required: true },
  userDocId: { type: 'string', required: true },
  taskId: { type: ['string', 'number'], required: true },
  studyId: { type: 'string', required: false },
}
