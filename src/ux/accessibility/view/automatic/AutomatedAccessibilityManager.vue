<template>
  <ManagerView
    :navigator="filteredNavItems"
    :top-cards="topCards"
    :bottom-cards="bottomCards"
  >
    <!-- Loading overlay -->
    <v-overlay
      v-model="isLoading"
      contained
      class="align-center justify-center"
    >
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
import { useStore } from 'vuex'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { useAccessibilityAccess } from '@/ux/accessibility/composables/useAccessibilityAccess.js'
import {
  getAccessibilityNavigator,
  getAccessibilityTopCards,
  getAccessibilityBottomCards,
} from '@/shared/utils/managerDefault.js'

const route = useRoute()
const router = useRouter()
const store = useStore()
const testId = ref(route.params.id || '')

// Use the accessibility access control composable
const { userRole, isLoading, fetchAccessData, getAccessLevelText } =
  useAccessibilityAccess()

// Get test data from store
const test = computed(() => store.getters.test)

// Use centralized navigation and cards from managerDefault
const filteredNavItems = computed(() => {
  return getAccessibilityNavigator(
    test.value,
    userRole.value,
    route,
    'accessibility/automatic',
  )
})

const topCards = computed(() => {
  return getAccessibilityTopCards(
    test.value,
    userRole.value,
    'accessibility/automatic',
  )
})

const bottomCards = computed(() => {
  return getAccessibilityBottomCards(
    test.value,
    userRole.value,
    'accessibility/automatic',
  )
})

onMounted(async () => {
  await fetchAccessData(testId.value)

  // Redirect non-admin users trying to access manager page
  if (
    userRole.value !== 'admin' &&
    route.path === `/accessibility/automatic/${testId.value}`
  ) {
    router.push(`/accessibility/automatic/reports/${testId.value}`)
  }
})
</script>
