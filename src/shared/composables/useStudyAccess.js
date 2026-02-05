import { computed, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showError } from '@/shared/utils/toast'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'

// Re-export ACCESS_LEVEL for convenience
export { ACCESS_LEVEL }

/**
 * Route access permissions matrix
 * Key: route name suffix (e.g., 'edit', 'report')
 * Value: array of allowed access levels
 */
const ROUTE_PERMISSIONS = {
  manager: [ACCESS_LEVEL.ADMIN, ACCESS_LEVEL.EVALUATOR, ACCESS_LEVEL.GUEST],
  edit: [ACCESS_LEVEL.ADMIN],
  report: [ACCESS_LEVEL.ADMIN],
  answer: [ACCESS_LEVEL.ADMIN, ACCESS_LEVEL.EVALUATOR],
  cooperators: [ACCESS_LEVEL.ADMIN],
  settings: [ACCESS_LEVEL.ADMIN],
  testview: [
    ACCESS_LEVEL.ADMIN,
    ACCESS_LEVEL.EVALUATOR,
    ACCESS_LEVEL.GUEST,
    ACCESS_LEVEL.OBSERVATOR,
  ],
}

/**
 * Get the user's access level for a specific study
 * @param {Object} user - Current user object
 * @param {Object} test - Current test/study object
 * @returns {number|null} Access level or null if no access
 */
export function getStudyAccessLevel(user, test) {
  if (!user) return null
  if (!test) return null

  // Super admin or admin has full access
  if (
    typeof user.accessLevel === 'number' &&
    user.accessLevel <= ACCESS_LEVEL.ADMIN
  ) {
    return ACCESS_LEVEL.ADMIN
  }

  // Test owner has full access
  if (test.testAdmin?.userDocId === user.id) return ACCESS_LEVEL.ADMIN

  // Check if user is a cooperator
  const coop = test.cooperators?.find((c) => c.userDocId === user.id)
  if (coop) return coop.accessLevel

  // For public studies, allow guest access
  if (test.isPublic) return ACCESS_LEVEL.GUEST

  // Private study and not invited - no access
  return null
}

/**
 * Check if a given access level can access a specific route
 * @param {number} accessLevel - User's access level for this study
 * @param {string} routeType - Type of route (e.g., 'edit', 'report', 'manager')
 * @returns {boolean} Whether access is allowed
 */
export function canAccessRoute(accessLevel, routeType) {
  if (accessLevel === null) return false

  const allowed = ROUTE_PERMISSIONS[routeType]
  // Deny-by-default: unknown routes are not allowed
  if (!allowed) return false

  return allowed.includes(accessLevel)
}

/**
 * Get error message for access denied
 * @param {string} routeType - Type of route
 * @param {boolean} isPrivateStudy - Whether this is a private study access denial
 * @returns {string} i18n key for error message
 */
export function getAccessDeniedMessage(routeType, isPrivateStudy = false) {
  if (isPrivateStudy) {
    return 'accessControl.errors.privateStudyNoAccess'
  }

  const messages = {
    edit: 'accessControl.errors.editNotAllowed',
    report: 'accessControl.errors.reportNotAllowed',
    answer: 'accessControl.errors.answerNotAllowed',
    cooperators: 'accessControl.errors.cooperatorsNotAllowed',
    settings: 'accessControl.errors.settingsNotAllowed',
    manager: 'accessControl.errors.managerNotAllowed',
  }

  return messages[routeType] || 'accessControl.errors.genericNotAllowed'
}

/**
 * Composable for study access control
 * @param {Object} options
 * @param {string} options.routeType - Type of route (e.g., 'edit', 'report')
 * @param {string} options.redirectPath - Path to redirect to on access denied (default: '/')
 * @returns {Object} Access control utilities
 */
export function useStudyAccess(options = {}) {
  const { routeType = 'manager', redirectPath = '/' } = options

  const store = useStore()
  const router = useRouter()
  const { t } = useI18n()

  const user = computed(() => store.getters.user)
  const test = computed(() => store.getters.test)

  const accessLevel = computed(() => {
    return getStudyAccessLevel(user.value, test.value)
  })

  const isPrivateStudyWithNoAccess = computed(() => {
    if (!test.value) return false
    if (test.value.isPublic) return false
    return accessLevel.value === null
  })

  const hasAccess = computed(() => {
    if (accessLevel.value === null) return false
    return canAccessRoute(accessLevel.value, routeType)
  })

  const isAdmin = computed(() => accessLevel.value === ACCESS_LEVEL.ADMIN)
  const isEvaluator = computed(() => accessLevel.value === ACCESS_LEVEL.EVALUATOR)
  const isGuest = computed(() => accessLevel.value === ACCESS_LEVEL.GUEST)
  const isObservator = computed(() => accessLevel.value === ACCESS_LEVEL.OBSERVATOR)

  /**
   * Watch for access and redirect if denied
   * Call this in onMounted or setup to enable auto-redirect
   */
  function watchAccessAndRedirect() {
    const stop = watchEffect(() => {
      if (user.value !== null && test.value !== null) {
        if (!hasAccess.value) {
          const isPrivate = isPrivateStudyWithNoAccess.value
          const messageKey = getAccessDeniedMessage(routeType, isPrivate)
          showError(t(messageKey))
          router.push(redirectPath)
          // Stop watching after redirect to avoid repeated triggers
          stop()
        }
      }
    })
  }

  return {
    // Computed values
    user,
    test,
    accessLevel,
    hasAccess,
    isPrivateStudyWithNoAccess,
    isAdmin,
    isEvaluator,
    isGuest,
    isObservator,

    // Functions
    watchAccessAndRedirect,
  }
}

export default useStudyAccess
