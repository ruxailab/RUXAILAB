/**
 * Request validator document for workerTranscriptTask.
 */
export const workerTranscriptTaskValidator = {
  answersDocId: { type: 'string', required: true },
  userDocId: { type: 'string', required: true },
  taskId: { type: ['string', 'number'], required: true },
  provider: {
    type: 'string',
    required: true,
    enum: ['whisper', 'openai'],
  },
  model: { type: 'string', required: false },
  studyId: { type: 'string', required: false },
}
