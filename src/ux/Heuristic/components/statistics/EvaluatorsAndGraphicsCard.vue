<template>
  <v-card flat rounded="xl" class="evaluator-results-card pb-5">
    <v-tabs bg-color="transparent" color="#FB5C6C" slider-size="4" class="mt-2">
      <v-tab @click="localInd = 0">
        {{ $t('HeuristicsTestAnswer.evaluators.headers.table') }}
      </v-tab>
      <v-tab @click="localInd = 1">
        {{ $t('HeuristicsTestAnswer.evaluators.headers.graphic') }}
      </v-tab>
    </v-tabs>

    <v-row justify="center">
      <!-- Table view -->
      <v-col v-if="localInd == 0" cols="12" lg="11" xl="10">
        <v-data-table
          v-if="!isTraditional"
          density="compact"
          :headers="statistics.header"
          :items="statistics.items"
          :items-per-page="15"
          class="evaluator-results-table mt-4 mb-6"
        >
          <template #item.result="{ item }">
            <v-chip
              v-if="isNaN(item.result)"
              :color="getColorPorcentage(item.result)"
            >
              0.0%
            </v-chip>
            <v-chip v-else :color="getColorPorcentage(item.result)">
              {{ item.result }}%
            </v-chip>
          </template>
          <template #item.answered="{ item }"> {{ item.answered }}% </template>
        </v-data-table>

        <v-data-table
          v-else
          density="compact"
          :headers="traditionalStatistics.header"
          :items="traditionalStatistics.items"
          :items-per-page="15"
          class="evaluator-results-table mt-4 mb-6"
        >
          <template #item.frequencyAverage="{ item }">
            <v-chip color="info" variant="tonal" size="small">
              {{ item.frequencyAverage }}
            </v-chip>
          </template>
          <template #item.severityAverage="{ item }">
            <v-chip color="warning" variant="tonal" size="small">
              {{ item.severityAverage }}
            </v-chip>
          </template>
        </v-data-table>

        <v-btn
          class="mx-2"
          size="small"
          variant="outlined"
          :loading="loading"
          :disabled="loading"
          @click="$emit('download-csv')"
        >
          Export as CSV
          <v-icon end>mdi-download</v-icon>
        </v-btn>
      </v-col>

      <!-- Graphic view -->
      <v-col v-if="localInd == 1" cols="10">
        <RadarChart
          v-if="statistics.items.length >= 3"
          :labels="
            statistics.items.map(
              (item) => `${item.evaluator} - ${item.result}%`,
            )
          "
          :data="statistics.items.map((item) => item.result)"
        />
        <v-card
          v-else
          flat
          class="mx-auto mt-10 mb-10 py-6 px-3"
          align="center"
          width="970px"
        >
          {{ $t('HeuristicsTestAnswer.evaluators.messages.graphForMoreThan3') }}
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import RadarChart from '@/shared/components/charts/RadarChart.vue'

// Local ind — independent from parent's ind to avoid collision
const localInd = ref(0)

const props = defineProps({
  statistics: {
    type: Object,
    required: true,
    default: () => ({ header: [], items: [] }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isTraditional: {
    type: Boolean,
    default: false,
  },
  traditionalStatistics: {
    type: Object,
    default: () => ({ header: [], items: [] }),
  },
})

const emit = defineEmits(['download-csv'])

// Color helper — local copy to keep component self-contained
const getColorPorcentage = (value) => {
  if (isNaN(value) || value < 25) return 'red'
  if (value < 50) return 'orange'
  if (value < 75) return 'yellow'
  return 'green'
}
</script>

<style scoped>
.evaluator-results-card {
  background: rgb(var(--v-theme-surface));
}

.evaluator-results-table {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 12px;
}
</style>
