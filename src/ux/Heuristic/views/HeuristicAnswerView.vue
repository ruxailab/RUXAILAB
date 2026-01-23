<template>
  <PageWrapper
    :title="hasTestAnswerDocument ? 'Answers' : ''"
    :side-gap="true"
  >
    <template #subtitle v-if="hasTestAnswerDocument && !isRecovering">
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('analytics.overallAnalyticsDescription') }}
      </p>
    </template>

    <div v-if="isRecovering" class="d-flex justify-center pa-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <span class="ms-3">{{ $t('common.loading') || 'Loading answers...' }}</span>
    </div>

    <template v-else>
      <div v-if="hasTestAnswerDocument">
        <HeuristicsTestAnswer />
      </div>
      
      <div v-else class="text-center pa-10">
         <v-icon size="64" color="grey-lighten-1">mdi-database-off</v-icon>
         <p class="mt-4 grey--text">{{ $t('common.noData') || 'No data found for this evaluation.' }}</p>
      </div>
    </template>
  </PageWrapper>
</template>

<script setup>
import HeuristicsTestAnswer from '@/ux/Heuristic/components/HeuristicsTestAnswer.vue'
import { computed, onMounted, ref } from 'vue'; // Essential imports
import { useStore } from 'vuex';
import { useRoute } from 'vue-router'; // Essential for URL recovery
import PageWrapper from '@/shared/views/template/PageWrapper.vue';
import { useI18n } from 'vue-i18n';

const store = useStore()
const route = useRoute()
const { t } = useI18n();

const isRecovering = ref(false);

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument?.heuristicAnswers || {})
const hasTestAnswerDocument = computed(() => {
  return testAnswerDocument.value && Object.keys(testAnswerDocument.value).length > 0
})

onMounted(async () => {
  const testId = route.params.id;
  
  if (!hasTestAnswerDocument.value && testId) {
    isRecovering.value = true;
    try {
      await store.dispatch('Answer/getTestAnswerDocument', testId);
    } catch (error) {
      console.error("Failed to recover heuristic answers on refresh:", error);
    } finally {
      isRecovering.value = false;
    }
  }
});
</script>