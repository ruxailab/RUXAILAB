import { ICONS, createCardConfig } from '@/shared/constants/theme'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
  normalizeStudyType,
} from '@/shared/constants/methodDefinitions'
import {
  STUDY_CAPABILITY,
  STUDY_ROLE,
  canJoinModeratedUserSession,
  getStudyFallbackPath,
  hasStudyCapability,
  resolveStudyAccess,
} from '@/shared/utils/studyAccessPolicy'

const C = STUDY_CAPABILITY

export function getStudyRouteBase(study) {
  const studyType = normalizeStudyType(study?.testType)

  if (studyType === STUDY_TYPES.HEURISTIC) return 'heuristic'
  if (
    studyType === STUDY_TYPES.USER &&
    study?.subType === USER_STUDY_SUBTYPES.MODERATED
  ) {
    return 'userTest/moderated'
  }
  if (studyType === STUDY_TYPES.USER) return 'userTest/unmoderated'

  return ''
}

export function getTestViewAccessRedirect({ study, user, token }) {
  if (!study) return '/admin'

  const studyType = normalizeStudyType(study?.testType)
  const routeBase = getStudyRouteBase(study)
  const isModeratedUserStudy =
    studyType === STUDY_TYPES.USER &&
    study?.subType === USER_STUDY_SUBTYPES.MODERATED

  if (isModeratedUserStudy && !token && !study?.isPublic) {
    return getStudyFallbackPath(study, user, routeBase)
  }

  if (isModeratedUserStudy && token) {
    if (!canJoinModeratedUserSession(study, user, token)) {
      return getStudyFallbackPath(study, user, routeBase)
    }
    return null
  }

  if (!study?.isPublic && !hasStudyCapability(study, user, C.STUDY_ANSWER)) {
    return getStudyFallbackPath(study, user, routeBase)
  }

  return null
}

export function getCommunityStudyDestination({ study, user }) {
  if (!study) return null
  const studyId = study.testDocId || study.id

  if (user && hasStudyCapability(study, user, C.DASHBOARD_VIEW)) {
    if (study.testType === STUDY_TYPES.HEURISTIC) {
      return { name: 'HeuristicManagerView', params: { id: studyId } }
    }
    if (
      study.testType === STUDY_TYPES.USER &&
      study.subType === USER_STUDY_SUBTYPES.UNMODERATED
    ) {
      return { name: 'UserUnmoderatedManagerView', params: { id: studyId } }
    }
    if (
      study.testType === STUDY_TYPES.USER &&
      study.subType === USER_STUDY_SUBTYPES.MODERATED
    ) {
      return { name: 'UserModeratedManagerView', params: { id: studyId } }
    }
  }

  if (study.isPublic || hasStudyCapability(study, user, C.STUDY_ANSWER)) {
    return { name: 'TestView', params: { id: studyId } }
  }

  return null
}

export function getAcceptedInvitationDestination({ study, user }) {
  const access = resolveStudyAccess(study, user)
  const studyType = normalizeStudyType(study?.testType)
  const answersByRole =
    studyType === STUDY_TYPES.USER && access.role === STUDY_ROLE.USER

  if (answersByRole) {
    const userId = user?.id || user?.uid
    return {
      name: 'TestView',
      params: {
        id: study.testDocId || study.id,
        ...(userId ? { token: userId } : {}),
      },
    }
  }

  const destination = getCommunityStudyDestination({ study, user })
  if (!destination || destination.name !== 'TestView') return destination

  const userId = user?.id || user?.uid
  return {
    ...destination,
    params: {
      ...destination.params,
      ...(userId ? { token: userId } : {}),
    },
  }
}

const NAVIGATION_ITEMS = Object.freeze([
  {
    title: 'Dashboard',
    icon: ICONS.MANAGER,
    capability: C.DASHBOARD_VIEW,
    path: ({ type, id }) => `/${type}/manager/${id}`,
  },
  {
    title: 'Test',
    icon: ICONS.DOCUMENT_EDIT,
    capability: C.STUDY_EDIT,
    path: ({ type, id }) => `/${type}/edit/${id}`,
  },
  {
    title: 'Preview',
    icon: ICONS.PREVIEW,
    capability: C.STUDY_ANSWER,
    path: ({ id, previewPath }) => previewPath ?? `/testview/${id}`,
  },
  {
    title: 'Progress',
    icon: ICONS.BOOK,
    capability: C.REPORTS_VIEW,
    path: ({ type, id }) => `/${type}/report/${id}`,
  },
  {
    title: 'Analytics',
    icon: ICONS.ORDER,
    capability: C.ANSWERS_VIEW,
    path: ({ type, id }) => `/${type}/answer/${id}`,
  },
  {
    title: 'Cooperators',
    icon: ICONS.ACCOUNT_GROUP,
    capability: C.COOPERATORS_VIEW,
    path: ({ type, id }) => `/${type}/cooperators/${id}`,
  },
  {
    title: 'Settings',
    icon: ICONS.COG,
    capability: C.SETTINGS_MANAGE,
    path: ({ type, id }) => `/${type}/settings/${id}`,
  },
  {
    title: 'Storage',
    icon: 'mdi-database',
    capability: C.STORAGE_ACCESS,
    path: ({ type, id }) => `/${type}/storage/${id}`,
  },
  {
    title: 'Final Report',
    icon: 'mdi-file-document',
    capability: C.FINAL_REPORT_MANAGE,
    path: ({ id }) => `/heuristic/finalreport/${id}`,
  },
  {
    title: 'Evaluator Info',
    icon: 'mdi-book-information-variant',
    capability: C.EVALUATOR_INFO_MANAGE,
    path: ({ id }) => `/heuristic/evaluatorinfo/${id}`,
  },
])

export function buildStudyNavigator({ study, user, type, previewPath }) {
  if (!study || !user || !type) return []
  if (!hasStudyCapability(study, user, C.DASHBOARD_VIEW)) return []

  const context = { type, id: study.id, previewPath }
  const items = NAVIGATION_ITEMS.filter((item) =>
    hasStudyCapability(study, user, item.capability),
  ).map(({ title, icon, path }) => ({
    title,
    icon,
    path: path(context),
  }))

  if (resolveStudyAccess(study, user).isOwner) {
    items.push({
      title: 'Audit Trail',
      icon: 'mdi-history',
      path: `/${type}/audit/${study.id}`,
    })
  }

  return items
}

export function buildStudyManagerCards({ study, user, type }) {
  if (!study || !user || !type) return { topCards: [], bottomCards: [] }

  const topCards = []
  if (hasStudyCapability(study, user, C.STUDY_EDIT)) {
    topCards.push({
      ...createCardConfig('EDIT'),
      title: 'test',
      bottom: '#000',
      description: 'edit',
      path: `/${type}/edit/${study.id}`,
    })
  }
  if (hasStudyCapability(study, user, C.COOPERATORS_VIEW)) {
    topCards.push({
      ...createCardConfig('CONFIG'),
      title: 'cooperators',
      bottom: '#000',
      description: 'cooperators',
      path: `/${type}/cooperators/${study.id}`,
    })
  }

  const bottomCards = []
  if (study.answersDocId) {
    if (hasStudyCapability(study, user, C.REPORTS_VIEW)) {
      bottomCards.push({
        ...createCardConfig('PREVIEW'),
        title: 'reports',
        bottom: '#000',
        description: 'reports',
        path: `/${type}/report/${study.id}`,
      })
    }
    if (hasStudyCapability(study, user, C.ANSWERS_VIEW)) {
      bottomCards.push({
        ...createCardConfig('ANSWERS'),
        title: 'answers',
        bottom: '#000',
        description: 'answers',
        path: `/${type}/answer/${study.id}`,
      })
    }
  }

  return { topCards, bottomCards }
}
