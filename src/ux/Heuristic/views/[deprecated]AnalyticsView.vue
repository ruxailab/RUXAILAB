<template>
  <div>
    
    <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsAnalytics />
    </div>
    <div v-else>
      <UserAnalytics />
    </div>
  
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import HeuristicsAnalytics from '@/ux/Heuristic/components/HeuristicsAnalytics.vue';
import UserAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/UserAnalytics.vue';

const store = useStore();

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument);

onMounted(async () => {
  await store.dispatch('getCurrentTestAnswerDoc');
});
</script>
