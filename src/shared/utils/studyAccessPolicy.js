import {
  STUDY_TYPES,
  normalizeStudyType,
} from '@/shared/constants/methodDefinitions'

export const STUDY_ROLE = Object.freeze({
  ADMIN: 0,
  EVALUATOR: 1,
  GUEST: 2,
  OBSERVATOR: 3,
  MANAGER: 4,
  USER: 5,
})

export const STUDY_CAPABILITY = Object.freeze({
  DASHBOARD_VIEW: 'dashboard.view',
  STUDY_EDIT: 'study.edit',
  STUDY_ANSWER: 'study.answer',
  REPORTS_VIEW: 'reports.view',
  REPORTS_DELETE: 'reports.delete',
  ANSWERS_VIEW: 'answers.view',
  ANSWERS_EXPORT_SUMMARY: 'answers.exportSummary',
  COOPERATORS_VIEW: 'cooperators.view',
  COOPERATORS_INVITE: 'cooperators.invite',
  COOPERATORS_CANCEL_INVITATION: 'cooperators.cancelInvitation',
  COOPERATORS_ASSIGN_ROLE: 'cooperators.assignRole',
  COOPERATORS_REMOVE: 'cooperators.remove',
  SETTINGS_MANAGE: 'settings.manage',
  STUDY_DELETE: 'study.delete',
  STORAGE_ACCESS: 'storage.access',
  FINAL_REPORT_MANAGE: 'finalReport.manage',
  EVALUATOR_INFO_MANAGE: 'evaluatorInfo.manage',
})

const C = STUDY_CAPABILITY
const R = STUDY_ROLE

export const STUDY_ROLE_LABEL = Object.freeze({
  [R.ADMIN]: 'Admin',
  [R.EVALUATOR]: 'Evaluator',
  [R.GUEST]: 'Guest',
  [R.OBSERVATOR]: 'Observator',
  [R.MANAGER]: 'Manager',
  [R.USER]: 'User',
})

const USER_ROLES = Object.freeze([R.ADMIN, R.MANAGER, R.USER, R.OBSERVATOR])
const HEURISTIC_ROLES = Object.freeze([
  R.ADMIN,
  R.MANAGER,
  R.EVALUATOR,
  R.GUEST,
])

const USER_POLICY = Object.freeze({
  [R.ADMIN]: Object.freeze(Object.values(C).filter(
    (capability) =>
      capability !== C.FINAL_REPORT_MANAGE &&
      capability !== C.EVALUATOR_INFO_MANAGE,
  )),
  [R.MANAGER]: Object.freeze([
    C.DASHBOARD_VIEW,
    C.STUDY_EDIT,
    C.STUDY_ANSWER,
    C.ANSWERS_VIEW,
    C.ANSWERS_EXPORT_SUMMARY,
    C.COOPERATORS_VIEW,
    C.COOPERATORS_INVITE,
    C.COOPERATORS_CANCEL_INVITATION,
    C.COOPERATORS_ASSIGN_ROLE,
    C.COOPERATORS_REMOVE,
  ]),
  [R.USER]: Object.freeze([C.STUDY_ANSWER]),
  [R.OBSERVATOR]: Object.freeze([C.DASHBOARD_VIEW, C.ANSWERS_VIEW]),
})

const HEURISTIC_POLICY = Object.freeze({
  [R.ADMIN]: Object.freeze(Object.values(C).filter(
    (capability) => capability !== C.ANSWERS_EXPORT_SUMMARY,
  )),
  [R.MANAGER]: Object.freeze([
    C.DASHBOARD_VIEW,
    C.STUDY_EDIT,
    C.STUDY_ANSWER,
    C.ANSWERS_VIEW,
    C.COOPERATORS_VIEW,
    C.COOPERATORS_INVITE,
    C.COOPERATORS_CANCEL_INVITATION,
    C.COOPERATORS_ASSIGN_ROLE,
    C.COOPERATORS_REMOVE,
    C.FINAL_REPORT_MANAGE,
    C.EVALUATOR_INFO_MANAGE,
  ]),
  [R.EVALUATOR]: Object.freeze([
    C.DASHBOARD_VIEW,
    C.STUDY_ANSWER,
    C.ANSWERS_VIEW,
  ]),
  [R.GUEST]: Object.freeze([C.DASHBOARD_VIEW, C.ANSWERS_VIEW]),
})

const STUDY_POLICIES = Object.freeze({
  [STUDY_TYPES.USER]: USER_POLICY,
  [STUDY_TYPES.HEURISTIC]: HEURISTIC_POLICY,
})

const SUPPORTED_ROLES = Object.freeze({
  [STUDY_TYPES.USER]: USER_ROLES,
  [STUDY_TYPES.HEURISTIC]: HEURISTIC_ROLES,
})

const MANAGER_ASSIGNABLE_ROLES = Object.freeze({
  [STUDY_TYPES.USER]: Object.freeze([R.USER, R.OBSERVATOR]),
  [STUDY_TYPES.HEURISTIC]: Object.freeze([R.EVALUATOR, R.GUEST]),
})

const getUserId = (user) => user?.id ?? user?.uid ?? null

const isStudyOwner = (study, userId) =>
  Boolean(userId && study?.testAdmin?.userDocId === userId)

const findAcceptedMembership = (study, userId) =>
  study?.cooperators?.find(
    (cooperator) =>
      cooperator?.userDocId === userId && cooperator?.accepted === true,
  ) ?? null

export function resolveStudyAccess(study, user) {
  const userId = getUserId(user)
  const isOwner = isStudyOwner(study, userId)
  const isSuperAdmin = user?.accessLevel === 0
  const membership = findAcceptedMembership(study, userId)

  let role = null
  if (isOwner || isSuperAdmin) role = R.ADMIN
  else if (membership) role = membership.accessLevel ?? null

  return {
    role,
    isOwner,
    isSuperAdmin,
    isAcceptedMember: Boolean(membership),
    isPublicParticipant: Boolean(userId && study?.isPublic),
    membership,
  }
}

export function hasStudyCapability(study, user, capability) {
  const access = resolveStudyAccess(study, user)

  if (
    access.isPublicParticipant &&
    capability === STUDY_CAPABILITY.STUDY_ANSWER
  ) {
    return true
  }

  const studyType = normalizeStudyType(study?.testType)
  const roleCapabilities = STUDY_POLICIES[studyType]?.[access.role] ?? []
  return roleCapabilities.includes(capability)
}

export function getSupportedRoles(study) {
  const studyType = normalizeStudyType(study?.testType ?? study)
  return [...(SUPPORTED_ROLES[studyType] ?? [])]
}

export function getAssignableRoles(study, user) {
  const { role } = resolveStudyAccess(study, user)
  const studyType = normalizeStudyType(study?.testType)

  if (role === R.ADMIN) return getSupportedRoles(study)
  if (role === R.MANAGER) {
    return [...(MANAGER_ASSIGNABLE_ROLES[studyType] ?? [])]
  }
  return []
}

const toRoleOptions = (roles) =>
  roles.map((value) => ({ title: STUDY_ROLE_LABEL[value], value }))

export function getSupportedRoleOptions(study) {
  return toRoleOptions(getSupportedRoles(study))
}

export function getAssignableRoleOptions(study, user) {
  return toRoleOptions(getAssignableRoles(study, user))
}

export function canManageCooperator(
  study,
  user,
  target,
  { action, role: assignedRole } = {},
) {
  const access = resolveStudyAccess(study, user)
  const userId = getUserId(user)
  const targetUserId = target?.userDocId ?? null

  if (targetUserId && isStudyOwner(study, targetUserId)) return false
  if (targetUserId && targetUserId === userId) return false

  const assignableRoles = getAssignableRoles(study, user)

  if (action === 'invite') return assignableRoles.includes(assignedRole)
  if (access.role !== R.ADMIN && access.role !== R.MANAGER) return false

  if (action === 'assignRole') {
    if (!assignableRoles.includes(assignedRole)) return false
    return (
      access.role === R.ADMIN ||
      MANAGER_ASSIGNABLE_ROLES[normalizeStudyType(study?.testType)]?.includes(
        target?.accessLevel,
      ) === true
    )
  }

  if (action === 'remove' || action === 'cancelInvitation') {
    if (access.role === R.ADMIN) return true
    return (
      MANAGER_ASSIGNABLE_ROLES[normalizeStudyType(study?.testType)]?.includes(
        target?.accessLevel,
      ) === true
    )
  }

  return false
}

export function getStudyFallbackPath(study, user, studyRouteBase = '') {
  if (
    studyRouteBase &&
    hasStudyCapability(study, user, STUDY_CAPABILITY.DASHBOARD_VIEW)
  ) {
    return `/${studyRouteBase}/manager/${study.id}`
  }

  if (hasStudyCapability(study, user, STUDY_CAPABILITY.STUDY_ANSWER)) {
    const userId = getUserId(user)
    return `/testview/${study.id}${userId ? `/${userId}` : ''}`
  }

  return '/admin'
}

export function canJoinModeratedUserSession(study, user, targetUserId) {
  const userId = getUserId(user)
  if (!study || !userId || !targetUserId) return false

  if (targetUserId === userId) {
    return hasStudyCapability(study, user, C.STUDY_ANSWER)
  }

  return hasStudyCapability(study, user, C.ANSWERS_VIEW)
}

export function isModeratedSessionViewer(study, user, targetUserId) {
  const userId = getUserId(user)
  return Boolean(
    study &&
    userId &&
    targetUserId &&
    targetUserId !== userId &&
    hasStudyCapability(study, user, C.ANSWERS_VIEW),
  )
}
