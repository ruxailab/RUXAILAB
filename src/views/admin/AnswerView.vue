<template>
  <div>
    <!-- checking whether to show heuristics answer sheet or user answer sheet-->
    <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsTestAnswer />
    </div>
    <div v-else>
      user
    </div>
  </div>
</template>

<script>
import HeuristicsTestAnswer from '@/components/organisms/HeuristicsTestAnswer.vue'
export default {
  components: {
    HeuristicsTestAnswer,
  },

  computed: {
    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
  },
}


</script>

<style></style>
