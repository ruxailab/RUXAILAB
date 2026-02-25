/**
 * Study Categories Definitions
 * This file contains the complete configuration for each study category:
 * - Unique ID
 * - Title
 * - Description
 * - Material Design Icon
 * - Color
 * - Status (available or coming soon)
 * - Whether it has sub-methods
 */

export const STUDY_CATEGORIES = [
  {
    id: 'test',
    title: 'Test',
    description:
      'Conduct controlled testing with real users to measure usability and performance.',
    icon: 'mdi-test-tube',
    color: 'success',
    hasSubMethods: true,
    comingSoon: false,
  },
  {
    id: 'inquiry',
    title: 'Inquiry',
    description:
      'Gather insights through surveys, interviews, and other research methods.',
    icon: 'mdi-comment-question-outline',
    color: 'warning',
    hasSubMethods: false,
    comingSoon: true,
  },
  {
    id: 'inspection',
    title: 'Inspection',
    description:
      'Expert evaluation using established usability principles and guidelines.',
    icon: 'mdi-magnify',
    color: 'secondary',
    hasSubMethods: true,
    comingSoon: false,
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description:
      'Assess your product for accessibility compliance and best practices.',
    icon: 'mdi-access-point',
    color: 'primary',
    hasSubMethods: true,
    comingSoon: true,
  },
]

/**
 * Obtiene una categoría por su ID
 * @param {string} categoryId - ID de la categoría
 * @returns {Object|undefined} - Categoría encontrada o undefined
 */
export const getCategoryById = (categoryId) => {
  return STUDY_CATEGORIES.find((category) => category.id === categoryId)
}

/**
 * Obtiene todas las categorías disponibles (no próximamente)
 * @returns {Array} - Array de categorías disponibles
 */
export const getAvailableCategories = () => {
  return STUDY_CATEGORIES.filter((category) => !category.comingSoon)
}

/**
 * Obtiene todas las categorías que tienen sub-métodos
 * @returns {Array} - Array de categorías con sub-métodos
 */
export const getCategoriesWithSubMethods = () => {
  return STUDY_CATEGORIES.filter((category) => category.hasSubMethods)
}
