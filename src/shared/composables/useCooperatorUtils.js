import { computed } from 'vue'
import { getStatusColor, getStatusText } from '@/shared/utils/statusUtils'
import { formatDate, formatTime } from '@/shared/utils/dateUtils'
import { formatInitials } from '@/shared/utils/formatUtils'

/**
 * Composable for common cooperator utilities
 */
export function useCooperatorUtils() {
  // Role options definition
  const roleOptions = computed(() => [
    { title: 'Admin', value: 0 },
    { title: 'Evaluator', value: 1 },
    { title: 'Guest', value: 2 },
    { title: 'Observator', value: 3 },
  ])

  // Status filter options
  const statusFilterOptions = computed(() => [
    { title: 'Invited', value: 'invited' },
    { title: 'Accepted', value: 'accepted' },
    { title: 'Pending', value: 'pending' },
  ])

  // Utility functions
  const getInitials = (email) => {
    return formatInitials(email)
  }

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'administrator':
        return 'primary'
      case 'evaluator':
        return 'success'
      case 'observator':
        return 'info'
      case 'guest':
        return 'warning'
      default:
        return 'grey'
    }
  }

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'administrator':
        return 'mdi-crown'
      case 'evaluator':
        return 'mdi-account-check'
      case 'guest':
        return 'mdi-account'
      case 'observator':
        return 'info'
      default:
        return 'mdi-account'
    }
  }

  const validateEmail = (email) => {
    if (!email) return false
    if (!email.includes('@') || !email.includes('.')) return false
    return true
  }

  return {
    roleOptions,
    statusFilterOptions,
    getInitials,
    getRoleColor,
    getRoleIcon,
    getStatusColor,
    getStatusText,
    formatDate,
    formatTime,
    validateEmail,
  }
}
