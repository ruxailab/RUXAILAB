<template>
  <div>
    <div
      v-if="
        test.testType === 'HEURISTICS' ||
          (test.testType === 'User' && test.userTestType === 'unmoderated')
      "
    >
      <CooperatorsView />
    </div>
    <div v-if="test.testType === 'User' && test.userTestType === 'moderated'">
      <ModeratedCoopsView />
    </div>
  </div>
</template>

<script setup>
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import ModeratedCoopsView from '@/components/organisms/ModeratedCoopsView.vue'
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const test = computed(() => store.getters.test)
</script>
