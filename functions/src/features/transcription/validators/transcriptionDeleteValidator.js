/**
 * Request validator document for transcriptionDelete.
 */
export const transcriptionDeleteValidator = {
  transcriptionId: { type: 'string', required: true },
  studyId: { type: 'string', required: false },
}
