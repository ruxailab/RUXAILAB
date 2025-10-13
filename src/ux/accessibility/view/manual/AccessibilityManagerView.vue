<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 400px;">
    <v-progress-circular indeterminate color="primary" :size="50"></v-progress-circular>
  </div>
  <ManagerView 
    v-else
    :navigator="filteredNavItems"
    :top-cards="topCards"
    :bottom-cards="bottomCards"
  >
  </ManagerView>
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
  return getAccessibilityNavigator(test.value, userRole.value, route, 'accessibility/manual')
})

const topCards = computed(() => {
  return getAccessibilityTopCards(test.value, userRole.value, 'accessibility/manual')
})

const bottomCards = computed(() => {
  return getAccessibilityBottomCards(test.value, userRole.value, 'accessibility/manual')
})

onMounted(async () => {
  await fetchAccessData(testId.value)
  console.log('User role determined:', userRole.value)
  // Home page is accessible to all users (admin and cooperators)
  // The page will show filtered content based on user role
})
</script>
