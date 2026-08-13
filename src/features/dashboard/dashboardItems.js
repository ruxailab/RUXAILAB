/**
 * Dashboard Navigation Items
 * Items de navegación para el dashboard principal
 */

export const dashboardNavigationItems = [
  {
    id: 'dashboard',
    title: 'navigation.dashboard',
    icon: 'mdi-view-dashboard',
  },
  { id: 'studies', title: 'navigation.studies', icon: 'mdi-flask' },
  { id: 'sessions', title: 'navigation.sessions', icon: 'mdi-calendar-clock' },
  {
    id: 'templates',
    title: 'navigation.templates',
    icon: 'mdi-clipboard-text',
  },
  { id: 'storage', title: 'navigation.storage', icon: 'mdi-database' },
  { id: 'agents', title: 'navigation.agents', icon: 'mdi-robot-outline' },
  { id: 'notifications', title: 'common.notifications', icon: 'mdi-bell' },
  { id: 'profile', title: 'profile.title', icon: 'mdi-account-circle' },
  {
    id: 'community',
    title: 'navigation.community',
    icon: 'mdi-earth',
    children: [
      {
        id: 'community-studies',
        title: 'navigation.communityStudies',
        icon: 'mdi-flask-outline',
      },
      {
        id: 'community-templates',
        title: 'navigation.communityTemplates',
        icon: 'mdi-file-document',
      },
    ],
  },
]
