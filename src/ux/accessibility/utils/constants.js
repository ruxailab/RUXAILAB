/**
 * Navigation items for accessibility dashboard
 * @param {string} testId - The test ID parameter
 * @returns {Array} Array of navigation items
 */
export const getAccessibilityNavItems = (testId) => [
    {
        title: 'Home',
        icon: 'mdi-home-variant',
        path: `/accessibility/automatic/${testId}`,
    },
    {
        title: 'Analyse',
        icon: 'mdi-chart-line-variant',
        path: `/analyse/${testId}`,
    },
    {
        title: 'Answers',
        icon: 'mdi-comment-question-outline',
        path: `/answers/${testId}`,
    },
    {
        title: 'Report',
        icon: 'mdi-file-chart-outline',
        path: `/reports/${testId}`,
    },
    {
        title: 'Settings',
        icon: 'mdi-cog-outline',
        path: `/settings/${testId}`,
    },
]

/**
 * Map titles to manager-style images
 */
export const imageMap = {
    home: 'IntroAnalytics.svg',
    analyse: 'IntroAnalytics.svg',
    answers: 'IntroAnswer.svg',
    report: 'IntroReports.svg',
    settings: 'IntroCoops.svg',
}

/**
 * Get description for navigation items
 * @param {string} title - The title of the navigation item
 * @returns {string} Description for the item
 */
export const getDescription = (title) => {
    const descriptions = {
        Home: 'Main dashboard overview and statistics',
        Analyse: 'Run comprehensive accessibility analysis',
        Answers: 'Manage Q&A responses and feedback',
        Report: 'Generate detailed reports and insights',
        Settings: 'Configure preferences and options',
    }
    return descriptions[title] || 'Navigate to this section'
}

/**
 * Manual accessibility card data
 * @param {Function} t - Translation function
 * @param {string} testId - The test ID parameter
 * @returns {Array} Array of card data for manual accessibility
 */
export const getManualAccessibilityCards = (t, testId) => [
    {
        title: t('titles.manager'),
        icon: 'mdi-home-variant',
        subtitle: t('descriptions.edit'),
        description: t('descriptions.edit'),
        route: '',
        image: 'IntroEdit.svg',
        imageStyle: '',
        cardStyle: 'background-image: radial-gradient(circle at top right, #6366f1, #8b5cf6); overflow: hidden'
    },
    {
        title: t('titles.test'),
        icon: 'mdi-cog-outline',
        subtitle: t('accessibility.cards.config.subtitle'),
        description: t('accessibility.cards.config.description'),
        route: `/config/${testId}`,
        image: 'IntroCoops.svg',
        imageStyle: '',
        cardStyle: 'background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden'
    },
    {
        title: t('titles.test'),
        icon: 'mdi-pencil-outline',
        subtitle: t('descriptions.edit'),
        description: t('accessibility.cards.edit.description'),
        route: `/edit/${testId}`,
        image: 'IntroEdit.svg',
        imageStyle: 'transform: rotateY(180deg);',
        cardStyle: 'background-image: radial-gradient(circle at top right, #d128c9, #9a1aab); overflow: hidden'
    },
    {
        title: t('titles.preview'),
        icon: 'mdi-eye-outline',
        subtitle: t('descriptions.reports'),
        description: t('descriptions.reports'),
        route: `/preview/${testId}`,
        image: 'IntroReports.svg',
        imageStyle: 'height: 250px',
        cardStyle: 'background-image: radial-gradient(circle at top right, #FF3C00, #FF0000); overflow: hidden'
    },
    {
        title: t('titles.answers'),
        icon: 'mdi-comment-question-outline',
        subtitle: t('descriptions.answers'),
        description: t('descriptions.answers'),
        route: `/result/${testId}`,
        image: 'IntroAnswer.svg',
        imageStyle: 'height: 250px',
        cardStyle: 'background-image: radial-gradient(circle at top right, #9ac94f, #7eb543); overflow: hidden'
    },
    {
        title: t('titles.cooperators'),
        icon: 'mdi-account-multiple-outline',
        subtitle: t('descriptions.cooperators'),
        description: t('descriptions.cooperators'),
        route: `/cooperative/${testId}`,
        image: 'IntroCoops.svg',
        imageStyle: '',
        cardStyle: 'background-image: radial-gradient(circle at top right, #06b6d4, #0891b2); overflow: hidden'
    },
]
