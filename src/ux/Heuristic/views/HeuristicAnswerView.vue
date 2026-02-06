<template>
  <!-- Loading overlay to prevent FOUC -->
  <v-overlay v-if="isLoading" :model-value="true" class="d-flex align-center justify-center">
    <v-progress-circular indeterminate color="primary" size="64" />
  </v-overlay>

  <PageWrapper v-else :title="hasTestAnswerDocument ? 'Answers' : ''" :side-gap="true">
    <!-- Subtitle Slot -->
    <template v-if="hasTestAnswerDocument" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('analytics.overallAnalyticsDescription') }}
      </p>
    </template>
    <!-- checking whether to show heuristics answer sheet or user answer sheet-->
    <div v-if="testAnswerDocument">
      <HeuristicsTestAnswer />
    </div>
  </PageWrapper>
</template>

<script setup>
import HeuristicsTestAnswer from '@/ux/Heuristic/components/HeuristicsTestAnswer.vue'
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { useI18n } from 'vue-i18n'
import { useStudyAccess } from '@/shared/composables/useStudyAccess'

const store = useStore()
const { t } = useI18n()

// Access control - Admin and Evaluator can view answers
const { watchAccessAndRedirect, isLoading } = useStudyAccess({
  routeType: 'answer',
  redirectPath: '/',
})

const testAnswerDocument = computed(
  () => store.state.Answer.testAnswerDocument?.heuristicAnswers || {},
)
const hasTestAnswerDocument = computed(() => {
  return (
    testAnswerDocument.value && Object.keys(testAnswerDocument.value).length > 0
  )
})

onMounted(() => {
  watchAccessAndRedirect()
})
</script>

<style></style>
