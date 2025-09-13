import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export function useAccessibilityAccess() {
    const store = useStore()
    const toast = useToast()

    const userRole = ref(null)
    const accessLevel = ref(null)
    const isLoading = ref(true)

    const fetchAccessData = async (testId) => {
        try {
            isLoading.value = true

            console.log('=== FETCHING STUDY AND USER INFORMATION ===')

            // Fetch current user information from auth store
            const currentUser = store.state.Auth.user
            console.log('Current User from Auth Store:')
            console.log(JSON.stringify(currentUser, null, 2))

            // Fetch study information using the testId
            if (testId) {
                console.log('Fetching study with ID:', testId)

                try {
                    // Try different action names to find the correct one
                    await store.dispatch('getStudy', { id: testId })
                } catch (firstError) {
                    console.log('First attempt failed, trying alternative:', firstError.message)
                    try {
                        await store.dispatch('getTest', { id: testId })
                    } catch (secondError) {
                        console.log('Second attempt failed, trying direct module access:', secondError.message)
                        // Check if Study module is namespaced
                        const studyModule = store._modules.root._children.Study
                        if (studyModule) {
                            await store.dispatch('Study/getStudy', { id: testId })
                        } else {
                            // Try without namespace
                            await store.dispatch('getStudy', { id: testId })
                        }
                    }
                }

                // Get the study data from store - try multiple paths
                let studyData = null
                if (store.getters.test) {
                    studyData = store.getters.test
                } else if (store.state.Study && store.state.Study.Test) {
                    studyData = store.state.Study.Test
                } else if (store.state.Test) {
                    studyData = store.state.Test
                } else {
                    // Check all possible store states
                    console.log('Available store state keys:', Object.keys(store.state))
                    console.log('Full store state:')
                    console.log(JSON.stringify(store.state, null, 2))
                }

                console.log('Study Data from Store:')
                console.log(JSON.stringify(studyData, null, 2))

                // Simple access control logic
                if (currentUser && studyData) {
                    const currentUserId = currentUser.id

                    // Check if user is test admin
                    const isTestAdmin = studyData.testAdmin?.userDocId === currentUserId
                    console.log('Is Test Admin:', isTestAdmin)

                    // Check if user is in cooperators array
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

            isLoading.value = false

        } catch (error) {
            console.error('Error in fetchAccessData:', error)
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
        return userRole.value === 'admin'
            ? 'Full Access (Test Admin)'
            : userRole.value === 'cooperator'
                ? 'Preview Only (Cooperator)'
                : 'Preview Only'
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
