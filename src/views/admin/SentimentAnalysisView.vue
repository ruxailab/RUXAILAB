<template>
  <div>
    <!-- User Usability Test -->
    <div v-if="testAnswerDocument.type === 'User'">
      <!-- Moderated Test -->
      <div v-if="testDocument.userTestType === 'moderated'">
        <UserModeratedSentiment />
      </div>

      <!-- Un-moderated Test -->
      <div v-else>
        <h6>Sorry Sentiment Analysis isn't available for Un-moderated tests</h6>
      </div>
    </div>

    <!-- Heuristic Test -->
    <div v-else>
      <h6>Sorry Sentiment Analysis isn't available for Heuristic tests</h6>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import UserModeratedSentiment from '@/components/organisms/UserModeratedSentiment.vue'

const store = useStore();

const testDocument = computed(() => store.getters.test)

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)
</script>
