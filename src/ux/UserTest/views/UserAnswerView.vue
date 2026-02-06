<template>
  <!-- Loading overlay to prevent FOUC -->
  <v-overlay v-if="isLoading" :model-value="true" class="d-flex align-center justify-center">
    <v-progress-circular indeterminate color="primary" size="64" />
  </v-overlay>

  <PageWrapper v-else :title="hasAnswers ? $t('titles.answers') : ''" :side-gap="true">
    <!-- Subtitle Slot -->
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('analytics.overallAnalyticsDescription') }}
      </p>
    </template>
    <div v-if="testAnswerDocument">
      <UserTestAnswer />
    </div>
  </PageWrapper>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import UserTestAnswer from '../components/UserTestAnswer.vue'
import { useStudyAccess } from '@/shared/composables/useStudyAccess'

const store = useStore()

// Access control - Admin, Evaluator, and Owner can access answers
const { watchAccessAndRedirect, isLoading } = useStudyAccess({
  routeType: 'answer',
  redirectPath: '/',
})

const testAnswerDocument = computed(
  () => store.state.Answer.testAnswerDocument || {},
)

// Evaluar si hay respuestas disponibles
const hasAnswers = computed(() => {
  return (
    testAnswerDocument.value.taskAnswers &&
    testAnswerDocument.value.taskAnswers !== null &&
    (Array.isArray(testAnswerDocument.value.taskAnswers)
      ? testAnswerDocument.value.taskAnswers.length > 0
      : Object.keys(testAnswerDocument.value.taskAnswers).length > 0)
  )
})

onMounted(() => {
  watchAccessAndRedirect()
})
</script>

<style></style>

