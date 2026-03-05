import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { getCurrentUser } from '@/ux/accessibility/utils/getCurrentUser'

export function useAccessibilityAccess() {
    const store = useStore()
    const toast = useToast()

    const userRole = ref(null)
    const accessLevel = ref(null)
    const isLoading = ref(true)

    const fetchStudyData = async (testId) => {
        await store.dispatch('getStudy', { id: testId })

        const studyData = store.getters.test ?? store.state.Tests?.Test ?? null

        if (!studyData) {
            throw new Error('Study data could not be loaded. Please try again.')
        }

        return studyData
    }

    const determineUserRole = (currentUser, studyData) => {
        const currentUserId = currentUser.id || currentUser.uid || currentUser.userDocId

        const isTestAdmin = studyData.testAdmin?.userDocId === currentUserId
        const cooperator = studyData.cooperators?.find(coop => coop.userDocId === currentUserId)

        if (isTestAdmin) {
            userRole.value = 'admin'
            accessLevel.value = 0
        } else if (cooperator) {
            if (cooperator.accessLevel === 0) {
                userRole.value = 'admin'
                accessLevel.value = 0
            } else if (cooperator.accessLevel === 1 || cooperator.accessLevel === 2) {
                userRole.value = 'cooperator'
                accessLevel.value = cooperator.accessLevel
            } else {
                userRole.value = 'user'
                accessLevel.value = 99
            }
        } else {
            userRole.value = 'user'
            accessLevel.value = 99
        }
    }

    const fetchAccessData = async (testId) => {
        try {
            isLoading.value = true

            const currentUser = await getCurrentUser(store)

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
            if (process.env.NODE_ENV !== 'production') {
                console.error('[useAccessibilityAccess] fetchAccessData failed:', error.message)
            }
            toast.error(`Failed to load test data: ${error.message}`)
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
            return allItems.filter(item => !item.requiresAdmin)
        }
    }

    const getAccessLevelText = computed(() => {
        if (!userRole.value) return ''
        if (userRole.value === 'admin') {
            if (accessLevel.value === 0) {
                return 'Full Access (Admin/Cooperator Level 0)'
            }
            return 'Full Access (Test Admin)'
        }
        if (userRole.value === 'cooperator') {
            return `Limited Access (Cooperator Level ${accessLevel.value})`
        }
        return 'Preview Only'
    })

    return {
        userRole,
        accessLevel,
        isLoading,
        fetchAccessData,
        getFilteredNavItems,
        getAccessLevelText
    }
}
