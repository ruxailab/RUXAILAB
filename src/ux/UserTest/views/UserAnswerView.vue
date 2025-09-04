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

const store = useStore()

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {})
</script>

<style></style>
