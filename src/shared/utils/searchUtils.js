/**
 * Normalizes a string by removing accents/diacritics, spaces, special characters, and converting to lowercase.
 * This makes search functionality accent-insensitive, space-insensitive, and special-character-insensitive.
 *
 * @param {string} str - The string to normalize
 * @returns {string} - The normalized string (lowercase, no accents, no spaces, no special characters)
 *
 * @example
 * normalizeForSearch('Métrica') // returns 'metrica'
 * normalizeForSearch('Niño') // returns 'nino'
 * normalizeForSearch('MARC STUDY') // returns 'marcstudy'
 * normalizeForSearch('eye-tracking-test') // returns 'eyetrackingtest'
 * normalizeForSearch('Café con leche') // returns 'cafeconleche'
 */
export const normalizeForSearch = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Checks if a text matches a search query (accent-insensitive).
 *
 * @param {string} text - The text to search in
 * @param {string} query - The search query
 * @returns {boolean} - Whether the text matches the query
 *
 * @example
 * matchesSearch('Métrica de usabilidad', 'metrica') // returns true
 * matchesSearch('Café con leche', 'cafe') // returns true
 */
export const matchesSearch = (text, query) => {
  if (!query) return true
  if (!text) return false
  return normalizeForSearch(text).includes(normalizeForSearch(query))
}
