<template>
  <div class="notes-stats">
    <p>Total Notes: {{ totalNotes }}</p>
  </div>
</template>

<script setup>
defineProps({
  totalNotes: {
    type: Number,
    default: 0,
  },
})
</script>
