<template>
  <ManagerLayout header-title="Accessibility" header-subtitle="Manage and inspect accessibility tests">
    <template #cards>
      <p class="presentation-text text-center text-md-left mb-4">
        Browse accessibility tools and actions
      </p>
      <CardsManager :cards="managerCards" :per-row="responsive.gridSize" @click="go" />
    </template>
  </ManagerLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CardsManager from '@/components/atoms/CardsManager'
import ManagerLayout from '@/components/layouts/ManagerLayout.vue'
import { useManagerCards } from '@/composables/useManagerCards'
import { createCard } from '@/utils/cardConfig'

const route = useRoute()
const { managerCards, responsive, go, setCards } = useManagerCards()

const testId = route.params.testId || ''

onMounted(() => {
  const cardData = [
    createCard('HOME', {
      title: 'Home',
      description: 'Main dashboard overview and statistics',
      path: `/accessibility/automatic/${testId}`,
    }),
    createCard('ANALYSE', {
      title: 'Analyse',
      description: 'Run comprehensive accessibility analysis',
      path: `/analyse/${testId}`,
    }),
    createCard('ANSWERS', {
      title: 'Answers',
      description: 'Manage Q&A responses and feedback',
      path: `/answers/${testId}`,
    }),
    createCard('REPORTS', {
      title: 'Report',
      description: 'Generate detailed reports and insights',
      path: `/report/${testId}`,
    }),
    createCard('SETTINGS', {
      title: 'Settings',
      description: 'Configure preferences and options',
      path: `/settings/${testId}`,
    }),
  ]

  setCards(cardData)
})
</script>

<style scoped>
/* Minimal styles - most styling comes from ManagerLayout */
.presentation-text {
  font-weight: 500;
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: #333;
}
</style>
