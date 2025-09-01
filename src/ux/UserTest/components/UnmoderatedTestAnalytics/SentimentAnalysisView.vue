<template>
  <div>
    <!-- User Usability Test -->
    <div v-if="testAnswerDocument.type === STUDY_TYPES.USER">
      <!-- Moderated Test -->
      <div v-if="testDocument.subType === USER_STUDY_SUBTYPES.MODERATED">
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
import UserModeratedSentiment from '@/ux/UserTest/components/sentimentAnalysis/UserModeratedSentiment.vue'
import { STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions';

const store = useStore();

const testDocument = computed(() => store.getters.test)

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)
</script>
