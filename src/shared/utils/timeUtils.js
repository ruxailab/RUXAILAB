/**
 * Time formatting utilities
 * Centralized time formatting functions to eliminate duplication across components
 */

/**
 * Format time in seconds to MM:SS format
 * @param {number} timeInSeconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "2:30")
 */
export const formatTime = (timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds < 0) return '0:00'

  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format time in milliseconds to MM:SS format
 * @param {number} timeInMs - Time in milliseconds
 * @returns {string} Formatted time string (e.g., "2:30")
 */
export const formatTimeFromMs = (timeInMs) => {
  if (!timeInMs || timeInMs < 0) return '0:00'
  const seconds = Math.floor(timeInMs / 1000)
  return formatTime(seconds)
}

/**
 * Format time with detailed breakdown
 * @param {number} timeInSeconds - Time in seconds
 * @returns {object} Object with formatted time and components
 */
export const formatTimeDetailed = (timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds < 0) {
    return { formatedTime: '0:00', hours: 0, minutes: 0, seconds: 0 }
  }
  return {
    formatedTime: formatTime(timeInSeconds),
    hours: Math.floor(timeInSeconds / 3600),
    minutes: Math.floor((timeInSeconds % 3600) / 60),
    seconds: Math.floor(timeInSeconds % 60),
  }
}

/**
 * Format time from milliseconds with detailed breakdown
 * @param {number} timeInMs - Time in milliseconds
 * @returns {object} Object with formatted time and components
 */
export const formatTimeDetailedFromMs = (timeInMs) => {
  if (!timeInMs || timeInMs < 0) {
    return formatTimeDetailed(0)
  }
  const seconds = Math.floor(timeInMs / 1000)
  return formatTimeDetailed(seconds)
}
