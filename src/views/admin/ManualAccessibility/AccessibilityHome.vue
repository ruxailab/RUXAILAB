<template>
  <v-app>
    <v-main>
      <v-container fluid class="dashboard-container">
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
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import CardsManager from '@/components/atoms/CardsManager';

const route = useRoute();
const router = useRouter();
const { mdAndUp } = useDisplay();
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

// Map card titles to manager-style images (reuse ManagerView assets)
const imageMap = {
  home: 'IntroEdit.svg',
  config: 'IntroCoops.svg',
  edit: 'IntroEdit.svg',
  preview: 'IntroReports.svg',
  answer: 'IntroAnswer.svg',
  cooperator: 'IntroCoops.svg',
};

const managerCards = computed(() =>
  cards.value.map((c) => ({
    image: imageMap[c.title.toLowerCase()] || 'IntroEdit.svg',
    title: c.title,
    titleDirect: (c.title || '').toString(),
    imageStyle: '',
    bottom: '#000',
    description: c.subtitle || c.description,
    descriptionDirect: (c.subtitle || c.description || '').toString(),
    cardStyle: '',
    path: c.route,
  }))
);

const go = (path) => {
  router.push(path).catch(() => { });
};
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

/* Manager Header */
.manager-bg {
  height: 100%;
  margin: 0 !important;
}

/* Dashboard Cards */
.card-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.presentation-text {
  font-weight: 500;
  font-size: 1.125rem;
  margin-bottom: 1rem;
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