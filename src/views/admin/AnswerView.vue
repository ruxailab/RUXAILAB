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
    <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsTestAnswer />
    </div>
    <div v-else-if="testAnswerDocument">
      <UserTestAnswer />
    </div>
  </PageWrapper>
</template>

<script setup>
import HeuristicsTestAnswer from '@/components/organisms/HeuristicsTestAnswer.vue'
import UserTestAnswer from '@/components/organisms/UserTestAnswer.vue'
import PageWrapper from '@/components/template/PageWrapper.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {})
</script>

<style></style>
