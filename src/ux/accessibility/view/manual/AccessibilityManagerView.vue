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

const testId = ref(route.params.testId || '')
const accessibilityDrawer = ref(null)
const drawerOpen = ref(false)
const userRole = ref(null)
const accessLevel = ref(null)
const isLoading = ref(true)

const fetchTestData = async () => {
  try {
    isLoading.value = true
    
    const user = store.state.Auth.user
    if (!user || !user.id) {
      throw new Error('User not authenticated')
    }
    
    const { getDoc, doc } = await import('firebase/firestore')
    const { db } = await import('@/app/plugins/firebase')
    
    const testRef = doc(db, 'tests', testId.value)
    const testSnap = await getDoc(testRef)
    
    if (!testSnap.exists()) {
      toast.error('Test not found')
      router.push('/dashboard')
      return
    }
    
    const testData = testSnap.data()
    checkUserAccess(user, testData)
    
  } catch (error) {
    toast.error(`Failed to load test data: ${error.message}`)
    router.push('/dashboard')
  } finally {
    isLoading.value = false
  }
}

const checkUserAccess = (user, testData) => {
  if (testData.userId === user.id) {
    userRole.value = 'owner'
    accessLevel.value = 999
    return
  }
  
  const testAdmin = testData.testAdmin
  if (testAdmin && testAdmin.userDocId === user.id) {
    userRole.value = 'admin'
    accessLevel.value = 999
    return
  }
  
  const collaborators = testData.collaborators || {}
  const userCollaborator = collaborators[user.id]
  
  if (userCollaborator) {
    if (typeof userCollaborator === 'string') {
      userRole.value = userCollaborator
      accessLevel.value = userCollaborator === 'admin' ? 999 : 1
    } else {
      userRole.value = userCollaborator.role || 'invited'
      accessLevel.value = userCollaborator.accessLevel || 1
    }
  } else {
    toast.error('You do not have access to this test')
    router.push('/dashboard')
  }
}

const navItems = computed(() => {
  const allItems = [
    {
      title: 'Manager',
      icon: 'mdi-home',
      path: `/accessibility/manual/${testId.value}/${testId.value}`,
      requiresAdmin: true
    },
    {
      title: 'Config',
      icon: 'mdi-cog',
      path: `/accessibility/manual/${testId.value}/config/${testId.value}`,
      requiresAdmin: true
    },
    {
      title: 'Edit Study',
      icon: 'mdi-pencil',
      path: `/accessibility/manual/${testId.value}/edit/${testId.value}`,
      requiresAdmin: true
    },
    {
      title: 'Preview',
      icon: 'mdi-clipboard-check',
      path: `/accessibility/manual/${testId.value}/preview/${testId.value}`,
      requiresAdmin: false
    },
    {
      title: 'Answers',
      icon: 'mdi-order-bool-ascending-variant',
      path: `/accessibility/manual/${testId.value}/result/${testId.value}`,
      requiresAdmin: true
    },
    {
      title: 'Cooperator',
      icon: 'mdi-account-group',
      path: `/accessibility/manual/${testId.value}/cooperative/${testId.value}`,
      requiresAdmin: true
    },
  ]
  
  if (accessLevel.value === 999) {
    return allItems
  } else {
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
  fetchTestData()
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
