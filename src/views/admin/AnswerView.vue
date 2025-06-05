<template>
  <div>
    <!-- checking whether to show heuristics answer sheet or user answer sheet-->
    <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsTestAnswer />
    </div>
    <div v-else-if="testAnswerDocument">
      <UserTestAnswer />
    </div>
  </div>
</template>

<script setup>
import HeuristicsTestAnswer from '@/components/organisms/HeuristicsTestAnswer.vue'
import UserTestAnswer from '@/components/organisms/UserTestAnswer.vue'
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {})
</script>

<style></style>
