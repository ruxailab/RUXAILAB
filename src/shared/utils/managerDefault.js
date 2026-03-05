import { ACCESS_LEVEL } from './accessLevel'
import { ICONS, createCardConfig } from '../constants/theme'

export const getNavigatorDefault = (test, accessLevel, route, type) => {
  if (!test) return []

  const items = [
    {
      title: 'Manager',
      icon: ICONS.MANAGER,
      path: `/${type}/manager/${route.params.id}`,
    },
  ]

  if (
    accessLevel === ACCESS_LEVEL.ADMIN ||
    accessLevel === ACCESS_LEVEL.SUPER_ADMIN
  ) {
    items.push(
      {
        title: 'Test',
        icon: ICONS.DOCUMENT_EDIT,
        path: `/${type}/edit/${test.id}`,
      },
      { title: 'Preview', icon: ICONS.PREVIEW, path: `/testview/${test.id}` },
      {
        title: 'Reports',
        icon: ICONS.BOOK,
        path: `/${type}/report/${test.id}`,
      },
      {
        title: 'Answers',
        icon: ICONS.ORDER,
        path: `/${type}/answer/${test.id}`,
      },
      {
        title: 'Cooperators',
        icon: ICONS.ACCOUNT_GROUP,
        path: `/${type}/cooperators/${test.id}`,
      },
      {
        title: 'Settings',
        icon: ICONS.COG,
        path: `/${type}/settings/${test.id}`,
      },
    )
  }

  if (accessLevel === ACCESS_LEVEL.EVALUATOR) {
    items.push(
      {
        title: 'Answer Test',
        icon: ICONS.DOCUMENT,
        path: `/testview/${test.id}`,
      },
      {
        title: 'Answers',
        icon: ICONS.ORDER,
        path: `/${type}/answer/${test.id}`,
      },
    )
  }

  return items
}

// Accessibility-specific navigator
export const getAccessibilityNavigator = (test, userRole, route, type) => {
  if (!test) return []

  const isManual = type === 'accessibility/manual'
  const isAutomatic = type === 'accessibility/automatic'
  const isAIAssisted = type === 'accessibility/aiassisted'
  const testId = route.params.id

  const items = [
    {
      title: 'Manager',
      icon: ICONS.MANAGER,
      path: `/${type}/${testId}`,
      requiresAdmin: false,
    },
  ]

  if (isManual) {
    items.push(
      {
        title: 'Edit Study',
        icon: ICONS.DOCUMENT_EDIT,
        path: `/accessibility/manual/config/${testId}`,
        requiresAdmin: true,
      },
      {
        title: 'Settings',
        icon: ICONS.COG,
        path: `/accessibility/manual/setting/${testId}`,
        requiresAdmin: true,
      },
      {
        title: 'Preview',
        icon: ICONS.PREVIEW,
        path: `/accessibility/manual/preview/${testId}`,
        requiresAdmin: false,
      },
      {
        title: 'Answers',
        icon: ICONS.ORDER,
        path: `/accessibility/manual/result/${testId}`,
        requiresAdmin: true,
      },
      {
        title: 'Cooperator',
        icon: ICONS.ACCOUNT_GROUP,
        path: `/accessibility/manual/cooperative/${testId}`,
        requiresAdmin: true,
      },
    )
  }

  if (isAutomatic) {
    items.push(
      {
        title: 'Analyse',
        icon: 'mdi-magnify',
        path: `/accessibility/automatic/analyse/${testId}`,
        requiresAdmin: true,
      },
      {
        title: 'Answers',
        icon: ICONS.ORDER,
        path: `/accessibility/automatic/answers/${testId}`,
        requiresAdmin: true,
      },
      {
        title: 'Report',
        icon: ICONS.BOOK,
        path: `/accessibility/automatic/reports/${testId}`,
        requiresAdmin: false,
      },
      {
        title: 'Cooperation',
        icon: ICONS.ACCOUNT_GROUP,
        path: `/accessibility/automatic/cooperation/${testId}`,
        requiresAdmin: true,
      },
      {
        title: 'Settings',
        icon: ICONS.COG,
        path: `/accessibility/automatic/settings/${testId}`,
        requiresAdmin: true,
      },
    )
  }

  if (isAIAssisted) {
    items.push(
      {
        title: 'Examine',
        icon: 'mdi-brain',
        path: `/accessibility/aiassisted/examine/${testId}`,
        requiresAdmin: false,
      },
      {
        title: 'Answers',
        icon: ICONS.ORDER,
        path: `/accessibility/aiassisted/answers/${testId}`,
        requiresAdmin: true,
      },
      {
        title: 'Report',
        icon: ICONS.BOOK,
        path: `/accessibility/aiassisted/report/${testId}`,
        requiresAdmin: false,
      },
      {
        title: 'Cooperation',
        icon: ICONS.ACCOUNT_GROUP,
        path: `/accessibility/aiassisted/cooperation/${testId}`,
        requiresAdmin: true,
      },
      {
        title: 'Settings',
        icon: ICONS.COG,
        path: `/accessibility/aiassisted/settings/${testId}`,
        requiresAdmin: true,
      },
    )
  }

  // Filter based on user role
  if (userRole === 'admin') {
    return items // Admins get all items
  } else {
    return items.filter((item) => !item.requiresAdmin) // Filter out admin-only items
  }
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

// Accessibility-specific top cards
export const getAccessibilityTopCards = (test, userRole, type) => {
  if (!test) return []

  const testId = test.id
  const isManual = type === 'accessibility/manual'
  const isAutomatic = type === 'accessibility/automatic'
  const isAIAssisted = type === 'accessibility/aiassisted'

  const cards = []

  if (userRole === 'admin') {
    if (isManual) {
      cards.push(
        {
          ...createCardConfig('EDIT'),
          titleDirect: 'Configure Test',
          description: 'edit',
          path: `/accessibility/manual/config/${testId}`,
        },
        {
          ...createCardConfig('CONFIG'),
          titleDirect: 'Manage Cooperators',
          description: 'cooperators',
          path: `/accessibility/manual/cooperative/${testId}`,
        },
      )
    }

    if (isAutomatic) {
      cards.push(
        {
          ...createCardConfig('EDIT'),
          titleDirect: 'Analyze Website',
          description: 'edit',
          path: `/accessibility/automatic/analyse/${testId}`,
        },
        {
          ...createCardConfig('CONFIG'),
          titleDirect: 'Manage Cooperators',
          description: 'cooperators',
          path: `/accessibility/automatic/cooperation/${testId}`,
        },
      )
    }

    if (isAIAssisted) {
      cards.push(
        {
          ...createCardConfig('EDIT'),
          titleDirect: 'Examine Website',
          description: 'edit',
          path: `/accessibility/aiassisted/examine/${testId}`,
        },
        {
          ...createCardConfig('CONFIG'),
          titleDirect: 'Manage Cooperators',
          description: 'cooperators',
          path: `/accessibility/aiassisted/cooperation/${testId}`,
        },
      )
    }
  }

  return cards
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

// Accessibility-specific bottom cards
export const getAccessibilityBottomCards = (test, userRole, type) => {
  if (!test) return []

  const testId = test.id
  const isManual = type === 'accessibility/manual'
  const isAutomatic = type === 'accessibility/automatic'
  const isAIAssisted = type === 'accessibility/aiassisted'

  const cards = []

  if (isManual) {
    cards.push({
      ...createCardConfig('PREVIEW'),
      titleDirect: 'Preview Test',
      description: 'reports',
      path: `/accessibility/manual/preview/${testId}`,
    })

    if (userRole === 'admin') {
      cards.push({
        ...createCardConfig('ANSWERS'),
        titleDirect: 'View Results',
        description: 'answers',
        path: `/accessibility/manual/result/${testId}`,
      })
    }
  }

  if (isAutomatic) {
    cards.push({
      ...createCardConfig('PREVIEW'),
      titleDirect: 'View Report',
      description: 'reports',
      path: `/accessibility/automatic/reports/${testId}`,
    })

    if (userRole === 'admin') {
      cards.push({
        ...createCardConfig('ANSWERS'),
        titleDirect: 'Test Settings',
        description: 'answers',
        path: `/accessibility/automatic/settings/${testId}`,
      })
    }
  }

  if (isAIAssisted) {
    cards.push({
      ...createCardConfig('PREVIEW'),
      titleDirect: 'View Report',
      description: 'reports',
      path: `/accessibility/aiassisted/report/${testId}`,
    })

    if (userRole === 'admin') {
      cards.push({
        ...createCardConfig('ANSWERS'),
        titleDirect: 'View Answers',
        description: 'answers',
        path: `/accessibility/aiassisted/answers/${testId}`,
      })
    }
  }

  return cards
}
