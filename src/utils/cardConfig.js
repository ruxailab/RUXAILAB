/**
 * Card configuration utilities for manager views
 * Provides common card styles, gradients, and transformations
 */

// Predefined gradient styles for cards
export const CARD_GRADIENTS = {
    PURPLE: 'background-image: radial-gradient(circle at top right, #6366f1, #8b5cf6); overflow: hidden',
    YELLOW: 'background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden',
    MAGENTA: 'background-image: radial-gradient(circle at top right, #d128c9, #9a1aab); overflow: hidden',
    RED: 'background-image: radial-gradient(circle at top right, #FF3C00, #FF0000); overflow: hidden',
    GREEN: 'background-image: radial-gradient(circle at top right, #9ac94f, #7eb543); overflow: hidden',
    CYAN: 'background-image: radial-gradient(circle at top right, #06b6d4, #0891b2); overflow: hidden',
    ORANGE: 'background-image: radial-gradient(circle at top left, #ec6618, #f54e42); overflow: hidden'
}

// Common card configurations
export const CARD_TYPES = {
    MANAGER: {
        image: 'IntroEdit.svg',
        imageStyle: '',
        cardStyle: CARD_GRADIENTS.PURPLE
    },
    EDIT: {
        image: 'IntroEdit.svg',
        imageStyle: 'transform: rotateY(180deg);',
        cardStyle: CARD_GRADIENTS.MAGENTA
    },
    CONFIG: {
        image: 'IntroCoops.svg',
        imageStyle: '',
        cardStyle: CARD_GRADIENTS.YELLOW
    },
    COOPERATORS: {
        image: 'IntroCoops.svg',
        imageStyle: '',
        cardStyle: CARD_GRADIENTS.CYAN
    },
    REPORTS: {
        image: 'IntroReports.svg',
        imageStyle: 'height: 250px',
        cardStyle: CARD_GRADIENTS.RED
    },
    ANSWERS: {
        image: 'IntroAnswer.svg',
        imageStyle: 'height: 250px',
        cardStyle: CARD_GRADIENTS.GREEN
    },
    FINAL_REPORT: {
        image: 'FinalReport.png',
        imageStyle: 'height: 250px',
        cardStyle: CARD_GRADIENTS.ORANGE
    },
    HOME: {
        image: 'IntroAnalytics.svg',
        imageStyle: '',
        cardStyle: CARD_GRADIENTS.PURPLE
    },
    ANALYSE: {
        image: 'IntroAnalytics.svg',
        imageStyle: '',
        cardStyle: CARD_GRADIENTS.CYAN
    },
    SETTINGS: {
        image: 'IntroCoops.svg',
        imageStyle: '',
        cardStyle: CARD_GRADIENTS.YELLOW
    }
}

/**
 * Creates a card configuration object
 * @param {string} type - Card type from CARD_TYPES
 * @param {Object} config - Additional configuration
 * @returns {Object} Card configuration
 */
export function createCard(type, config = {}) {
    const baseCard = CARD_TYPES[type] || {}

    return {
        image: baseCard.image,
        imageStyle: baseCard.imageStyle || '',
        cardStyle: baseCard.cardStyle || '',
        bottom: '#000',
        ...config
    }
}

/**
 * Transforms card data for CardsManager component
 * @param {Array} cards - Array of card objects
 * @returns {Array} Transformed cards for CardsManager
 */
export function transformCardsForManager(cards) {
    return cards.map((c) => ({
        image: c.image,
        title: c.title,
        titleDirect: (c.title || '').toString(),
        imageStyle: c.imageStyle || '',
        bottom: c.bottom || '#000',
        description: c.subtitle || c.description,
        descriptionDirect: (c.subtitle || c.description || '').toString(),
        cardStyle: c.cardStyle || '',
        path: c.route || c.path,
    }))
}
