<template>
  <PageWrapper :title="hasAnswers ? $t('titles.answers') : ''" :side-gap="true">
    <!-- Subtitle Slot -->
    <template v-if="hasAnswers" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('analytics.overallAnalyticsDescription') }}
      </p>
    </template>
    <!-- Show UserTestAnswer when document is loaded (it handles empty state internally) -->
    <div v-if="isDocumentLoaded">
      <UserTestAnswer />
    </div>
    <!-- Loading state while document is being fetched -->
    <div v-else-if="loading" class="d-flex justify-center align-center" style="min-height: 300px">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>
  </PageWrapper>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import UserTestAnswer from '../components/UserTestAnswer.vue'

const store = useStore()

// Check if the document exists in store (even if empty)
const isDocumentLoaded = computed(() => store.state.Answer.testAnswerDocument !== null)

// Check if there are actual answers
const hasAnswers = computed(() => {
  const doc = store.state.Answer.testAnswerDocument
  if (!doc || !doc.taskAnswers) return false
  return Array.isArray(doc.taskAnswers)
    ? doc.taskAnswers.length > 0
    : Object.keys(doc.taskAnswers).length > 0
})

// Loading state from store
const loading = computed(() => store.state.loading)
</script>

<style></style>
