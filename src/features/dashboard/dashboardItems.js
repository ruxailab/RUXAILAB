/**
 * Dashboard Navigation Items
 * Items de navegación para el dashboard principal
 */

export const dashboardNavigationItems = [
    { id: 'dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard' },
    { id: 'studies', title: 'Studies', icon: 'mdi-flask' },
    { id: 'sessions', title: 'Sessions', icon: 'mdi-calendar-clock' },
    { id: 'templates', title: 'Templates', icon: 'mdi-clipboard-text' },
    { id: 'storage', title: 'Storage', icon: 'mdi-database' },
    { id: 'notifications', title: 'Notifications', icon: 'mdi-bell' },
    { id: 'profile', title: 'Profile', icon: 'mdi-account-circle' },
    {
        id: 'community',
        title: 'Community',
        icon: 'mdi-earth',
        children: [
            { id: 'community-studies', title: 'Studies', icon: 'mdi-flask-outline' },
            { id: 'community-templates', title: 'Templates', icon: 'mdi-file-document' }
        ]
    }
];
