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

const testId = ref(route.params.id || '')
const accessibilityDrawer = ref(null)
const drawerOpen = ref(false)
const userRole = ref(null)
const accessLevel = ref(null)
const isLoading = ref(true)

const fetchTestData = async () => {
  try {
    isLoading.value = true
    
    // Skip all authentication and access checks - allow universal access
    console.log('Skipping all access control - universal access enabled')
    
    // Set default admin access for everyone
    userRole.value = 'admin'
    accessLevel.value = 999
    
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
      requiresAdmin: false
    },
    {
      title: 'Edit Study',
      icon: 'mdi-pencil',
      path: `/accessibility/manual/edit/${testId.value}`,
      requiresAdmin: false
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
      requiresAdmin: false
    },
    {
      title: 'Cooperator',
      icon: 'mdi-account-group',
      path: `/accessibility/manual/cooperative/${testId.value}`,
      requiresAdmin: false
    },
  ]
  
  // Return all items regardless of access level
  return allItems
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
