<template>
  <PageWrapper
    :title="hasAnswers ? $t('titles.answers') : ''"
    :side-gap="true"
  >
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
import { computed } from 'vue';
import { useStore } from 'vuex';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';
import UserTestAnswer from '../components/UserTestAnswer.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore()

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {})

// Evaluar si hay respuestas disponibles
const hasAnswers = computed(() => {
  return testAnswerDocument.value.taskAnswers && 
         testAnswerDocument.value.taskAnswers !== null &&
         (Array.isArray(testAnswerDocument.value.taskAnswers) ? 
          testAnswerDocument.value.taskAnswers.length > 0 : 
          Object.keys(testAnswerDocument.value.taskAnswers).length > 0)
})
</script>

<style></style>
