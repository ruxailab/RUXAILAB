<template>
  <div class="sentiment-table-cell py-2">
    <template v-if="hasData">
      <div class="sentiment-stack mb-2">
        <div
          v-if="positive > 0"
          class="sentiment-stack__segment sentiment-stack__positive"
          :style="{ flexGrow: positive }"
        />
        <div
          v-if="neutral > 0"
          class="sentiment-stack__segment sentiment-stack__neutral"
          :style="{ flexGrow: neutral }"
        />
        <div
          v-if="negative > 0"
          class="sentiment-stack__segment sentiment-stack__negative"
          :style="{ flexGrow: negative }"
        />
      </div>
      <div class="sentiment-stack-legend text-caption text-medium-emphasis">
        <span>{{ $t('analytics.sentiment.positive') }} {{ positive }}%</span>
        <span>{{ $t('analytics.sentiment.neutral') }} {{ neutral }}%</span>
        <span>{{ $t('analytics.sentiment.negative') }} {{ negative }}%</span>
      </div>
    </template>
    <div v-else class="d-flex align-center ga-2 text-medium-emphasis">
      <v-icon size="18">mdi-database-off-outline</v-icon>
      <span class="text-caption">{{ $t('analytics.sentiment.noData') }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hasData: {
    type: Boolean,
    default: false,
  },
  positive: {
    type: Number,
    default: 0,
  },
  neutral: {
    type: Number,
    default: 0,
  },
  negative: {
    type: Number,
    default: 0,
  },
})
</script>

<style scoped>
.sentiment-table-cell {
  min-width: 240px;
}

.sentiment-stack {
  display: flex;
  height: 10px;
  overflow: hidden;
  border-radius: 8px;
}

.sentiment-stack__segment {
  min-width: 0;
  flex-shrink: 0;
  flex-basis: 0;
}

.sentiment-stack__positive {
  background: #22c55e;
}

.sentiment-stack__neutral {
  background: #94a3b8;
}

.sentiment-stack__negative {
  background: #ef4444;
}

.sentiment-stack-legend {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 8px;
}
</style>
