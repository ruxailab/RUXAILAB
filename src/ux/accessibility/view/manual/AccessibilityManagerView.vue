<template>
  <ManagerView 
    :navigator="filteredNavItems"
    :top-cards="[]"
    :bottom-cards="[]"
  >
    <!-- Loading overlay -->
    <v-overlay v-model="isLoading" contained class="align-center justify-center">
      <div class="text-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <div class="mt-4 text-h6">Loading test data...</div>
        <div class="text-caption">Checking access permissions</div>
      </div>
    </v-overlay>
    
    <!-- Access level indicator -->
    <div v-if="!isLoading && userRole" class="ma-2 text-caption text-grey">
      Access: {{ getAccessLevelText }}
    </div>
  </ManagerView>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { useAccessibilityAccess } from '@/ux/accessibility/composables/useAccessibilityAccess.js'

const route = useRoute()
const router = useRouter()
const testId = ref(route.params.id || '')

// Use the accessibility access control composable
const { 
  userRole, 
  isLoading, 
  fetchAccessData, 
  getFilteredNavItems, 
  getAccessLevelText 
} = useAccessibilityAccess()

// All navigation items with admin requirements
const allNavItems = computed(() => [
  {
    title: 'Manager',
    icon: 'mdi-home',
    path: `/accessibility/manual/${testId.value}`,
    requiresAdmin: false
  },
  {
    title: 'Edit Study',
    icon: 'mdi-pencil',
    path: `/accessibility/manual/config/${testId.value}`,
    requiresAdmin: true
  },
  {
    title: 'Settings',
    icon: 'mdi-cog',
    path: `/accessibility/manual/setting/${testId.value}`,
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
])

// Filtered navigation items based on user role
const filteredNavItems = computed(() => {
  return getFilteredNavItems(allNavItems.value)
})

onMounted(async () => {
  await fetchAccessData(testId.value)
  
  // Redirect non-admin users trying to access manager page
  if (userRole.value !== 'admin' && route.path === `/accessibility/manual/${testId.value}`) {
    console.log('Non-admin user redirected to preview')
    router.push(`/accessibility/manual/preview/${testId.value}`)
  }
})
</script>
