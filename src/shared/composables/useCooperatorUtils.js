import { computed } from 'vue'
import {
  getStatusColor,
  getStatusText as getBaseStatusText,
} from '@/shared/utils/statusUtils'
import { formatDate, formatTime } from '@/shared/utils/dateUtils'
import { formatInitials } from '@/shared/utils/formatUtils'
import { useI18n } from 'vue-i18n'

/**
 * Composable for common cooperator utilities
 */
export function useCooperatorUtils() {
  const { t } = useI18n()

  // Role options definition
  const roleOptions = computed(() => [
    { title: t('HeuristicsCooperators.roles.administrator'), value: 0 },
    { title: t('HeuristicsCooperators.roles.evaluator'), value: 1 },
    { title: t('HeuristicsCooperators.roles.guest'), value: 2 },
    { title: t('HeuristicsCooperators.roles.observator'), value: 3 },
  ])

  // Status filter options
  const statusFilterOptions = computed(() => [
    { title: t('HeuristicsCooperators.status.invited'), value: 'invited' },
    { title: t('HeuristicsCooperators.status.accepted'), value: 'accepted' },
    { title: t('HeuristicsCooperators.status.pending'), value: 'pending' },
  ])

  // Utility functions
  const getInitials = (email) => {
    return formatInitials(email)
  }

  const getRoleColor = (role) => {
    // Handle numeric value or string
    const roleValue = typeof role === 'object' ? role.value : role
    if (
      roleValue === 0 ||
      (typeof roleValue === 'string' &&
        roleValue.toLowerCase() === 'administrator')
    )
      return 'primary'
    if (
      roleValue === 1 ||
      (typeof roleValue === 'string' && roleValue.toLowerCase() === 'evaluator')
    )
      return 'success'
    if (
      roleValue === 2 ||
      (typeof roleValue === 'string' && roleValue.toLowerCase() === 'guest')
    )
      return 'warning'
    if (
      roleValue === 3 ||
      (typeof roleValue === 'string' &&
        roleValue.toLowerCase() === 'observator')
    )
      return 'info'
    return 'grey'
  }

  const getRoleIcon = (role) => {
    // Handle numeric value or string
    const roleValue = typeof role === 'object' ? role.value : role
    if (
      roleValue === 0 ||
      (typeof roleValue === 'string' &&
        roleValue.toLowerCase() === 'administrator')
    )
      return 'mdi-crown'
    if (
      roleValue === 1 ||
      (typeof roleValue === 'string' && roleValue.toLowerCase() === 'evaluator')
    )
      return 'mdi-account-check'
    if (
      roleValue === 2 ||
      (typeof roleValue === 'string' && roleValue.toLowerCase() === 'guest')
    )
      return 'mdi-account'
    if (
      roleValue === 3 ||
      (typeof roleValue === 'string' &&
        roleValue.toLowerCase() === 'observator')
    )
      return 'mdi-eye'
    return 'mdi-account'
  }

  const getStatusText = (status) => {
    if (status === true || status === 'accepted')
      return t('HeuristicsCooperators.status.accepted')
    if (status === false || status === 'pending')
      return t('HeuristicsCooperators.status.pending')
    if (status === 'invited') return t('HeuristicsCooperators.status.invited')
    return getBaseStatusText(status)
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
