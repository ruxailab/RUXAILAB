<template>
  <v-app>
    <v-main>
      <v-container
        fluid
        class="dashboard-container"
      >
        <!-- Welcome Banner -->
        <v-card
          class="welcome-banner mb-8"
          elevation="0"
          rounded="xl"
        >
          <v-card-text class="pa-8">
            <v-row
              align="center"
              no-gutters
            >
              <v-col
                cols="12"
                md="8"
              >
                <div class="welcome-content">
                  <h1 class="display-main font-weight-bold text-primary mb-3">
                    Welcome Back!
                  </h1>
                  <h2
                    class="text-h5 text-medium-emphasis mb-4 font-weight-regular"
                  >
                    Here's what's happening with your dashboard today
                  </h2>
                  <p class="text-body-1 text-medium-emphasis mb-0">
                    Monitor your analytics, manage reports, and stay on top of
                    your data insights with our comprehensive dashboard.
                  </p>
                </div>
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="text-center"
              >
                <div class="welcome-icon-container">
                  <v-icon
                    size="100"
                    class="welcome-icon"
                  >
                    mdi-view-dashboard-variant
                  </v-icon>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Dashboard Stats Overview -->
        <v-row class="mb-6">
          <v-col cols="12">
            <h3 class="text-h4 font-weight-bold mb-6 text-center">
              Dashboard Overview
            </h3>
          </v-col>
        </v-row>

        <!-- Dashboard Navigation Cards -->
        <v-row class="dashboard-grid">
          <v-col
            v-for="(item, index) in navItems"
            :key="item.title"
            cols="12"
            sm="6"
            md="4"
            lg="2.4"
          >
            <v-card
              class="dashboard-card"
              elevation="0"
              rounded="xl"
              hover
              :style="{ 'animation-delay': `${index * 100}ms` }"
              @click="navigateTo(item.title)"
            >
              <v-card-text class="card-content">
                <div class="card-header mb-4">
                  <div
                    class="icon-container"
                    :class="`icon-${item.title.toLowerCase()}`"
                  >
                    <v-icon
                      :size="32"
                      class="card-icon"
                      color="white"
                    >
                      {{ item.icon }}
                    </v-icon>
                  </div>
                </div>

                <div class="card-body">
                  <h4 class="text-h6 font-weight-bold mb-2 card-title">
                    {{ item.title }}
                  </h4>
                  <p class="text-body-2 text-medium-emphasis card-description">
                    {{ getDescription(item.title) }}
                  </p>
                </div>

                <div class="card-footer mt-4">
                  <v-btn
                    variant="text"
                    size="small"
                    class="card-action-btn"
                    :ripple="false"
                  >
                    Open
                    <v-icon
                      size="16"
                      class="ml-1"
                    >
                      mdi-arrow-right
                    </v-icon>
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
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
</script>

<style scoped>
/* Main Container */
.dashboard-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2rem 1rem;
}

/* Welcome Banner */
.welcome-banner {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  animation: slideInLeft 0.8s ease-out;
}

.welcome-icon-container {
  animation: slideInRight 0.8s ease-out;
}

.welcome-icon {
  color: rgba(102, 126, 234, 0.3);
  animation: float 3s ease-in-out infinite;
}

/* Dashboard Cards */
.dashboard-grid {
  animation: fadeInUp 0.6s ease-out;
}

.dashboard-card {
  background: rgba(237, 237, 237, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  height: 100%;
  opacity: 0;
  animation: cardSlideIn 0.6s ease-out forwards;
}

.dashboard-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 1);
}

.card-content {
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: center;
}

.icon-container {
  width: 64px;
  height: 64px;
  border-radius: 16px;
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
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: inherit;
}

.icon-home {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.icon-analyse {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.icon-answers {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.icon-report {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.icon-settings {
  background: linear-gradient(135deg, #fa709a, #fee140);
}

.card-icon {
  position: relative;
  z-index: 1;
}

.card-body {
  flex: 1;
  text-align: center;
}

.card-title {
  color: #2c3e50;
}

.card-description {
  line-height: 1.5;
}

.card-footer {
  text-align: center;
}

.card-action-btn {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.dashboard-card:hover .card-action-btn {
  opacity: 1;
  transform: translateY(0);
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

/* Responsive Design */
@media (max-width: 960px) {
  .dashboard-container {
    padding: 1rem 0.5rem;
  }

  .welcome-banner .pa-8 {
    padding: 1.5rem !important;
  }

  .display-main{
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
