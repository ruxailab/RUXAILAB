import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import {
  showError,
} from '@/shared/utils/toast'


export function useAccessibilityAccess() {
    const store = useStore()

    const userRole = ref(null)
    const accessLevel = ref(null)
    const isLoading = ref(true)

    const fetchStudyData = async (testId) => {
        try {
            await store.dispatch('getStudy', { id: testId })
        } catch (firstError) {
            console.log('First attempt failed, trying alternative:', firstError.message)
            try {
                await store.dispatch('getTest', { id: testId })
            } catch (secondError) {
                console.log('Second attempt failed, trying direct module access:', secondError.message)
                const studyModule = store._modules.root._children.Study
                if (studyModule) {
                    await store.dispatch('Study/getStudy', { id: testId })
                } else {
                    await store.dispatch('getStudy', { id: testId })
                }
            }
        }

        if (store.getters.test) {
            return store.getters.test
        } else if (store.state.Study?.Test) {
            return store.state.Study.Test
        } else if (store.state.Test) {
            return store.state.Test
        } else {
            console.log('Available store state keys:', Object.keys(store.state))
            console.log('Full store state:')
            console.log(JSON.stringify(store.state, null, 2))
            return null
        }
    }

    const determineUserRole = (currentUser, studyData) => {
        const currentUserId = currentUser.id
        const isTestAdmin = studyData.testAdmin?.userDocId === currentUserId
        console.log('Is Test Admin:', isTestAdmin)
        const isCooperator = studyData.cooperators?.some(coop => coop.userDocId === currentUserId)
        console.log('Is Cooperator:', isCooperator)

        if (isTestAdmin) {
            userRole.value = 'admin'
            accessLevel.value = 999
            console.log('Access granted: User is test admin - full access to all pages')
        } else if (isCooperator) {
            userRole.value = 'cooperator'
            accessLevel.value = 500
            console.log('Access granted: User is cooperator - preview page only')
        } else {
            userRole.value = 'user'
            accessLevel.value = 0
            console.log('Limited access: User gets preview only')
        }
    }

    const fetchAccessData = async (testId) => {
        try {
            isLoading.value = true
            console.log('=== FETCHING STUDY AND USER INFORMATION ===')
            const currentUser = store.state.Auth.user
            console.log('Current User from Auth Store:')
            console.log(JSON.stringify(currentUser, null, 2))

            if (testId) {
                console.log('Fetching study with ID:', testId)
                const studyData = await fetchStudyData(testId)
                console.log('Study Data from Store:')
                console.log(JSON.stringify(studyData, null, 2))

                if (currentUser && studyData) {
                    determineUserRole(currentUser, studyData)
                } else {
                    userRole.value = 'user'
                    accessLevel.value = 0
                    console.log('No user or study data - default to limited access')
                }
            } else {
                console.log('No testId available')
                userRole.value = 'user'
                accessLevel.value = 0
            }

            console.log('=== END FETCH DATA ===')
        } catch (error) {
            console.error('Error in fetchAccessData:', error)
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
            return allItems.filter(item => !item.requiresAdmin)
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
        getAccessLevelText
    }
}
