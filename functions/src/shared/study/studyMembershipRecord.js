import { admin } from '../../core/firebase/f.firebase.js'

/**
 * Study Membership records stored on a user document.
 *
 * A Study Membership is the association between a user and a study that an
 * accepted invitation creates (see CONTEXT.md). It carries one study role
 * and belongs to the user's study list (`myTests`), next to the studies the
 * user owns.
 *
 * `myAnswers` holds participation records: the studies a user takes part in
 * and answers. Older releases filed staff memberships there as well, so that
 * map is still read when an existing membership has to be changed or removed.
 */

export const STUDY_MEMBERSHIP_FIELD = 'myTests'
export const LEGACY_MEMBERSHIP_FIELD = 'myAnswers'

const deleteField = () => admin.firestore.FieldValue.delete()

/**
 * Build the Study Membership record of a user for one study.
 *
 * @param {object} params
 * @param {object} params.study - the study document
 * @param {string} params.studyId
 * @param {number} params.accessLevel - the study role of the membership
 * @param {number} [params.now]
 * @returns {object} the record stored under `myTests.{studyId}`
 */
export const buildStudyMembershipRecord = ({
  study,
  studyId,
  accessLevel,
  now = Date.now(),
}) => ({
  testDocId: studyId,
  testTitle: study?.testTitle || '',
  testType: study?.testType || 'UNKNOWN',
  subType: study?.subType || null,
  numberColaborators: study?.cooperators?.length || 0,
  accessLevel,
  creationDate: study?.creationDate || study?.createdAt || now,
  updateDate: now,
})

/**
 * Patch that stores a Study Membership on a user document.
 *
 * @param {string} studyId
 * @param {object} record
 * @returns {object}
 */
export const buildStudyMembershipPatch = (studyId, record) => ({
  [`${STUDY_MEMBERSHIP_FIELD}.${studyId}`]: record,
})

/**
 * Patch that updates the study role of an existing Study Membership.
 *
 * Only the maps that already hold the membership are written: patching a map
 * that does not know the study would create a half membership.
 *
 * @param {string} studyId
 * @param {number} role
 * @param {object} [options]
 * @param {boolean} [options.membership] - the user has the membership in `myTests`
 * @param {boolean} [options.legacy] - the user has the membership in `myAnswers`
 * @returns {object}
 */
export const buildStudyMembershipRolePatch = (
  studyId,
  role,
  { membership = false, legacy = false } = {},
) => {
  const patch = {}

  if (membership) {
    patch[`${STUDY_MEMBERSHIP_FIELD}.${studyId}.accessLevel`] = role
  }
  if (legacy) {
    patch[`${LEGACY_MEMBERSHIP_FIELD}.${studyId}.accessLevel`] = role
  }

  return patch
}

/**
 * Patch that removes a Study Membership from a user document.
 *
 * @param {string} studyId
 * @param {object} [options]
 * @param {boolean} [options.legacy] - the user still holds the membership in `myAnswers`
 * @returns {object}
 */
export const buildStudyMembershipRemovalPatch = (
  studyId,
  { legacy = false } = {},
) => {
  const patch = {
    [`${STUDY_MEMBERSHIP_FIELD}.${studyId}`]: deleteField(),
  }

  if (legacy) {
    patch[`${LEGACY_MEMBERSHIP_FIELD}.${studyId}`] = deleteField()
  }

  return patch
}
