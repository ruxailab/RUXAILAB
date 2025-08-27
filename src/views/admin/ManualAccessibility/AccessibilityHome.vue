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
      route: `/accessibility/manual/${testId}`,
    }),
    createCard('CONFIG', {
      title: t('titles.test'),
      icon: 'mdi-cog-outline',
      subtitle: t('accessibility.cards.config.subtitle'),
      description: t('accessibility.cards.config.description'),
      route: `/accessibility/manual/config/${testId}`,
    }),
    createCard('EDIT', {
      title: t('titles.test'),
      icon: 'mdi-pencil-outline',
      subtitle: t('descriptions.edit'),
      description: t('accessibility.cards.edit.description'),
      route: `/accessibility/manual/edit/${testId}`,
    }),
    createCard('REPORTS', {
      title: t('titles.preview'),
      icon: 'mdi-eye-outline',
      subtitle: t('descriptions.reports'),
      description: t('descriptions.reports'),
      route: `/accessibility/manual/preview/${testId}`,
    }),
    createCard('ANSWERS', {
      title: t('titles.answers'),
      icon: 'mdi-comment-question-outline',
      subtitle: t('descriptions.answers'),
      description: t('descriptions.answers'),
      route: `/accessibility/manual/result/${testId}`,
    }),
    createCard('COOPERATORS', {
      title: t('titles.cooperators'),
      icon: 'mdi-account-multiple-outline',
      subtitle: t('descriptions.cooperators'),
      description: t('descriptions.cooperators'),
      route: `/accessibility/manual/cooperative/${testId}`,
    }),
  ];

  setCards(cardData);
});
</script>

<style scoped>
/* Component-specific styles if needed in the future */
</style>