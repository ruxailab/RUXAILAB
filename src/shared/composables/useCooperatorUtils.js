import { computed } from 'vue'

/**
 * Composable for common cooperator utilities
 */
export function useCooperatorUtils() {
  // Role options definition
  const roleOptions = computed(() => [
    { title: 'Admin', value: 0 },
    { title: 'Evaluator', value: 1 },
    { title: 'Guest', value: 2 },
  ])

  // Status filter options
  const statusFilterOptions = computed(() => [
    { title: 'Invited', value: 'invited' },
    { title: 'Accepted', value: 'accepted' },
    { title: 'Pending', value: 'pending' },
  ])

  // Utility functions
  const getInitials = (email) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'administrator':
        return 'primary'
      case 'evaluator':
        return 'success'
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
      default:
        return 'mdi-account'
    }
  }

  const getStatusColor = (status) => {
    if (status === true) return 'success'
    if (status === false) return 'error'
    return 'warning'
  }

  const getStatusText = (status) => {
    if (status === true) return 'accepted'
    return 'pending'
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
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
