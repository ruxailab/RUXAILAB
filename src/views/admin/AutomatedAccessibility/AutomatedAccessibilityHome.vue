<template>
  <v-app>
    <v-main>
      <v-container fluid class="dashboard-container">
        <!-- Manager-style Header (matches ManagerView/AccessibilityHome) -->
        <v-row align="center" justify="center" class="manager-bg back-gradient pa-6">
          <v-col cols="12" md="6" class="text-white text-center text-md-left">
            <p class="font-weight-medium text-h4 text-md-h2">
              Accessibility
            </p>
            <p class="text-subtitle-1 text-md-subtitle-1">
              Manage and inspect accessibility tests
            </p>
          </v-col>

          <v-col cols="12" md="6" class="d-flex justify-center">
            <v-img :src="require('@/assets/manager/IntroManager.svg')" max-height="300" max-width="100%" />
          </v-col>
        </v-row>

        <!-- Cards section using CardsManager so it matches ManagerView UI -->
        <v-container class="card-container pt-6 pb-10">
          <p class="presentation-text text-center text-md-left mb-4">
            Browse accessibility tools and actions
          </p>
          <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
        </v-container>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import CardsManager from '@/components/atoms/CardsManager'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const testId = ref(route.params.testId || '')

// Navigation items for the dashboard cards
const navItems = computed(() => [
  {
    title: 'Home',
    icon: 'mdi-home-variant',
    path: `/accessibility/automatic/${testId.value}`,
  },
  {
    title: 'Analyse',
    icon: 'mdi-chart-line-variant',
    path: `/analyse/${testId.value}`,
  },
  {
    title: 'Answers',
    icon: 'mdi-comment-question-outline',
    path: `/answers/${testId.value}`,
  },
  {
    title: 'Report',
    icon: 'mdi-file-chart-outline',
    path: `/report/${testId.value}`,
  },
  {
    title: 'Settings',
    icon: 'mdi-cog-outline',
    path: `/settings/${testId.value}`,
  },
])

// Map titles to manager-style images
const imageMap = {
  home: 'IntroAnalytics.svg',
  analyse: 'IntroAnalytics.svg',
  answers: 'IntroAnswer.svg',
  report: 'IntroReports.svg',
  settings: 'IntroCoops.svg',
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


// Methods
const navigateTo = (section) => {
  const item = navItems.value.find(
    (i) => i.title.toLowerCase() === section.toLowerCase(),
  )
  if (item) {
    router.push(item.path)
  }
}

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

const go = (path) => {
  router.push(path).catch(() => { })
}
</script>

<style scoped>
/* Main Container */
.dashboard-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2rem 1rem;
}

/* Manager-style Header */
.manager-bg {
  height: 100%;
  margin: 0 !important;
}

.back-gradient {
  height: 60vh;
  background-image: radial-gradient(circle at top right, #f6cd3d, #fca326);
}

/* Cards Section */
.card-container {
  width: 80%;
  margin: 0 auto;
}

.presentation-text {
  font-weight: 500;
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: #333;
}

/* Responsive Design */
@media (max-width: 960px) {
  .dashboard-container {
    padding: 1rem 0.5rem;
  }

  .welcome-banner .pa-8 {
    padding: 1.5rem !important;
  }

  .display-main {
    font-size: 2rem !important;
  }

  .card-content {
    padding: 1.5rem;
  }

  .icon-container {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 0.5rem;
  }

  .card-content {
    padding: 1rem;
  }
}
</style>
