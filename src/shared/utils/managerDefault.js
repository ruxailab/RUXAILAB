import { ACCESS_LEVEL } from "./accessLevel"
import { ICONS, createCardConfig, CARD_THEMES } from "../constants/theme"

export const getNavigatorDefault = (test, accessLevel, route, type) => {
  if (!test) return [];

  const items = [
    { title: 'Manager', icon: ICONS.MANAGER, path: `/${type}/manager/${route.params.id}` }
  ]

  if (accessLevel === ACCESS_LEVEL.ADMIN) {
    items.push(
      { title: 'Test', icon: ICONS.DOCUMENT_EDIT, path: `/${type}/edit/${test.id}` },
      { title: 'Preview', icon: ICONS.PREVIEW, path: `/testview/${test.id}` },
      { title: 'Reports', icon: ICONS.BOOK, path: `/${type}/report/${test.id}` },
      { title: 'Answers', icon: ICONS.ORDER, path: `/${type}/answer/${test.id}` },
      { title: 'Cooperators', icon: ICONS.ACCOUNT_GROUP, path: `/${type}/cooperators/${test.id}` },
      { title: 'Settings', icon: ICONS.COG, path: `/${type}/settings/${test.id}` }
    )
  }

  if (accessLevel === ACCESS_LEVEL.GUEST) {
    items.push(
      { title: 'Answer Test', icon: ICONS.DOCUMENT, path: `/testview/${test.id}` },
      { title: 'Reports', icon: ICONS.BOOK, path: `/${type}/report/${test.id}` },
      { title: 'Answers', icon: ICONS.ORDER, path: `/${type}/answer/${test.id}` }
    )
  }

  return items
}

export const getTopCardsDefualt = (test, type) => {
  if (!test) return []
  return [
    {
      ...createCardConfig('EDIT'),
      title: 'test',
      bottom: '#000',
      description: 'edit',
      path: `/${type}/edit/${test.id}`,
    },
    {
      ...createCardConfig('CONFIG'),
      title: 'cooperators',
      bottom: '#000',
      description: 'cooperators',
      path: `/${type}/cooperators/${test.cooperators}`,
    },
  ]
}

export const getBottomCardsDefualt = (test, type) => {
  if (!test || !test.answersDocId) return []
  return [
    {
      ...createCardConfig('PREVIEW'),
      title: 'reports',
      bottom: '#000',
      description: 'reports',
      path: `/${type}/report/${test.answersDocId}`,
    },
    {
      ...createCardConfig('ANSWERS'),
      title: 'answers',
      bottom: '#000',
      description: 'answers',
      path: `/${type}/answer/${test.answersDocId}`,
    },
  ]
}
