<template>
  <ManagerView 
    :navigator="filteredNavItems"
    :top-cards="topCards"
    :bottom-cards="bottomCards"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { useAccessibilityAccess } from '@/ux/accessibility/composables/useAccessibilityAccess.js'
import { getAccessibilityNavigator, getAccessibilityTopCards, getAccessibilityBottomCards } from '@/shared/utils/managerDefault.js'

const route = useRoute()
const router = useRouter()
const store = useStore()
const testId = ref(route.params.id || '')

// Use the accessibility access control composable
const { 
  userRole, 
  isLoading, 
  fetchAccessData, 
  getAccessLevelText 
} = useAccessibilityAccess()

// Get test data from store
const test = computed(() => store.getters.test)

// Use centralized navigation and cards from managerDefault
const filteredNavItems = computed(() => {
  return getAccessibilityNavigator(test.value, userRole.value, route, 'accessibility/aiassisted')
})

const topCards = computed(() => {
  return getAccessibilityTopCards(test.value, userRole.value, 'accessibility/aiassisted')
})

const bottomCards = computed(() => {
  return getAccessibilityBottomCards(test.value, userRole.value, 'accessibility/aiassisted')
})

onMounted(async () => {
  await fetchAccessData(testId.value)
  
  // Redirect non-admin users trying to access manager page
  if (userRole.value !== 'admin' && route.path === `/accessibility/aiassisted/manager/${testId.value}`) {
    router.push(`/accessibility/aiassisted/report/${testId.value}`)
  }
})
</script>

