<template>
  <ManagerLayout :header-title="$t('accessibility.title')" :header-subtitle="$t('accessibility.subtitle')">
    <template #cards>
      <p class="presentation-text text-center text-md-left mb-4">
        {{ $t('accessibility.description') }}
      </p>
      <CardsManager :cards="managerCards" :per-row="responsive.gridSize" @click="go" />
    </template>
  </ManagerLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import CardsManager from '@/components/atoms/CardsManager';
import ManagerLayout from '@/components/layouts/ManagerLayout.vue';
import { useManagerCards } from '@/composables/useManagerCards';
import { createCard } from '@/utils/cardConfig';

const route = useRoute();
const { managerCards, responsive, go, setCards, t } = useManagerCards();

const testId = route.params.testId || '';

onMounted(() => {
  const cardData = [
    createCard('MANAGER', {
      title: t('titles.manager'),
      icon: 'mdi-home-variant',
      subtitle: t('descriptions.edit'),
      description: t('descriptions.edit'),
      route: '',
    }),
    createCard('CONFIG', {
      title: t('titles.test'),
      icon: 'mdi-cog-outline',
      subtitle: t('accessibility.cards.config.subtitle'),
      description: t('accessibility.cards.config.description'),
      route: `/config/${testId}`,
    }),
    createCard('EDIT', {
      title: t('titles.test'),
      icon: 'mdi-pencil-outline',
      subtitle: t('descriptions.edit'),
      description: t('accessibility.cards.edit.description'),
      route: `/edit/${testId}`,
    }),
    createCard('REPORTS', {
      title: t('titles.preview'),
      icon: 'mdi-eye-outline',
      subtitle: t('descriptions.reports'),
      description: t('descriptions.reports'),
      route: `/preview/${testId}`,
    }),
    createCard('ANSWERS', {
      title: t('titles.answers'),
      icon: 'mdi-comment-question-outline',
      subtitle: t('descriptions.answers'),
      description: t('descriptions.answers'),
      route: `/result/${testId}`,
    }),
    createCard('COOPERATORS', {
      title: t('titles.cooperators'),
      icon: 'mdi-account-multiple-outline',
      subtitle: t('descriptions.cooperators'),
      description: t('descriptions.cooperators'),
      route: `/cooperative/${testId}`,
    }),
  ];

  setCards(cardData);
});
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