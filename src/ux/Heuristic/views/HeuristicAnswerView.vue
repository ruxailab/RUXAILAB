<template>
  <PageWrapper
    :title="hasAnswers ? 'Answers' : ''"
    :side-gap="true"
  >
    <!-- Subtitle Slot -->
    <template v-if="hasAnswers" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('analytics.overallAnalyticsDescription') }}
      </p>
    </template>
    <!-- Show HeuristicsTestAnswer when document is loaded (it handles empty state internally) -->
    <div v-if="isDocumentLoaded">
      <HeuristicsTestAnswer />
    </div>
    <!-- Loading state while document is being fetched -->
    <div v-else-if="loading" class="d-flex justify-center align-center" style="min-height: 300px">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>
  </PageWrapper>
</template>

<script setup>
import HeuristicsTestAnswer from '@/ux/Heuristic/components/HeuristicsTestAnswer.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

// Check if the document exists in store (even if empty)
const isDocumentLoaded = computed(() => store.state.Answer.testAnswerDocument !== null)

// Check if there are actual answers
const hasAnswers = computed(() => {
  const doc = store.state.Answer.testAnswerDocument
  return doc && doc.heuristicAnswers && Object.keys(doc.heuristicAnswers).length > 0
})

// Loading state from store
const loading = computed(() => store.state.loading)
</script>

<style></style>
