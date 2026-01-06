/**
 * Dashboard Navigation Items
 * Items de navegación para el dashboard principal
 * 
 * Note: titleKey contains the i18n translation key that should be resolved
 * at runtime using $t() or t() function
 */

export const dashboardNavigationItems = [
<<<<<<< HEAD
    { id: 'dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard' },
    { id: 'studies', title: 'Studies', icon: 'mdi-flask' },
    { id: 'sessions', title: 'Sessions', icon: 'mdi-calendar-clock' },
    { id: 'templates', title: 'Templates', icon: 'mdi-clipboard-text' },
    { id: 'storage', title: 'Storage', icon: 'mdi-database' },
    { id: 'notifications', title: 'Notifications', icon: 'mdi-bell' },
    { id: 'profile', title: 'Profile', icon: 'mdi-account-circle' },
=======
    { id: 'dashboard', titleKey: 'adminDashboard.sidebar.dashboard', icon: 'mdi-view-dashboard' },
    { id: 'studies', titleKey: 'adminDashboard.sidebar.studies', icon: 'mdi-flask' },
    { id: 'sessions', titleKey: 'adminDashboard.sidebar.sessions', icon: 'mdi-calendar-clock' },
    { id: 'templates', titleKey: 'adminDashboard.sidebar.templates', icon: 'mdi-clipboard-text' },
    { id: 'notifications', titleKey: 'adminDashboard.sidebar.notifications', icon: 'mdi-bell' },
    { id: 'profile', titleKey: 'adminDashboard.sidebar.profile', icon: 'mdi-account-circle' },
>>>>>>> bfa11afb6 (fix(i18n): ensure complete UI localization across all languages)
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
