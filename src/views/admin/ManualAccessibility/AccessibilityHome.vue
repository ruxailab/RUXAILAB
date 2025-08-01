<template>
  <v-app>
    <v-main>
      <v-container fluid class="dashboard-container">
        <!-- Dashboard Cards -->
        <v-row class="dashboard-grid" no-gutters>
          <v-col v-for="(card, index) in cards" :key="index" cols="12" sm="6" md="4" lg="3" xl="2" class="pa-2">
            <v-card class="dashboard-card" elevation="2" rounded="xl" hover
              :style="{ 'animation-delay': `${index * 100}ms` }" @click="$router.push(card.route)">
              <v-card-text class="card-content">
                <div class="card-header mb-3">
                  <div class="icon-container" :class="`icon-${card.title.toLowerCase()}`">
                    <v-icon :size="28" class="card-icon" color="white">
                      {{ card.icon }}
                    </v-icon>
                  </div>
                </div>

                <div class="card-body">
                  <h4 class="text-h6 font-weight-bold mb-2 card-title">
                    {{ card.title }}
                  </h4>
                  <p class="text-body-2 text-medium-emphasis mb-2 card-subtitle">
                    {{ card.subtitle }}
                  </p>
                  <p class="text-caption text-medium-emphasis card-description">
                    {{ card.description }}
                  </p>
                </div>

                <div class="card-footer mt-3">
                  <v-btn variant="text" size="small" class="card-action-btn" :ripple="false">
                    Open
                    <v-icon size="14" class="ml-1">
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
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const testId = ref(route.params.testId || '');

const cardData = [
  { title: 'Home', icon: 'mdi-home-variant', subtitle: 'Dashboard overview', description: 'Access your main dashboard with overview of all accessibility activities and metrics.', route: '' },
  { title: 'Config', icon: 'mdi-cog-outline', subtitle: 'Configuration settings', description: 'Configure and manage accessibility test settings, preferences, and system configurations.', route: `/config/${testId.value}` },
  { title: 'Edit', icon: 'mdi-pencil-outline', subtitle: 'Create and modify tests', description: 'Design and customize accessibility tests for your application with advanced editing tools.', route: `/edit/${testId.value}` },
  { title: 'Preview', icon: 'mdi-eye-outline', subtitle: 'Preview tests', description: 'Preview your accessibility tests before deployment and review test configurations.', route: `/preview/${testId.value}` },
  { title: 'Answer', icon: 'mdi-comment-question-outline', subtitle: 'View test responses', description: 'Check and analyze the responses submitted for accessibility tests and evaluations.', route: `/result/${testId.value}` },
  { title: 'Cooperator', icon: 'mdi-account-multiple-outline', subtitle: 'Share test', description: 'Share your accessibility tests with collaborators for feedback and review.', route: `/cooperative/${testId.value}` },
];

const cards = ref(cardData);
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

/* Dashboard Cards */
.dashboard-grid {
  animation: fadeInUp 0.6s ease-out;
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
</style>