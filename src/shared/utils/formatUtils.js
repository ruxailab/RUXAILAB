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
