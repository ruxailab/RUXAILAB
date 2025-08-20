<template>
  <ManagerLayout :header-title="$t('accessibility.title')" :header-subtitle="$t('accessibility.subtitle')">
    <template #cards>
      <p class="presentation-text text-center text-md-left mb-4">
        {{ $t('accessibility.description') }}
      </p>
      <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
    </template>
  </ManagerLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import CardsManager from '@/components/atoms/CardsManager';
import ManagerLayout from '@/components/layouts/ManagerLayout.vue';

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
/* Keep only unique styles specific to AccessibilityHome */
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