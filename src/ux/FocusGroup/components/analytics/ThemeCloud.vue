<template>
  <div v-if="entries.length" class="theme-cloud">
    <span
      v-for="entry in entries"
      :key="entry.term"
      class="theme-cloud__term"
      :style="{ fontSize: fontSizeFor(entry.weight) }"
    >
      {{ entry.term }}
    </span>
  </div>
  <p v-else class="text-medium-emphasis mb-0">
    {{ $t('focusGroup.analytics.noKeywordsYet') }}
  </p>
</template>

<script setup>
// Hand-rolled cloud instead of a Chart.js/word-cloud plugin: Chart.js has no
// native word-cloud chart type, and pulling in a dedicated plugin isn't
// worth it for a handful of ranked terms sized by weight.
const props = defineProps({
  // [{ term: string, weight: number }], any positive scale — only relative
  // magnitude matters, values are normalized against the max below.
  entries: { type: Array, default: () => [] },
})

const MIN_SIZE = 0.85
const MAX_SIZE = 2.2

function fontSizeFor(weight) {
  const maxWeight = Math.max(...props.entries.map((e) => e.weight), 1)
  const ratio = maxWeight > 0 ? weight / maxWeight : 0
  const size = MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE)
  return `${size.toFixed(2)}rem`
}
</script>

<style scoped>
.theme-cloud {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 14px;
  padding: 8px 4px;
}

.theme-cloud__term {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  line-height: 1.2;
}
</style>
