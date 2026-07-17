<template>
  <div class="sentiment-summary">
    <p>Sentiments: {{ sentiments.join(', ') }}</p>
  </div>
</template>

<script setup>
defineProps({
  sentiments: {
    type: Array,
    default: () => [],
  },
})
</script>
