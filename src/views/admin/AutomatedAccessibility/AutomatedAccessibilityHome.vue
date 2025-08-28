<template>
  <v-app>
    <v-main>
      <!-- Manager-style Header (uses same image as ManagerView) -->
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
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import CardsManager from '@/shared/components/CardsManager'

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
    path: `/reports/${testId.value}`,
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
:root {
  --card-bg: rgba(255, 255, 255, 0.95);
  --card-hover-bg: rgba(255, 255, 255, 1);
  --card-border: rgba(255, 255, 255, 0.2);
  --card-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  --card-padding: 1.5rem;
  --card-height: 240px;
  --icon-size: 56px;
}

/* Main Container */
.dashboard-container {
  background: #f8f9fa;
  min-height: 120vh;
  padding: 1.5rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Manager Header - */
.manager-bg {
  height: 80%;
  margin: 0 !important;
}

.back-gradient {
  height: 40vh;
  background-image: radial-gradient(circle at top right, #f6cd3d, #fca326);
}

/* Dashboard Cards - Match ManagerView styling */
.card-container {
  width: 80%;
}

.presentation-text {
  color: rgb(87, 84, 100);
  font-weight: 700;
  font-size: 22px;
  margin-bottom: 20px;
}

.dashboard-card {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  height: var(--card-height);
  opacity: 0;
  animation: cardSlideIn 0.6s ease-out forwards;
}

.dashboard-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--card-shadow);
  background: var(--card-hover-bg);
}

.card-content {
  padding: var(--card-padding);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: center;
}

.icon-container {
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.icon-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border-radius: inherit;
}

/* Animations */
@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles to match ManagerView */
@media screen and (max-width: 960px) {
  .presentation-text {
    display: flex;
    text-align: center;
    justify-content: center;
  }

  .card-container {
    width: 85%;
  }

  .back-gradient {
    height: 100%;
  }
}
</style>
