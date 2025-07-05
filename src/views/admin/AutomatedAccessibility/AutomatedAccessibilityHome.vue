<template>
  <v-app>
    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <!-- Welcome Banner -->
        <v-card class="mb-8" elevation="8" rounded="lg">
          <v-card-text class="pa-8">
            <v-row align="center">
              <v-col cols="12" md="8">
                <div class="text-h3 font-weight-bold text-primary mb-2">
                  Welcome Back!
                </div>
                <div class="text-h6 text-medium-emphasis mb-4">
                  Here's what's happening with your dashboard today
                </div>
                <div class="text-body-1 text-medium-emphasis">
                  Monitor your analytics, manage reports, and stay on top of
                  your data insights.
                </div>
              </v-col>
              <v-col cols="12" md="4" class="text-center">
                <v-icon size="120" color="primary" class="opacity-20">
                  mdi-chart-line
                </v-icon>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Dashboard Cards -->
        <v-row>
          <v-col
            v-for="item in navItems"
            :key="item.title"
            cols="12"
            sm="6"
            lg="4"
            xl="2.4"
          >
            <v-card
              class="dashboard-card"
              elevation="4"
              rounded="lg"
              hover
              @click="navigateTo(item.title)"
            >
              <v-card-text class="text-center pa-6">
                <div class="card-icon-wrapper mb-4">
                  <v-icon
                    :size="48"
                    :color="
                      item.title === 'Home'
                        ? 'blue'
                        : item.title === 'Analyse'
                        ? 'green'
                        : item.title === 'Answers'
                        ? 'orange'
                        : item.title === 'Report'
                        ? 'purple'
                        : item.title === 'Settings'
                        ? 'red'
                        : 'primary'
                    "
                  >
                    {{ item.icon }}
                  </v-icon>
                </div>
                <div class="text-h6 font-weight-bold mb-2">
                  {{ item.title }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  <template v-if="item.title === 'Home'"
                    >Main dashboard overview</template
                  >
                  <template v-else-if="item.title === 'Analyse'"
                    >Run accessibility analysis</template
                  >
                  <template v-else-if="item.title === 'Answers'"
                    >Manage Q&amp;A responses</template
                  >
                  <template v-else-if="item.title === 'Report'"
                    >Generate and view reports</template
                  >
                  <template v-else-if="item.title === 'Settings'"
                    >Configure preferences</template
                  >
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

// Navigation items for the drawer and dashboard cards
const navItems = computed(() => [
  {
    title: 'Home',
    icon: 'mdi-home',
    path: `/accessibility/automatic/${testId.value}`,
  },
  {
    title: 'Analyse',
    icon: 'mdi-magnify',
    path: `/analyse/${testId.value}`,
  },
  {
    title: 'Answers',
    icon: 'mdi-comment-question',
    path: `/answers/${testId.value}`,
  },
  {
    title: 'Report',
    icon: 'mdi-chart-bar',
    path: `/report/${testId.value}`,
  },
  {
    title: 'Settings',
    icon: 'mdi-cog',
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
</script>

<style scoped>
.dashboard-card {
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.card-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(var(--v-theme-surface-variant), 0.1);
}

.v-main {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.v-card {
  backdrop-filter: blur(10px);
}

/* Custom color classes */
.text-blue {
  color: #2196f3 !important;
}

.text-green {
  color: #4caf50 !important;
}

.text-orange {
  color: #ff9800 !important;
}

.text-purple {
  color: #9c27b0 !important;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .text-h3 {
    font-size: 2rem !important;
  }

  .card-icon-wrapper {
    width: 60px;
    height: 60px;
  }
}
</style>
