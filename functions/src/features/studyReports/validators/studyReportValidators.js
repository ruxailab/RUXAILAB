const studyReportIdentity = {
  answersDocId: { type: 'string', required: true },
  userDocId: { type: 'string', required: true },
  studyId: { type: 'string', required: false },
  answerType: { type: 'string', required: false },
}

/**
 * Request validator document for removeStudyReport.
 */
export const removeStudyReportValidator = studyReportIdentity

/**
 * Request validator document for setStudyReportHidden.
 */
export const setStudyReportHiddenValidator = {
  ...studyReportIdentity,
  hidden: { type: 'boolean', required: true },
}
