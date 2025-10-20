import { ACCESS_LEVEL } from "./accessLevel"
import { ICONS, createCardConfig, INTRO_IMAGES } from "../constants/theme"

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

// Accessibility-specific navigator
export const getAccessibilityNavigator = (test, userRole, route, type) => {
  if (!test) return [];

  const isManual = type === 'accessibility/manual';
  const isAutomatic = type === 'accessibility/automatic';
  const isAIAssisted = type === 'accessibility/aiassisted';
  const testId = route.params.id;

  const items = [
    {
      title: 'Manager',
      icon: ICONS.MANAGER,
      path: isManual ? `/accessibility/manual/${testId}` :
        isAIAssisted ? `/accessibility/aiassisted/manager/${testId}` :
          `/accessibility/automatic/manager/${testId}`,
      requiresAdmin: false
    }
  ];

  if (isManual) {
    items.push(
      {
        title: 'Edit Study',
        icon: ICONS.DOCUMENT_EDIT,
        path: `/accessibility/manual/config/${testId}`,
        requiresAdmin: true
      },
      {
        title: 'Settings',
        icon: ICONS.COG,
        path: `/accessibility/manual/setting/${testId}`,
        requiresAdmin: true
      },
      {
        title: 'Preview',
        icon: ICONS.PREVIEW,
        path: `/accessibility/manual/preview/${testId}`,
        requiresAdmin: false
      },
      {
        title: 'Answers',
        icon: ICONS.ORDER,
        path: `/accessibility/manual/result/${testId}`,
        requiresAdmin: true
      },
      {
        title: 'Cooperator',
        icon: ICONS.ACCOUNT_GROUP,
        path: `/accessibility/manual/cooperative/${testId}`,
        requiresAdmin: true
      }
    );
  }

  if (isAutomatic) {
    items.push(
      {
        title: 'Analyse',
        icon: 'mdi-magnify',
        path: `/accessibility/automatic/analyse/${testId}`,
        requiresAdmin: true
      },
      {
        title: 'Answers',
        icon: ICONS.ORDER,
        path: `/accessibility/automatic/answers/${testId}`,
        requiresAdmin: false // Allow evaluators to view answers
      },

      {
        title: 'Reports',
        icon: ICONS.BOOK,
        path: `/accessibility/automatic/reports/${testId}`,
        requiresAdmin: false // Reports can be viewed by cooperators
      },
      {
        title: 'Cooperators',
        icon: ICONS.ACCOUNT_GROUP,
        path: `/accessibility/automatic/cooperation/${testId}`,
        requiresAdmin: true
      },
      {
        title: 'Settings',
        icon: ICONS.COG,
        path: `/accessibility/automatic/settings/${testId}`,
        requiresAdmin: true
      }, {
      title: 'Final Report',
      icon: 'mdi-file-download',
      path: `/accessibility/automatic/finalreport/${testId}`,
      requiresAdmin: false // Allow evaluators to download reports
    }
    );
  }

  if (isAIAssisted) {
    items.push(
      {
        title: 'Examine',
        icon: 'mdi-eye-check',
        path: `/accessibility/aiassisted/examine/${testId}`,
        requiresAdmin: true
      },
      {
        title: 'Answers',
        icon: ICONS.ORDER,
        path: `/accessibility/aiassisted/answers/${testId}`,
        requiresAdmin: false // Allow evaluators to view answers
      },
      {
        title: 'Report',
        icon: ICONS.BOOK,
        path: `/accessibility/aiassisted/report/${testId}`,
        requiresAdmin: false // Reports can be viewed by cooperators
      },
      {
        title: 'Cooperators',
        icon: ICONS.ACCOUNT_GROUP,
        path: `/accessibility/aiassisted/cooperation/${testId}`,
        requiresAdmin: true
      },
      {
        title: 'Settings',
        icon: ICONS.COG,
        path: `/accessibility/aiassisted/settings/${testId}`,
        requiresAdmin: true
      }
    );
  }

  // Filter based on user role
  if (userRole === 'admin') {
    return items; // Admins get all items
  } else {
    return items.filter(item => !item.requiresAdmin); // Filter out admin-only items
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
  if (!test) return [];

  const testId = test.id;
  const isManual = type === 'accessibility/manual';
  const isAutomatic = type === 'accessibility/automatic';
  const isAIAssisted = type === 'accessibility/aiassisted';

  const cards = [
    {
      title: 'View Dashboard',
      description: 'Access detailed accessibility tools',
      image: INTRO_IMAGES.MANAGER,
      path: isManual ? `/accessibility/manual/${testId}` :
        isAIAssisted ? `/accessibility/aiassisted/manager/${testId}` :
          `/accessibility/automatic/manager/${testId}`,
    }
  ];

  if (userRole === 'admin') {
    if (isManual) {
      cards.push(
        {
          title: 'Configure Test',
          description: 'Set up accessibility test parameters',
          image: INTRO_IMAGES.EDIT,
          path: `/accessibility/manual/config/${testId}`,
        },
        {
          title: 'Manage Cooperators',
          description: 'Invite and manage test participants',
          image: INTRO_IMAGES.COOPS,
          path: `/accessibility/manual/cooperative/${testId}`,
        }
      );
    }

    if (isAutomatic) {
      cards.push(
        {
          title: 'Analyze Website',
          description: 'Run automated accessibility analysis',
          image: INTRO_IMAGES.ANALYTICS,
          path: `/accessibility/automatic/analyse/${testId}`,
        },
        {
          title: 'Manage Cooperators',
          description: 'Share reports with team members',
          image: INTRO_IMAGES.COOPS,
          path: `/accessibility/automatic/cooperation/${testId}`,
        }
      );
    }

    if (isAIAssisted) {
      cards.push(
        {
          title: 'AI Examination',
          description: 'Run AI-driven accessibility analysis',
          image: INTRO_IMAGES.ANALYTICS,
          path: `/accessibility/aiassisted/examine/${testId}`,
        },
        {
          title: 'Manage Cooperators',
          description: 'Share AI reports with team members',
          image: INTRO_IMAGES.COOPS,
          path: `/accessibility/aiassisted/cooperation/${testId}`,
        }
      );
    }
  }

  return cards;
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
  if (!test) return [];

  const testId = test.id;
  const isManual = type === 'accessibility/manual';
  const isAutomatic = type === 'accessibility/automatic';
  const isAIAssisted = type === 'accessibility/aiassisted';

  const cards = [];

  if (isManual) {
    cards.push({
      title: 'Preview Test',
      description: 'See how the test appears to participants',
      image: INTRO_IMAGES.MANAGER,
      path: `/accessibility/manual/preview/${testId}`,
    });

    if (userRole === 'admin') {
      cards.push({
        title: 'View Results',
        description: 'Analyze accessibility test answers',
        image: INTRO_IMAGES.ANSWER,
        path: `/accessibility/manual/result/${testId}`,
      });
    }
  }

  if (isAutomatic) {
    cards.push({
      title: 'View Report',
      description: 'See accessibility analysis results',
      image: INTRO_IMAGES.REPORTS,
      path: `/accessibility/automatic/reports/${testId}`,
    });

    cards.push({
      title: 'Download Reports',
      description: 'Export data as CSV or PDF',
      image: INTRO_IMAGES.ANALYTICS,
      path: `/accessibility/automatic/finalreport/${testId}`,
    });

    if (userRole === 'admin') {
      cards.push({
        title: 'Test Settings',
        description: 'Configure analysis parameters',
        image: INTRO_IMAGES.EDIT,
        path: `/accessibility/automatic/settings/${testId}`,
      });
    }
  }

  if (isAIAssisted) {
    cards.push({
      title: 'AI Report',
      description: 'View AI-generated accessibility insights',
      image: INTRO_IMAGES.REPORTS,
      path: `/accessibility/aiassisted/report/${testId}`,
    });

    cards.push({
      title: 'View Answers',
      description: 'See AI-analyzed findings and suggestions',
      image: INTRO_IMAGES.ANSWER,
      path: `/accessibility/aiassisted/answers/${testId}`,
    });

    if (userRole === 'admin') {
      cards.push({
        title: 'AI Settings',
        description: 'Configure AI analysis parameters',
        image: INTRO_IMAGES.EDIT,
        path: `/accessibility/aiassisted/settings/${testId}`,
      });
    }
  }

  return cards;
}
