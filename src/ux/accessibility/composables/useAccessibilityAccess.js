import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { showError } from '@/shared/utils/toast'

export function useAccessibilityAccess() {
  const store = useStore()

  const userRole = ref(null)
  const accessLevel = ref(null)
  const isLoading = ref(true)

  /** Fetches study data from the store by testId. */
  const fetchStudyData = async (testId) => {
    await store.dispatch('getStudy', { id: testId })
    return store.getters.test ?? null
  }

  const determineUserRole = (currentUser, studyData) => {
    const currentUserId = currentUser.id
    const isTestAdmin = studyData.testAdmin?.userDocId === currentUserId
    const isCooperator = studyData.cooperators?.some(
      (coop) => coop.userDocId === currentUserId,
    )

    if (isTestAdmin) {
      userRole.value = 'admin'
      accessLevel.value = 999
    } else if (isCooperator) {
      userRole.value = 'cooperator'
      accessLevel.value = 500
    } else {
      userRole.value = 'user'
      accessLevel.value = 0
    }
  }

  const fetchAccessData = async (testId) => {
    try {
      isLoading.value = true
      const currentUser = store.state.Auth.user

      if (testId) {
        const studyData = await fetchStudyData(testId)

        if (currentUser && studyData) {
          determineUserRole(currentUser, studyData)
        } else {
          userRole.value = 'user'
          accessLevel.value = 0
        }
      } else {
        userRole.value = 'user'
        accessLevel.value = 0
      }
    } catch (error) {
      showError(`Failed to load test data: ${error.message}`)
    } finally {
      isLoading.value = false
    }
  }

  const getFilteredNavItems = (allItems) => {
    // Filter items based on user role
    if (userRole.value === 'admin') {
      // Test admins get full access to all pages
      return allItems
    } else {
      // Cooperators and regular users only get items that don't require admin
      return allItems.filter((item) => !item.requiresAdmin)
    }
  }

  const getAccessLevelText = computed(() => {
    if (!userRole.value) return ''
    if (userRole.value === 'admin') return 'Full Access (Test Admin)'
    if (userRole.value === 'cooperator') return 'Preview Only (Cooperator)'
    return 'Preview Only'
  })

  return {
    userRole,
    accessLevel,
    isLoading,
    fetchAccessData,
    getFilteredNavItems,
    getAccessLevelText,
  }
}
