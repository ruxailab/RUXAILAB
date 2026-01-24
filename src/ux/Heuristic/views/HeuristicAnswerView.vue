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
        <v-alert type="success" variant="tonal" class="mt-4">
          State Recovered Successfully (Mock Data)
        </v-alert>
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
import { computed, onMounted, ref } from 'vue'; 
import { useStore } from 'vuex';
import { useRoute } from 'vue-router'; 
import PageWrapper from '@/shared/views/template/PageWrapper.vue';
import { useI18n } from 'vue-i18n';

const store = useStore()
const route = useRoute()
const { t } = useI18n();

const isRecovering = ref(false);

// 3. MOCK DATA: This ensures the page isn't blank for the recording
const testAnswerDocument = computed(() => {
  return { 
    "demo_q1": { answer: 4, comment: "Solution verified." },
    "demo_q2": { answer: 5, comment: "Terminal is silent." }
  }
})

const hasTestAnswerDocument = computed(() => {
  return testAnswerDocument.value && Object.keys(testAnswerDocument.value).length > 0
})

onMounted(async () => {
  const testId = route.params.id;
  
  // 4. THE DELAY: This gives you time to show the spinner in your recording
  isRecovering.value = true;
  console.log("Simulating state recovery for test:", testId);
  
  try {
    // Artificial 2-second wait so Marc can see the spinner
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.error("Recovery failed:", error);
  } finally {
    isRecovering.value = false;
  }
});
</script>