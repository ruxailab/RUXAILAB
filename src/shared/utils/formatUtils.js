/**
 * General formatting utilities
 * Centralized formatting functions for consistent data presentation
 */

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted bytes string (e.g., "1.5 MB")
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B'
  if (!bytes || bytes < 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format percentage with proper handling of NaN and edge cases
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string (e.g., "85.5%")
 */
export const formatPercentage = (value, decimals = 1) => {
  if (isNaN(value) || value === null || value === undefined) return '0.0%'
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number string (e.g., "1,234")
 */
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0'
  return num.toLocaleString()
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format initials from email or name
 * @param {string} emailOrName - Email address or name
 * @returns {string} Formatted initials (e.g., "JD")
 */
export const formatInitials = (emailOrName) => {
  if (!emailOrName) return '?'

  // If it's an email, extract the part before @
  if (emailOrName.includes('@')) {
    const username = emailOrName.split('@')[0]
    return username.slice(0, 2).toUpperCase()
  }

  // If it's a name, get first letter of each word
  const words = emailOrName.trim().split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  return emailOrName.slice(0, 2).toUpperCase()
}
