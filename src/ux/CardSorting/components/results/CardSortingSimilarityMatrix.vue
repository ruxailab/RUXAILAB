<template>
  <v-card flat rounded="xl" class="pa-4">
    <div class="d-flex flex-wrap align-center justify-space-between mb-3 ga-2">
      <div>
        <h3 class="text-h6 mb-1">{{ $t('CardSorting.similarityMatrix') }}</h3>
        <p class="text-caption text-medium-emphasis mb-0">
          {{ $t('CardSorting.similarityMatrixHint') }}
        </p>
      </div>
      <v-btn-toggle
        v-model="displayMode"
        mandatory
        density="compact"
        color="primary"
        variant="outlined"
        divided
      >
        <v-btn value="absolute" size="small">
          {{ $t('CardSorting.absoluteValues') }}
        </v-btn>
        <v-btn value="percentage" size="small">
          {{ $t('CardSorting.percentageValues') }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <div v-if="!hasData" class="text-center text-medium-emphasis py-10">
      <v-icon size="48" color="grey-lighten-1">mdi-grid-off</v-icon>
      <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
    </div>

    <div v-else class="matrix-scroll">
      <v-table density="comfortable" class="matrix-table">
        <thead>
          <tr>
            <th class="text-left sticky-corner">{{ $t('CardSorting.card') }}</th>
            <th
              v-for="card in cardTitles"
              :key="`h-${card}`"
              class="text-center header-cell"
            >
              <span :title="card">{{ truncate(card) }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rowCard, i) in cardTitles" :key="`r-${rowCard}`">
            <td class="font-weight-medium sticky-label" :title="rowCard">
              {{ rowCard }}
            </td>
            <td
              v-for="(colCard, j) in cardTitles"
              :key="`c-${rowCard}-${colCard}`"
              class="text-center"
            >
              <div
                class="matrix-cell"
                :class="{ 'matrix-cell--diagonal': i === j }"
                :style="cellStyle(absolute[i][j], percentage[i][j], i === j)"
              >
                {{ formatCell(absolute[i][j], percentage[i][j], i === j) }}
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <p v-if="hasData" class="text-caption text-medium-emphasis mt-3 mb-0">
      {{
        $t('CardSorting.similarityMatrixFooter', {
          total: totalParticipants,
        })
      }}
    </p>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  getCardTitles,
  getSubmittedAnswers,
  buildSimilarityMatrix,
} from '../../utils/cardSortingAnalytics'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
  answers: {
    type: Array,
    default: () => [],
  },
})

const displayMode = ref('percentage')

const cardTitles = computed(() => getCardTitles(props.test))
const submittedAnswers = computed(() => getSubmittedAnswers(props.answers))

const similarity = computed(() =>
  buildSimilarityMatrix(cardTitles.value, submittedAnswers.value),
)

const absolute = computed(() => similarity.value.absolute)
const percentage = computed(() => similarity.value.percentage)
const totalParticipants = computed(() => similarity.value.totalParticipants)

const hasData = computed(
  () => cardTitles.value.length > 0 && totalParticipants.value > 0,
)

const truncate = (text, max = 18) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text

const formatCell = (abs, pct, isDiagonal) => {
  if (isDiagonal) return '—'
  if (displayMode.value === 'percentage') return `${pct}%`
  return abs || ''
}

const cellStyle = (abs, pct, isDiagonal) => {
  if (isDiagonal) {
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      color: '#9e9e9e',
    }
  }
  if (!abs || !totalParticipants.value) return {}
  const intensity = abs / totalParticipants.value
  return {
    backgroundColor: `rgba(252, 163, 38, ${0.12 + intensity * 0.7})`,
    color: intensity > 0.55 ? '#3e2723' : 'inherit',
  }
}
</script>

<style scoped>
.matrix-scroll {
  overflow-x: auto;
  max-width: 100%;
}

.matrix-table {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  min-width: max-content;
}

.header-cell {
  writing-mode: horizontal-tb;
  max-width: 72px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.sticky-label,
.sticky-corner {
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 1;
  min-width: 120px;
  max-width: 180px;
}

.sticky-corner {
  z-index: 2;
}

.matrix-cell {
  min-width: 44px;
  padding: 6px 8px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
  font-size: 0.8125rem;
}

.matrix-cell--diagonal {
  font-weight: 500;
}
</style>
