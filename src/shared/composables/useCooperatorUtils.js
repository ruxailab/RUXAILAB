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

  // Role configuration mapping
  const ROLE_CONFIG = {
    0: { key: 'administrator', color: 'primary', icon: 'mdi-crown' },
    1: { key: 'evaluator', color: 'success', icon: 'mdi-account-check' },
    2: { key: 'guest', color: 'warning', icon: 'mdi-account' },
    3: { key: 'observator', color: 'info', icon: 'mdi-eye' },
  }

  // Helper to normalize role value
  const normalizeRole = (role) => {
    const val = typeof role === 'object' ? role.value : role
    // If it's a string, try to find the numeric ID
    if (typeof val === 'string') {
      const entry = Object.entries(ROLE_CONFIG).find(
        ([_, config]) => config.key === val.toLowerCase(),
      )
      return entry ? Number(entry[0]) : val
    }
    return val
  }

  // Role options definition
  const roleOptions = computed(() =>
    Object.entries(ROLE_CONFIG).map(([id, config]) => ({
      title: t(`HeuristicsCooperators.roles.${config.key}`),
      value: Number(id),
    })),
  )

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
    const roleId = normalizeRole(role)
    return ROLE_CONFIG[roleId]?.color || 'grey'
  }

  const getRoleIcon = (role) => {
    const roleId = normalizeRole(role)
    return ROLE_CONFIG[roleId]?.icon || 'mdi-account'
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
