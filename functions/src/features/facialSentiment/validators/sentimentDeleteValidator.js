/**
 * Request validator document for sentimentDelete.
 */
export const sentimentDeleteValidator = {
  sentimentDocId: { type: 'string', required: true },
  side: { type: 'string', required: true, enum: ['facial', 'text'] },
  studyId: { type: 'string', required: false },
}
