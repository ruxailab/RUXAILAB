<template>
  <PageWrapper
    title="Answers"
    :side-gap="true"
  >
    <!-- Subtitle Slot -->
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        View the overall analytics of your study
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
import { computed } from 'vue';
import { useStore } from 'vuex';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';

const store = useStore()

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {})
</script>

<style></style>
