<template>

    <!-- Manager-style Header (uses same image as ManagerView) -->
    <div class="h-64">
      <ManagerBanner />
    </div>
    <v-container class="card-container pt-6 pb-10">
      <p class="presentation-text text-center text-md-left mb-4">
        Browse accessibility tools and actions
      </p>
      <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
    </v-container>
  
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import CardsManager from '@/shared/components/CardsManager'
import ManagerBanner from '@/shared/components/ManagerBanner.vue'
import { INTRO_IMAGES } from '@/shared/constants/theme'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const testId = ref(route.params.id || '')
//commit 

// Direct navigation items implementation
const navItems = computed(() => [
  {
    title: 'Home',
    icon: 'mdi-home',
    path: `/accessibility/automatic/${testId.value}`,
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
  settings: INTRO_IMAGES.COOPS,
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
    image: imageMap[item.title.toLowerCase()] || 'IntroManager.svg',
    title: item.title,
    titleDirect: item.title,
    imageStyle: '',
    bottom: '#000',
    description: item.title,
    descriptionDirect: getDescription(item.title),
    cardStyle: '',
    path: item.path,
  })),
)


const go = (path) => {
  router.push(path).catch(() => { })
}
</script>
