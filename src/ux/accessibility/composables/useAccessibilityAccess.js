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
        // Try multiple possible user ID fields
        const currentUserId = currentUser.id || currentUser.uid || currentUser.userDocId

        console.log('=== DETERMINING USER ROLE ===')
        console.log('Current User Object:', currentUser)
        console.log('Current User ID (extracted):', currentUserId)
        console.log('Test Admin UserDocId:', studyData.testAdmin?.userDocId)
        console.log('Cooperators:', studyData.cooperators)

        // Check if user is the test admin
        const isTestAdmin = studyData.testAdmin?.userDocId === currentUserId
        console.log('Is Test Admin:', isTestAdmin)

        // Check if user is a cooperator and get their access level
        const cooperator = studyData.cooperators?.find(coop => coop.userDocId === currentUserId)
        console.log('Cooperator found:', cooperator)
        console.log('Cooperator accessLevel:', cooperator?.accessLevel)

        if (isTestAdmin) {
            userRole.value = 'admin'
            accessLevel.value = 0
            console.log('Access granted: User is test admin - full access to all pages')
        } else if (cooperator) {
            // Check cooperator's accessLevel
            if (cooperator.accessLevel === 0) {
                userRole.value = 'admin'
                accessLevel.value = 0
                console.log('Access granted: Cooperator with accessLevel 0 - full access to all pages')
            } else if (cooperator.accessLevel === 1 || cooperator.accessLevel === 2) {
                userRole.value = 'cooperator'
                accessLevel.value = cooperator.accessLevel
                console.log(`Access limited: Cooperator with accessLevel ${cooperator.accessLevel} - only home and preview pages`)
            } else {
                userRole.value = 'user'
                accessLevel.value = 99
                console.log('Limited access: Unknown access level - preview only')
            }
        } else {
            userRole.value = 'user'
            accessLevel.value = 99
            console.log('Limited access: Not admin or cooperator - preview only')
        }
    }

    const fetchAccessData = async (testId) => {
        try {
            isLoading.value = true
            console.log('=== FETCHING STUDY AND USER INFORMATION ===')

            // Use centralized getCurrentUser utility
            const currentUser = await getCurrentUser(store)

            console.log('Current User:')
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
