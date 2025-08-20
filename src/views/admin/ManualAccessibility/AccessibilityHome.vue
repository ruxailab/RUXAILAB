<template>
  <v-app>
    <v-main>
      <!-- Manager-style Header (uses same image as ManagerView) -->
      <v-row align="center" justify="center" class="manager-bg back-gradient pa-6">
        <v-col cols="12" md="6" class="text-white text-center text-md-left">
          <p class="font-weight-medium text-h4 text-md-h2">
            {{ $t('accessibility.title') }}
          </p>
          <p class="text-subtitle-1 text-md-subtitle-1">
            {{ $t('accessibility.subtitle') }}
          </p>
        </v-col>

        <v-col cols="12" md="6" class="d-flex justify-center">
          <v-img :src="require('@/assets/manager/IntroManager.svg')" max-height="300" max-width="100%" />
        </v-col>
      </v-row>

      <!-- Cards section using CardsManager so it matches ManagerView UI -->
      <v-container class="card-container pt-6 pb-10">
        <p class="presentation-text text-center text-md-left mb-4">
          {{ $t('accessibility.description') }}
        </p>
        <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import CardsManager from '@/components/atoms/CardsManager';

const route = useRoute();
const router = useRouter();
const { mdAndUp } = useDisplay();
const { t } = useI18n();
const testId = ref(route.params.testId || '');

const cardData = [
  {
    title: t('titles.manager'),
    icon: 'mdi-home-variant',
    subtitle: t('descriptions.edit'),
    description: t('descriptions.edit'),
    route: '',
    image: 'IntroEdit.svg',
    imageStyle: '',
    cardStyle: 'background-image: radial-gradient(circle at top right, #6366f1, #8b5cf6); overflow: hidden'
  },
  {
    title: t('titles.test'),
    icon: 'mdi-cog-outline',
    subtitle: t('accessibility.cards.config.subtitle'),
    description: t('accessibility.cards.config.description'),
    route: `/config/${testId.value}`,
    image: 'IntroCoops.svg',
    imageStyle: '',
    cardStyle: 'background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden'
  },
  {
    title: t('titles.test'),
    icon: 'mdi-pencil-outline',
    subtitle: t('descriptions.edit'),
    description: t('accessibility.cards.edit.description'),
    route: `/edit/${testId.value}`,
    image: 'IntroEdit.svg',
    imageStyle: 'transform: rotateY(180deg);',
    cardStyle: 'background-image: radial-gradient(circle at top right, #d128c9, #9a1aab); overflow: hidden'
  },
  {
    title: t('titles.preview'),
    icon: 'mdi-eye-outline',
    subtitle: t('descriptions.reports'),
    description: t('descriptions.reports'),
    route: `/preview/${testId.value}`,
    image: 'IntroReports.svg',
    imageStyle: 'height: 250px',
    cardStyle: 'background-image: radial-gradient(circle at top right, #FF3C00, #FF0000); overflow: hidden'
  },
  {
    title: t('titles.answers'),
    icon: 'mdi-comment-question-outline',
    subtitle: t('descriptions.answers'),
    description: t('descriptions.answers'),
    route: `/result/${testId.value}`,
    image: 'IntroAnswer.svg',
    imageStyle: 'height: 250px',
    cardStyle: 'background-image: radial-gradient(circle at top right, #9ac94f, #7eb543); overflow: hidden'
  },
  {
    title: t('titles.cooperators'),
    icon: 'mdi-account-multiple-outline',
    subtitle: t('descriptions.cooperators'),
    description: t('descriptions.cooperators'),
    route: `/cooperative/${testId.value}`,
    image: 'IntroCoops.svg',
    imageStyle: '',
    cardStyle: 'background-image: radial-gradient(circle at top right, #06b6d4, #0891b2); overflow: hidden'
  },
];

const cards = ref(cardData);

const managerCards = computed(() =>
  cards.value.map((c) => ({
    image: c.image,
    title: c.title,
    titleDirect: (c.title || '').toString(),
    imageStyle: c.imageStyle || '',
    bottom: '#000',
    description: c.subtitle || c.description,
    descriptionDirect: (c.subtitle || c.description || '').toString(),
    cardStyle: c.cardStyle || '',
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