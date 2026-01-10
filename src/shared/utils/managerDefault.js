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

  if (accessLevel === ACCESS_LEVEL.ADMIN) {
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
        requiresAdmin: false, // Reports can be viewed by cooperators
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

  const cards = [
    {
      title: 'View Dashboard',
      subtitle: 'Access detailed accessibility tools',
      icon: 'mdi-view-dashboard',
      path: isManual
        ? `/accessibility/manual/home/${testId}`
        : `/accessibility/automatic/home/${testId}`,
      color: 'info',
    },
  ]

  if (userRole === 'admin') {
    if (isManual) {
      cards.push(
        {
          title: 'Configure Test',
          subtitle: 'Set up accessibility test parameters',
          icon: 'mdi-cog',
          path: `/accessibility/manual/config/${testId}`,
          color: 'primary',
        },
        {
          title: 'Manage Cooperators',
          subtitle: 'Invite and manage test participants',
          icon: 'mdi-account-group',
          path: `/accessibility/manual/cooperative/${testId}`,
          color: 'success',
        },
      )
    }

    if (isAutomatic) {
      cards.push(
        {
          title: 'Analyze Website',
          subtitle: 'Run automated accessibility analysis',
          icon: 'mdi-magnify',
          path: `/accessibility/automatic/analyse/${testId}`,
          color: 'primary',
        },
        {
          title: 'Manage Cooperators',
          subtitle: 'Share reports with team members',
          icon: 'mdi-account-group',
          path: `/accessibility/automatic/cooperation/${testId}`,
          color: 'success',
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

  const cards = []

  if (isManual) {
    cards.push({
      title: 'Preview Test',
      subtitle: 'See how the test appears to participants',
      icon: 'mdi-clipboard-check',
      path: `/accessibility/manual/preview/${testId}`,
      color: 'info',
    })

    if (userRole === 'admin') {
      cards.push({
        title: 'View Results',
        subtitle: 'Analyze accessibility test answers',
        icon: 'mdi-chart-bar',
        path: `/accessibility/manual/result/${testId}`,
        color: 'warning',
      })
    }
  }

  if (isAutomatic) {
    cards.push({
      title: 'View Report',
      subtitle: 'See accessibility analysis results',
      icon: 'mdi-chart-bar',
      path: `/accessibility/automatic/reports/${testId}`,
      color: 'info',
    })

    if (userRole === 'admin') {
      cards.push({
        title: 'Test Settings',
        subtitle: 'Configure analysis parameters',
        icon: 'mdi-cog',
        path: `/accessibility/automatic/settings/${testId}`,
        color: 'warning',
      })
    }
  }

  return cards
}
