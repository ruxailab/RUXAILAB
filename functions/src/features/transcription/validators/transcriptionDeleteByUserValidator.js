/**
 * Request validator document for transcriptionDeleteByUser.
 */
export const transcriptionDeleteByUserValidator = {
  answersDocId: { type: 'string', required: true },
  userDocId: { type: 'string', required: true },
  studyId: { type: 'string', required: false },
}
