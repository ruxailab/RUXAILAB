/**
 * Centralized theme constants for consistent styling across the application
 */

/**
 * Color schemes for gradient backgrounds
 */
export const GRADIENT_COLORS = {
  PURPLE: ['#6366f1', '#8b5cf6'],
  YELLOW: ['#eff31a', '#eecf22'],
  MAGENTA: ['#d128c9', '#9a1aab'],
  RED: ['#FF3C00', '#FF0000'],
  GREEN: ['#9ac94f', '#7eb543'],
  CYAN: ['#06b6d4', '#0891b2'],
  ORANGE: ['#f6cd3d', '#fca326'],
}

/**
 * Generate radial gradient style string
 * @param {Array} colors - Array of two colors [start, end]
 * @param {boolean} withOverflow - Whether to include overflow hidden
 * @returns {string} CSS style string
 */
export const createRadialGradient = (colors, withOverflow = true) => {
  const gradient = `background-image: radial-gradient(circle at top right, ${colors[0]}, ${colors[1]})`
  return withOverflow ? `${gradient}; overflow: hidden` : gradient
}

/**
 * Common icons used throughout the application
 */
export const ICONS = {
  HOME: 'mdi-home-variant',
  SETTINGS: 'mdi-cog-outline',
  EDIT: 'mdi-pencil-outline',
  VIEW: 'mdi-eye-outline',
  QUESTIONS: 'mdi-comment-question-outline',
  REPORTS: 'mdi-file-chart-outline',
  ANALYSIS: 'mdi-chart-line-variant',
  USERS: 'mdi-account-multiple-outline',
  MANAGER: 'mdi-home',
  DOCUMENT_EDIT: 'mdi-file-document-edit',
  DOCUMENT: 'mdi-file-document',
  PREVIEW: 'mdi-file-eye',
  BOOK: 'mdi-book-multiple',
  ORDER: 'mdi-order-bool-ascending-variant',
  ACCOUNT_GROUP: 'mdi-account-group',
  COG: 'mdi-cog',
}

/**
 * Common images used in intro cards
 */
export const INTRO_IMAGES = {
  ANALYTICS: 'IntroAnalytics.svg',
  ANSWER: 'IntroAnswer.svg',
  REPORTS: 'IntroReports.svg',
  COOPS: 'IntroCoops.svg',
  EDIT: 'IntroEdit.svg',
  MANAGER: 'IntroManager.svg',
}

/**
 * Image style configurations
 */
export const IMAGE_STYLES = {
  DEFAULT: '',
  FLIP_Y: 'transform: rotateY(180deg);',
  LARGE: 'height: 250px',
}

/**
 * Card theme configurations combining colors, images, and styles
 */
export const CARD_THEMES = {
  MANAGER: {
    colors: GRADIENT_COLORS.PURPLE,
    image: INTRO_IMAGES.EDIT,
    imageStyle: IMAGE_STYLES.DEFAULT,
  },
  CONFIG: {
    colors: GRADIENT_COLORS.YELLOW,
    image: INTRO_IMAGES.COOPS,
    imageStyle: IMAGE_STYLES.DEFAULT,
  },
  EDIT: {
    colors: GRADIENT_COLORS.MAGENTA,
    image: INTRO_IMAGES.EDIT,
    imageStyle: IMAGE_STYLES.FLIP_Y,
  },
  PREVIEW: {
    colors: GRADIENT_COLORS.RED,
    image: INTRO_IMAGES.REPORTS,
    imageStyle: IMAGE_STYLES.LARGE,
  },
  ANSWERS: {
    colors: GRADIENT_COLORS.GREEN,
    image: INTRO_IMAGES.ANSWER,
    imageStyle: IMAGE_STYLES.LARGE,
  },
  COOPERATORS: {
    colors: GRADIENT_COLORS.CYAN,
    image: INTRO_IMAGES.COOPS,
    imageStyle: IMAGE_STYLES.DEFAULT,
  },
}

/**
 * Create a card configuration object
 * @param {string} theme - Theme key from CARD_THEMES
 * @param {Object} overrides - Additional properties to override
 * @returns {Object} Card configuration
 */
export const createCardConfig = (theme, overrides = {}) => {
  const themeConfig = CARD_THEMES[theme]
  if (!themeConfig) {
    throw new Error(`Unknown theme: ${theme}`)
  }

  return {
    image: themeConfig.image,
    imageStyle: themeConfig.imageStyle,
    cardStyle: createRadialGradient(themeConfig.colors),
    ...overrides,
  }
}
