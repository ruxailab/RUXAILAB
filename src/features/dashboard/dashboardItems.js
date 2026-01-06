/**
 * Dashboard Navigation Items
 * Items de navegación para el dashboard principal
 * 
 * Note: titleKey contains the i18n translation key that should be resolved
 * at runtime using $t() or t() function
 */

export const dashboardNavigationItems = [
    { id: 'dashboard', titleKey: 'adminDashboard.sidebar.dashboard', icon: 'mdi-view-dashboard' },
    { id: 'studies', titleKey: 'adminDashboard.sidebar.studies', icon: 'mdi-flask' },
    { id: 'sessions', titleKey: 'adminDashboard.sidebar.sessions', icon: 'mdi-calendar-clock' },
    { id: 'templates', titleKey: 'adminDashboard.sidebar.templates', icon: 'mdi-clipboard-text' },
    { id: 'notifications', titleKey: 'adminDashboard.sidebar.notifications', icon: 'mdi-bell' },
    { id: 'profile', titleKey: 'adminDashboard.sidebar.profile', icon: 'mdi-account-circle' },
    {
        id: 'community',
        titleKey: 'adminDashboard.sidebar.community',
        icon: 'mdi-earth',
        children: [
            { id: 'community-studies', titleKey: 'adminDashboard.sidebar.studies', icon: 'mdi-flask-outline' },
            { id: 'community-templates', titleKey: 'adminDashboard.sidebar.templates', icon: 'mdi-file-document' }
        ]
    }
];
