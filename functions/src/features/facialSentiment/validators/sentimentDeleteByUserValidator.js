/**
 * Request validator document for sentimentDeleteByUser.
 */
export const sentimentDeleteByUserValidator = {
  answersDocId: { type: 'string', required: true },
  userDocId: { type: 'string', required: true },
  studyId: { type: 'string', required: false },
}
