<template>
  <PageWrapper :title="hasTestAnswerDocument ? 'Answers' : ''" :side-gap="true">
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
import { computed } from 'vue'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const testAnswerDocument = computed(
  () => store.state.Answer.testAnswerDocument?.heuristicAnswers || {},
)
const hasTestAnswerDocument = computed(() => {
  return (
    testAnswerDocument.value && Object.keys(testAnswerDocument.value).length > 0
  )
})
</script>

<style></style>
