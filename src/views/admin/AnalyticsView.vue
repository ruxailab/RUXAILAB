<template>
  <div>
    <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsAnalytics />
    </div>
    <div v-else>
      aaaaaaaa
    </div>
  </div>
</template>

<script>
import HeuristicsAnalytics from '@/components/organisms/HeuristicsAnalytics.vue'
export default {
  components: {
    HeuristicsAnalytics,
  },
  computed: {

    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
  },
  async created() {
    await this.$store.dispatch('getCurrentTestAnswerDoc')
  },
}
</script>

