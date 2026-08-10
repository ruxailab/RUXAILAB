import { computed } from 'vue'
import { getStatusColor, getStatusText } from '@/shared/utils/statusUtils'
import { formatDate, formatTime } from '@/shared/utils/dateUtils'
import { formatInitials } from '@/shared/utils/formatUtils'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import { STUDY_ROLE } from '@/shared/utils/studyAccessPolicy'

import i18n from '@/app/plugins/i18n'

const t = i18n.global.t

export const normalizeCooperatorInviteEntry = (entry, registeredUsers = []) => {
  if (!entry) {
    return { email: '', userDocId: null }
  }

  if (typeof entry === 'string') {
    const email = entry.trim()
    const normalizedEmail = email?.toLowerCase()
    const matchedUser = registeredUsers.find((user) => {
      return user?.email?.trim()?.toLowerCase() === normalizedEmail
    })

    return {
      email,
      userDocId: matchedUser?.id || matchedUser?.userDocId || null,
    }
  }

  const email = entry?.email?.trim() || entry?.value?.trim() || ''
  const matchedUser = registeredUsers.find((user) => {
    return user?.email?.trim()?.toLowerCase() === email?.trim()?.toLowerCase()
  })

  return {
    email,
    userDocId:
      entry?.userDocId ||
      entry?.id ||
      matchedUser?.id ||
      matchedUser?.userDocId ||
      null,
    ...entry,
  }
}

export const enrichCooperatorInviteEntry = async (entry, dependencies = {}) => {
  if (!entry) {
    return { email: '', userDocId: null }
  }

  const normalizedEntry = normalizeCooperatorInviteEntry(entry)

  if (normalizedEntry.userDocId) {
    return normalizedEntry
  }

  const email = normalizedEntry.email
  if (!email) {
    return normalizedEntry
  }

  const resolver = dependencies.resolveUserByEmail
  if (typeof resolver !== 'function') {
    return normalizedEntry
  }

  try {
    const user = await resolver(email)
    return {
      ...normalizedEntry,
      userDocId: user?.id || user?.userDocId || null,
    }
  } catch {
    return normalizedEntry
  }
}

export const getPredefinedParticipantUserRole = (study) => {
  if (study?.testType == STUDY_TYPES.HEURISTIC) {
    return STUDY_ROLE.EVALUATOR
  }

  return STUDY_ROLE.USER
}

export const getCooperatorInviteValidationError = ({
  email,
  currentUserEmail,
  studyOwnerEmail,
  existingCooperators = [],
  t,
}) => {
  if (!email || typeof email !== 'string') {
    return t('cooperators.validation.invalidEmail')
  }

  const normalizedEmail = email?.trim()?.toLowerCase()
  if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    return t('cooperators.validation.invalidFormat')
  }

  if (
    currentUserEmail &&
    normalizedEmail === currentUserEmail?.trim()?.toLowerCase()
  ) {
    return t('cooperators.validation.inviteSelf')
  }

  if (
    studyOwnerEmail &&
    normalizedEmail === studyOwnerEmail?.trim()?.toLowerCase()
  ) {
    return t('cooperators.validation.inviteOwner')
  }

  const alreadyCooperator = existingCooperators.some((cooperator) => {
    return cooperator?.email?.trim()?.toLowerCase() === normalizedEmail
  })

  if (alreadyCooperator) {
    return t('cooperators.validation.alreadyCooperator')
  }

  return null
}

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
    {
      title: t('Participants.status.pending'),
      value: 'pending',
    },
    {
      title: t('Participants.status.accepted'),
      value: 'accepted',
    },
    {
      title: t('Participants.status.rejected'),
      value: 'rejected',
    },
    {
      title: t('Participants.status.expired'),
      value: 'expired',
    },
  ])

  // Utility functions
  const getInitials = (email) => {
    return formatInitials(email)
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'administrator':
        return 'primary'
      case 'evaluator':
        return 'success'
      case 'observator':
        return 'info'
      case 'manager':
        return 'primary'
      case 'user':
        return 'secondary'
      case 'guest':
        return 'warning'
      default:
        return 'grey'
    }
  }

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'administrator':
        return 'mdi-crown'
      case 'evaluator':
        return 'mdi-account-check'
      case 'guest':
        return 'mdi-account'
      case 'observator':
        return 'mdi-eye'
      case 'manager':
        return 'mdi-account-cog'
      case 'user':
        return 'mdi-account'
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
    getCooperatorInviteValidationError,
  }
}
