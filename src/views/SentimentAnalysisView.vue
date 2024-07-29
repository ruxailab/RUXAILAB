<template>
  <div>
    <!-- checking whether to show heuristics answer sheet or user answer sheet-->
    <!-- <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsTestAnswer />
    </div>
    <div v-else>
      <UserTestAnswer />
    </div> -->

    <!-- Audio Wave -->
    <AudioWave />

    SentimentAnalysisView :D
  </div>
</template>

<script>
// Components
import AudioWave from '@/components/molecules/AudioWave.vue'
// import HeuristicsTestAnswer from '@/components/organisms/HeuristicsTestAnswer.vue'
// import UserTestAnswer from '@/components/organisms/UserTestAnswer.vue'
export default {
  components: {
    AudioWave,
  },
}
</script>

<style></style>
