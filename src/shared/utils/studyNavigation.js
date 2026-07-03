import { ICONS, createCardConfig } from '@/shared/constants/theme'
import {
  STUDY_CAPABILITY,
  hasStudyCapability,
} from '@/shared/utils/studyAccessPolicy'

const C = STUDY_CAPABILITY

const NAVIGATION_ITEMS = Object.freeze([
  {
    title: 'Manager',
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
    title: 'Reports',
    icon: ICONS.BOOK,
    capability: C.REPORTS_VIEW,
    path: ({ type, id }) => `/${type}/report/${id}`,
  },
  {
    title: 'Answers',
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
  return NAVIGATION_ITEMS.filter((item) =>
    hasStudyCapability(study, user, item.capability),
  ).map(({ title, icon, path }) => ({
    title,
    icon,
    path: path(context),
  }))
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
