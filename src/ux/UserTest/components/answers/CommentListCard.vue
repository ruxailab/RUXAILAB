<template>
  <v-card class="pa-6 elevation-3 rounded-xl chart-card">
    <div class="mb-4">
      <h4 class="text-h6 font-weight-bold mb-2">
        {{ questionTitle }}
      </h4>
    </div>
    <div class="text-body-1 text-medium-emphasis">
      <template v-if="Array.isArray(answer) && answer.length && typeof answer[0] === 'string' && answer.length > 1">
        <ul class="pl-4">
          <li
            v-for="(comment, cidx) in answer"
            :key="cidx"
          >
            {{ comment }}
          </li>
        </ul>
      </template>
      <template v-else-if="answer">
        <span>Answer: {{ Array.isArray(answer) ? answer.join(', ') : answer }}</span>
      </template>
      <template v-else>
        <span>No answers or unsupported type.</span>
      </template>
    </div>
  </v-card>
</template>

<script setup>
const props = defineProps({
  questionTitle: String,
  answer: [String, Array]
});
</script>

<style scoped>
.chart-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
}
</style>
