/**
 * The study list of a signed-in user.
 *
 * `myTests` holds the Study Memberships of the user: the studies they own and
 * the studies they joined as staff. `myAnswers` holds the studies the user
 * takes part in and answers.
 *
 * A user can be a member and a participant of the same study, so both maps
 * are merged per study: the study is listed once and neither the membership
 * nor the participation record is dropped.
 *
 * @param {object} myTests - Study Memberships, keyed by study id
 * @param {object} myAnswers - participation records, keyed by study id
 * @returns {Array<object>} one entry per study
 */
export const buildUserStudyList = (myTests = {}, myAnswers = {}) => {
  const studies = {}

  Object.entries(myTests || {}).forEach(([studyId, study]) => {
    studies[studyId] = { ...study }
  })

  Object.entries(myAnswers || {}).forEach(([studyId, answer]) => {
    // The membership wins on shared fields, the participation record keeps
    // the answer fields it alone carries.
    studies[studyId] = { ...answer, ...studies[studyId] }
  })

  return Object.values(studies)
}
