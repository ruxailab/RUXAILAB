/**
 * Status utilities for consistent status handling across components
 * Centralized status color and icon functions to eliminate duplication
 */

/**
 * Get color for status values
 * @param {string|boolean} status - Status value
 * @returns {string} Vuetify color name
 */
export const getStatusColor = (status) => {
  // Handle boolean values
  if (status === true) return 'success'
  if (status === false) return 'error'

  // Handle string values (case insensitive)
  const statusStr = String(status).toLowerCase()

  const statusMap = {
    // Success states
    active: 'success',
    completed: 'success',
    success: 'success',
    pass: 'success',
    accepted: 'success',
    submitted: 'success',

    // Error states
    inactive: 'error',
    failed: 'error',
    error: 'error',
    fail: 'error',
    rejected: 'error',
    expired: 'error',

    // Warning states
    pending: 'warning',
    'in-progress': 'warning',
    warning: 'warning',
    invited: 'warning',
    'not-active': 'warning',

    // Info states
    info: 'info',
    draft: 'info',
  }

  return statusMap[statusStr] || 'grey'
}

/**
 * Get icon for status values
 * @param {string|boolean} status - Status value
 * @returns {string} Material Design Icon name
 */
export const getStatusIcon = (status) => {
  // Handle boolean values
  if (status === true) return 'mdi-check-circle'
  if (status === false) return 'mdi-close-circle'

  // Handle string values (case insensitive)
  const statusStr = String(status).toLowerCase()

  const iconMap = {
    // Success states
    active: 'mdi-play-circle',
    completed: 'mdi-check-circle',
    success: 'mdi-check-circle',
    pass: 'mdi-check-circle',
    accepted: 'mdi-check-circle',
    submitted: 'mdi-check-circle',

    // Error states
    inactive: 'mdi-pause-circle',
    failed: 'mdi-close-circle',
    error: 'mdi-alert-circle',
    fail: 'mdi-close-circle',
    rejected: 'mdi-close-circle',
    expired: 'mdi-clock-alert',

    // Warning states
    pending: 'mdi-clock-outline',
    'in-progress': 'mdi-progress-clock',
    warning: 'mdi-alert',
    invited: 'mdi-email-outline',
    'not-active': 'mdi-pause-circle',

    // Info states
    info: 'mdi-information',
    draft: 'mdi-file-document-outline',
  }

  return iconMap[statusStr] || 'mdi-help-circle'
}

/**
 * Get text representation for status values
 * @param {string|boolean} status - Status value
 * @returns {string} Human readable status text
 */
export const getStatusText = (status) => {
  // Handle boolean values
  if (status === true) return 'Accepted'
  if (status === false) return 'Pending'

  // Handle string values
  const statusStr = String(status).toLowerCase()

  const textMap = {
    active: 'Active',
    completed: 'Completed',
    success: 'Success',
    pass: 'Pass',
    accepted: 'Accepted',
    submitted: 'Submitted',
    inactive: 'Inactive',
    failed: 'Failed',
    error: 'Error',
    fail: 'Fail',
    rejected: 'Rejected',
    expired: 'Expired',
    pending: 'Pending',
    'in-progress': 'In Progress',
    warning: 'Warning',
    invited: 'Invited',
    'not-active': 'Not Active',
    info: 'Info',
    draft: 'Draft',
  }

  return textMap[statusStr] || status
}
