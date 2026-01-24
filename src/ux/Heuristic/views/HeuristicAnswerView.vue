<template>
  <PageWrapper
    :title="hasTestAnswerDocument ? 'Answers' : ''"
    :side-gap="true"
  >
    <template v-if="hasTestAnswerDocument && !isRecovering" #subtitle>
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
         <p class="mt-4 text-grey">{{ $t('common.noData') || 'No data found for this evaluation.' }}</p>
      </div>
    </template>
  </PageWrapper>
</template>

<script setup>
import HeuristicsTestAnswer from '@/ux/Heuristic/components/HeuristicsTestAnswer.vue'
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';

const store = useStore()
const route = useRoute()

const isRecovering = ref(false);

const testAnswerDocument = computed(() => store.getters['heuristic/testAnswerDocument'])

const hasTestAnswerDocument = computed(() => {
  return testAnswerDocument.value && Object.keys(testAnswerDocument.value).length > 0
})

onMounted(async () => {
  const testId = route.params.testId;

  if (!hasTestAnswerDocument.value && testId) {
    isRecovering.value = true;
    try {
      await store.dispatch('heuristic/getHeuristicTestAnswer', testId);
    } catch {
    } finally {
      isRecovering.value = false;
    }
  }
});
</script>