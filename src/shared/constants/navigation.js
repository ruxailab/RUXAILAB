import { ICONS, INTRO_IMAGES } from './theme'

/**
 * Base navigation item structure
 * @param {string} title - Display title
 * @param {string} icon - Icon name
 * @param {string} path - Route path
 * @returns {Object} Navigation item
 */
export const createNavItem = (title, icon, path) => ({
    title,
    icon,
    path,
})

/**
 * Common navigation paths factory
 * @param {string} testId - Test ID parameter
 * @returns {Object} Path generators
 */
export const createPathGenerators = (testId) => ({
    accessibility: (page) => `/accessibility/automatic/${testId}/${page}`.replace('//', '/'),
    analyse: () => `/analyse/${testId}`,
    answers: () => `/answers/${testId}`,
    reports: () => `/reports/${testId}`,
    settings: () => `/settings/${testId}`,
    config: () => `/config/${testId}`,
    edit: () => `/edit/${testId}`,
    preview: () => `/preview/${testId}`,
    result: () => `/result/${testId}`,
    cooperative: () => `/cooperative/${testId}`,
})

/**
 * Standard navigation configurations
 */
export const NAV_CONFIGS = {
    ACCESSIBILITY: [
        { key: 'home', title: 'Home', icon: ICONS.HOME },
        { key: 'analyse', title: 'Analyse', icon: ICONS.ANALYSIS },
        { key: 'answers', title: 'Answers', icon: ICONS.QUESTIONS },
        { key: 'reports', title: 'Report', icon: ICONS.REPORTS },
        { key: 'settings', title: 'Settings', icon: ICONS.SETTINGS },
    ],
}

/**
 * Create navigation items for accessibility dashboard
 * @param {string} testId - The test ID parameter
 * @returns {Array} Array of navigation items
 */
export const getAccessibilityNavItems = (testId) => {
    const paths = createPathGenerators(testId)

    return NAV_CONFIGS.ACCESSIBILITY.map(config => ({
        title: config.title,
        icon: config.icon,
        path: config.key === 'home'
            ? `/accessibility/automatic/${testId}`
            : paths[config.key](),
    }))
}

/**
 * Image mappings for navigation items
 */
export const imageMap = {
    home: INTRO_IMAGES.ANALYTICS,
    analyse: INTRO_IMAGES.ANALYTICS,
    answers: INTRO_IMAGES.ANSWER,
    report: INTRO_IMAGES.REPORTS,
    reports: INTRO_IMAGES.REPORTS,
    settings: INTRO_IMAGES.COOPS,
}

/**
 * Standard descriptions for navigation items
 */
export const NAV_DESCRIPTIONS = {
    Home: 'Main dashboard overview and statistics',
    Analyse: 'Run comprehensive accessibility analysis',
    Answers: 'Manage Q&A responses and feedback',
    Report: 'Generate detailed reports and insights',
    Settings: 'Configure preferences and options',
}

/**
 * Get description for navigation items
 * @param {string} title - The title of the navigation item
 * @returns {string} Description for the item
 */
export const getDescription = (title) => {
    return NAV_DESCRIPTIONS[title] || 'Navigate to this section'
}
