<template>
  <v-app>
    <AccessibilityDrawer ref="accessibilityDrawer" v-model="drawerOpen" :items="navItems" @toggle="onDrawerToggle" />
    <v-main>
      <v-overlay v-model="isLoading" contained class="align-center justify-center">
        <div class="text-center">
          <v-progress-circular indeterminate size="64" color="primary" />
          <div class="mt-4 text-h6">Loading test data...</div>
          <div class="text-caption">Checking access permissions</div>
        </div>
      </v-overlay>
      
      <div v-if="!isLoading">
        <!-- Simple access level indicator -->
        <div v-if="userRole" class="ma-2 text-caption text-grey">
          Access: {{ userRole === 'admin' ? 'Full Access (Test Admin)' : userRole === 'cooperator' ? 'Preview Only (Cooperator)' : 'Preview Only' }}
        </div>
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import AccessibilityDrawer from '@/ux/accessibility/components/atoms/AccessibilityDrawer.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast()

const testId = ref(route.params.id || '')
const accessibilityDrawer = ref(null)
const drawerOpen = ref(false)
const userRole = ref(null)
const accessLevel = ref(null)
const isLoading = ref(true)

const fetchTestData = async () => {
  try {
    isLoading.value = true
    
    console.log('=== FETCHING STUDY AND USER INFORMATION ===')
    
    // Fetch current user information from auth store
    const currentUser = store.state.Auth.user
    console.log('Current User from Auth Store:')
    console.log(JSON.stringify(currentUser, null, 2))
    
    // Fetch study information using the testId
    if (testId.value) {
      console.log('Fetching study with ID:', testId.value)
      
      try {
        // Try different action names to find the correct one
        await store.dispatch('getStudy', { id: testId.value })
      } catch (firstError) {
        console.log('First attempt failed, trying alternative:', firstError.message)
        try {
          await store.dispatch('getTest', { id: testId.value })
        } catch (secondError) {
          console.log('Second attempt failed, trying direct module access:', secondError.message)
          // Check if Study module is namespaced
          const studyModule = store._modules.root._children.Study
          if (studyModule) {
            await store.dispatch('Study/getStudy', { id: testId.value })
          } else {
            // Try without namespace
            await store.dispatch('getStudy', { id: testId.value })
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
    console.error('Error in fetchTestData:', error)
    toast.error(`Failed to load test data: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const navItems = computed(() => {
  const allItems = [
    {
      title: 'Manager',
      icon: 'mdi-home',
      path: `/accessibility/manual/${testId.value}`,
      requiresAdmin: false
    },
    {
      title: 'Config',
      icon: 'mdi-cog',
      path: `/accessibility/manual/config/${testId.value}`,
      requiresAdmin: true
    },
    {
      title: 'Edit Study',
      icon: 'mdi-pencil',
      path: `/accessibility/manual/edit/${testId.value}`,
      requiresAdmin: true
    },
    {
      title: 'Preview',
      icon: 'mdi-clipboard-check',
      path: `/accessibility/manual/preview/${testId.value}`,
      requiresAdmin: false
    },
    {
      title: 'Answers',
      icon: 'mdi-order-bool-ascending-variant',
      path: `/accessibility/manual/result/${testId.value}`,
      requiresAdmin: true
    },
    {
      title: 'Cooperator',
      icon: 'mdi-account-group',
      path: `/accessibility/manual/cooperative/${testId.value}`,
      requiresAdmin: true
    },
  ]
  
  // Filter items based on user role
  if (userRole.value === 'admin') {
    // Test admins get full access to all pages
    return allItems
  } else {
    // Cooperators and regular users only get preview access
    return allItems.filter(item => !item.requiresAdmin)
  }
})

const onDrawerToggle = (isOpen) => {
  const contentCol = document.querySelector('.content-col')
  if (contentCol) {
    if (isOpen) {
      contentCol.style.marginLeft = '256px'
      contentCol.style.width = 'calc(100% - 256px)'
    } else {
      contentCol.style.marginLeft = '56px'
      contentCol.style.width = 'calc(100% - 56px)'
    }
  }
}

onMounted(() => {
  onDrawerToggle(true)
  fetchTestData().then(() => {
    // Simple redirect for non-admin users trying to access manager page
    if (userRole.value !== 'admin' && route.path === `/accessibility/manual/${testId.value}`) {
      console.log('Non-admin user redirected to preview')
      router.push(`/accessibility/manual/preview/${testId.value}`)
    }
  })
})
</script>

<style scoped>
.fill-height {
  height: 100vh;
  overflow: hidden;
}

/* Content area styles */
.content-col {
  margin-left: 256px;
  /* Default to drawer open */
  width: calc(100% - 256px);
  height: 100%;
  transition: margin 0.3s ease, width 0.3s ease;
  overflow-y: auto;
  padding: 16px !important;
}

/* Ensure proper spacing for the drawer */
:deep(.v-navigation-drawer) {
  position: fixed;
  z-index: 100;
  height: 100vh;
  overflow-y: auto;
}

/* Adjust for mobile */
@media (max-width: 960px) {
  .content-col {
    margin-left: 56px !important;
    width: calc(100% - 56px) !important;
  }
}
</style>
