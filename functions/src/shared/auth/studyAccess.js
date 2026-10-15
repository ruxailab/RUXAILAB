import { fail } from '../../core/errors.js'

/**
 * Study cooperator / studyRoleMap access levels used across the platform.
 */
export const ROLE = Object.freeze({
  ADMIN: 0,
  EVALUATOR: 1,
  GUEST: 2,
  OBSERVATOR: 3,
  MANAGER: 4,
  USER: 5,
})

export const SUPPORTED_ROLES = Object.freeze({
  USER: [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER, ROLE.OBSERVATOR],
  HEURISTIC: [ROLE.ADMIN, ROLE.MANAGER, ROLE.EVALUATOR, ROLE.GUEST],
  CARD_SORTING: [ROLE.ADMIN, ROLE.MANAGER, ROLE.EVALUATOR, ROLE.GUEST],
  FOCUS_GROUP: [ROLE.ADMIN, ROLE.EVALUATOR, ROLE.OBSERVATOR],
})

export const MANAGER_ROLES = Object.freeze({
  USER: [ROLE.USER, ROLE.OBSERVATOR],
  HEURISTIC: [ROLE.EVALUATOR, ROLE.GUEST],
  CARD_SORTING: [ROLE.EVALUATOR, ROLE.GUEST],
  FOCUS_GROUP: [ROLE.EVALUATOR, ROLE.OBSERVATOR],
})

export const normalizeStudyType = (type) => {
  const normalized = String(type || '').toUpperCase()
  return normalized === 'HEURISTICS' ? 'HEURISTIC' : normalized
}

export const getAssignableRoles = (study, actorRole) => {
  const studyType = normalizeStudyType(study?.testType)
  if (actorRole === ROLE.ADMIN) return SUPPORTED_ROLES[studyType] || []
  if (actorRole === ROLE.MANAGER) return MANAGER_ROLES[studyType] || []
  return []
}

/**
 * Resolve the effective study role for a user.
 * Super-admins and study owners are treated as ADMIN.
 *
 * @param {object|null|undefined} study
 * @param {string} uid
 * @param {boolean} [isSuperAdmin=false]
 * @returns {number|null}
 */
export function resolveStudyRole(study, uid, isSuperAdmin = false) {
  if (!study || !uid) return null
  if (isSuperAdmin || study?.testAdmin?.userDocId === uid) return ROLE.ADMIN

  const mappedRole = study?.studyRoleMap?.[uid]
  if (mappedRole != null) return mappedRole

  const membership = study?.cooperators?.find(
    (cooperator) =>
      cooperator?.userDocId === uid &&
      (cooperator?.accepted === true || cooperator?.status === 'accepted'),
  )

  return membership?.accessLevel ?? null
}

/**
 * @param {object|null|undefined} study
 * @param {string} uid
 * @param {boolean} isSuperAdmin
 * @param {number[]} allowedRoles
 * @returns {boolean}
 */
export function hasStudyRole(study, uid, isSuperAdmin, allowedRoles) {
  const role = resolveStudyRole(study, uid, isSuperAdmin)
  return role != null && allowedRoles.includes(role)
}

/**
 * @param {object|null|undefined} study
 * @param {string} uid
 * @param {boolean} isSuperAdmin
 * @param {object} options
 * @param {number[]} options.allowedRoles
 * @param {string} [options.message]
 * @returns {true}
 */
export function assertStudyAccess(
  study,
  uid,
  isSuperAdmin,
  { allowedRoles, message = 'Access denied' },
) {
  if (!study) fail('not-found', 'Study not found')

  if (!hasStudyRole(study, uid, isSuperAdmin, allowedRoles)) {
    fail('permission-denied', message)
  }

  return true
}
