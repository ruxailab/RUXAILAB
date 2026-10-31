<template>
  <div
    :class="{
      'h-100 w-100 flex-grow-1': fillHeight,
      'mb-4': compact,
      'mb-0': !fillHeight && !compact,
    }"
  >
    <v-card
      :class="[
        'elevation-4',
        'rounded-xl',
        'chart-card',
        { 'h-100': fillHeight },
        compact ? 'pa-4' : 'pa-4 pa-md-6',
      ]"
    >
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h3
            class="text-h5 font-weight-bold text-on-surface"
            :class="{ 'mb-1': compact }"
          >
            {{ $t('analytics.answersTimelineTitle') }}
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ $t('analytics.answersTimelineDescription') }}
          </p>
        </div>
        <v-menu v-if="showExport">
          <template #activator="{ props: menuProps }">
            <v-btn
              icon="mdi-dots-vertical"
              size="small"
              variant="text"
              v-bind="menuProps"
              :aria-label="$t('analytics.answersTimelineOptions')"
            />
          </template>
          <v-list>
            <v-list-item @click="$emit('export')">
              <template #prepend>
                <v-icon>mdi-download</v-icon>
              </template>
              <v-list-item-title>
                {{ $t('analytics.export') }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div class="chart-container-large">
        <DateChart :task-answers="taskAnswers" />
      </div>
    </v-card>
  </div>
</template>

<script setup>
import DateChart from '@/ux/UserTest/components/answers/DateChart.vue'

defineProps({
  taskAnswers: { type: Array, default: () => [] },
  showExport: { type: Boolean, default: true },
  fillHeight: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
})

defineEmits(['export'])
</script>

<style scoped>
.chart-container-large {
  height: 300px;
  width: 100%;
  position: relative;
}

@media (max-width: 600px) {
  .chart-container-large {
    height: 300px;
  }
}
</style>
