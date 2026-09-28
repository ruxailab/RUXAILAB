/**
 * Request validator document for facialSentimentTask.
 */
export const facialSentimentTaskValidator = {
  answersDocId: { type: 'string', required: true },
  userDocId: { type: 'string', required: true },
  taskId: { type: ['string', 'number'], required: true },
  studyId: { type: 'string', required: false },
}
