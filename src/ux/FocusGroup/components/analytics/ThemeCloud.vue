<template>
  <div v-if="entries.length" class="theme-cloud">
    <v-chip
      v-for="entry in entries"
      :key="entry.term"
      size="small"
      variant="tonal"
      color="primary"
      class="theme-cloud__term"
    >
      {{ entry.term }}
    </v-chip>
  </div>
  <p v-else class="text-medium-emphasis mb-0">
    {{ $t('focusGroup.analytics.noKeywordsYet') }}
  </p>
</template>

<script setup>
defineProps({
  entries: { type: Array, default: () => [] },
})
</script>

<style scoped>
.theme-cloud {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.theme-cloud__term {
  max-width: 100%;
  height: auto;
  min-height: 30px;
  white-space: normal;
}
</style>
