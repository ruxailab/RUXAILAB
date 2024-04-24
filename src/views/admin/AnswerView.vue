<template>
  <div>
    <!-- checking whether to show heuristics answer sheet or user answer sheet-->
    <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsTestAnswer />
    </div>
    <div v-else>
      <UserTestAnswer />
    </div>
  </div>
</template>

<script>
import HeuristicsTestAnswer from '@/components/organisms/HeuristicsTestAnswer.vue'
import UserTestAnswer from '@/components/organisms/UserTestAnswer.vue'
export default {
  components: {
    HeuristicsTestAnswer,
    UserTestAnswer,
  },

  computed: {
    showFinalResult() {
      return finalResult()
    },
    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
  },
}
</script>

<style></style>
