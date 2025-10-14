<template>
  <!-- Loading overlay -->
  <v-overlay v-model="isLoading" contained class="align-center justify-center">
    <div class="text-center">
      <v-progress-circular indeterminate size="64" color="primary" />
      <div class="mt-4 text-h6">Loading test data...</div>
      <div class="text-caption">Checking access permissions</div>
    </div>
  </v-overlay>

  <div v-if="!isLoading">
    <!-- Manager-style Header (uses same image as ManagerView) -->
    <div class="h-64">
      <ManagerBanner />
    </div>
    <v-container class="card-container pt-6 pb-10">
      <!-- Access level indicator -->
      <div v-if="userRole" class="mb-2 text-caption text-grey">
        Access: {{ getAccessLevelText }}
      </div>
      
      <p class="presentation-text text-center text-md-left mb-4">
        Browse accessibility tools and actions
      </p>
      <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useStore } from 'vuex'
import CardsManager from '@/shared/components/CardsManager'
import ManagerBanner from '@/shared/components/ManagerBanner.vue'
import { INTRO_IMAGES } from '@/shared/constants/theme'
import { useAccessibilityAccess } from '@/ux/accessibility/composables/useAccessibilityAccess.js'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { mdAndUp } = useDisplay()
const testId = ref(route.params.id || '')

// Use the accessibility access control composable
const { 
  userRole, 
  isLoading, 
  fetchAccessData, 
  getAccessLevelText 
} = useAccessibilityAccess()

// Fetch data on mount
onMounted(async () => {
  await fetchAccessData(testId.value)
})
//commit 

// Direct navigation items implementation
const navItems = computed(() => [
  {
    title: 'Home',
    icon: 'mdi-home',
    path: `/accessibility/automatic/manager/${testId.value}`,
  },
  {
    title: 'Analyse',
    icon: 'mdi-chart-line',
    path: `/accessibility/automatic/analyse/${testId.value}`,
  },
  {
    title: 'Answers',
    icon: 'mdi-help-circle',
    path: `/accessibility/automatic/answers/${testId.value}`,
  },
  {
    title: 'Report',
    icon: 'mdi-file-document',
    path: `/accessibility/automatic/reports/${testId.value}`,
  },
  {
    title: 'Settings',
    icon: 'mdi-cog',
    path: `/accessibility/automatic/settings/${testId.value}`,
  },
])

// Image mappings
const imageMap = {
  home: INTRO_IMAGES.ANALYTICS,
  analyse: INTRO_IMAGES.ANALYTICS,
  answers: INTRO_IMAGES.ANSWER,
  report: INTRO_IMAGES.REPORTS,
  settings: INTRO_IMAGES.EDIT,
}

// Navigation descriptions
const getDescription = (title) => {
  const descriptions = {
    Home: 'Main dashboard overview and statistics',
    Analyse: 'Run comprehensive accessibility analysis',
    Answers: 'Manage Q&A responses and feedback',
    Report: 'Generate detailed reports and insights',
    Settings: 'Configure preferences and options',
  }
  return descriptions[title] || 'Navigate to this section'
}

const managerCards = computed(() =>
  navItems.value.map((item) => ({
    image: imageMap[item.title.toLowerCase()] || INTRO_IMAGES.MANAGER,
    title: item.title,
    titleDirect: item.title,
    imageStyle: '',
    bottom: '#000',
    description: getDescription(item.title),
    descriptionDirect: getDescription(item.title),
    cardStyle: '',
    path: item.path,
  })),
)


const go = (path) => {
  router.push(path).catch(() => { })
}
</script>
