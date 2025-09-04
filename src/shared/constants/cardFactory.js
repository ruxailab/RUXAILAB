import { ICONS, createCardConfig } from './theme'
import { createPathGenerators } from './navigation'

/**
 * Card configuration factory for manual accessibility
 */
export const MANUAL_ACCESSIBILITY_CARDS_CONFIG = [
    {
        titleKey: 'titles.manager',
        icon: ICONS.HOME,
        subtitleKey: 'descriptions.edit',
        descriptionKey: 'descriptions.edit',
        route: '',
        theme: 'MANAGER',
    },
    {
        titleKey: 'titles.test',
        icon: ICONS.SETTINGS,
        subtitleKey: 'accessibility.cards.config.subtitle',
        descriptionKey: 'accessibility.cards.config.description',
        routeKey: 'config',
        theme: 'CONFIG',
    },
    {
        titleKey: 'titles.test',
        icon: ICONS.EDIT,
        subtitleKey: 'descriptions.edit',
        descriptionKey: 'accessibility.cards.edit.description',
        routeKey: 'edit',
        theme: 'EDIT',
    },
    {
        titleKey: 'titles.preview',
        icon: ICONS.VIEW,
        subtitleKey: 'descriptions.reports',
        descriptionKey: 'descriptions.reports',
        routeKey: 'preview',
        theme: 'PREVIEW',
    },
    {
        titleKey: 'titles.answers',
        icon: ICONS.QUESTIONS,
        subtitleKey: 'descriptions.answers',
        descriptionKey: 'descriptions.answers',
        routeKey: 'result',
        theme: 'ANSWERS',
    },
    {
        titleKey: 'titles.cooperators',
        icon: ICONS.USERS,
        subtitleKey: 'descriptions.cooperators',
        descriptionKey: 'descriptions.cooperators',
        routeKey: 'cooperative',
        theme: 'COOPERATORS',
    },
]

/**
 * Create manual accessibility cards with i18n support
 * @param {Function} t - Translation function
 * @param {string} testId - Test ID parameter
 * @returns {Array} Array of card configurations
 */
export const getManualAccessibilityCards = (t, testId) => {
    const paths = createPathGenerators(testId)

    return MANUAL_ACCESSIBILITY_CARDS_CONFIG.map(config => {
        const cardTheme = createCardConfig(config.theme)

        return {
            title: t(config.titleKey),
            icon: config.icon,
            subtitle: t(config.subtitleKey),
            description: t(config.descriptionKey),
            route: config.routeKey ? paths[config.routeKey]() : config.route,
            ...cardTheme,
        }
    })
}
