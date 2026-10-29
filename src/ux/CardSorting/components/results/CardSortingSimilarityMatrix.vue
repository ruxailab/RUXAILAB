<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <v-card class="pa-4 elevation-4 rounded-xl chart-card">
        <div
          class="d-flex flex-wrap justify-space-between align-center mb-4 ga-2"
        >
          <div>
            <h3 class="text-h5 font-weight-bold text-on-surface mb-1">
              {{ $t('CardSorting.similarityMatrix') }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ $t('CardSorting.similarityMatrixHint') }}
            </p>
          </div>
          <div class="d-flex align-center ga-1">
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
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  icon="mdi-dots-vertical"
                  variant="text"
                  density="comfortable"
                  size="small"
                  :disabled="!hasData"
                  :aria-label="$t('CardSorting.exportSimilarityMatrix')"
                />
              </template>
              <v-list density="compact">
                <v-list-item
                  prepend-icon="mdi-image-outline"
                  :title="$t('CardSorting.exportAsPng')"
                  @click="exportAsPng"
                />
                <v-list-item
                  prepend-icon="mdi-code-braces"
                  :title="$t('CardSorting.exportAsLatex')"
                  @click="exportAsLatex"
                />
              </v-list>
            </v-menu>
          </div>
        </div>

        <div v-if="!hasData" class="text-center text-medium-emphasis py-10">
          <v-icon size="48" color="grey-lighten-1">mdi-grid-off</v-icon>
          <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
        </div>

        <div v-else class="matrix-scroll">
          <v-table density="compact" class="matrix-table">
            <thead>
              <tr>
                <th class="text-left sticky-corner" scope="col">
                  {{ $t('CardSorting.card') }}
                </th>
                <th
                  v-for="card in cardTitles"
                  :key="`h-${card}`"
                  class="text-center header-cell"
                  scope="col"
                >
                  <v-tooltip :text="card" location="top">
                    <template #activator="{ props: tooltipProps }">
                      <span v-bind="tooltipProps" class="header-text">
                        {{ card }}
                      </span>
                    </template>
                  </v-tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rowCard, i) in cardTitles" :key="`r-${rowCard}`">
                <td class="font-weight-medium sticky-label">
                  <v-tooltip :text="rowCard" location="top">
                    <template #activator="{ props: tooltipProps }">
                      <span v-bind="tooltipProps" class="row-label-text">
                        {{ rowCard }}
                      </span>
                    </template>
                  </v-tooltip>
                </td>
                <td
                  v-for="(colCard, j) in cardTitles"
                  :key="`c-${rowCard}-${colCard}`"
                  class="text-center"
                >
                  <div
                    class="matrix-cell"
                    :class="{ 'matrix-cell--diagonal': i === j }"
                    :style="
                      cellStyle(absolute[i][j], percentage[i][j], i === j)
                    "
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
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getCardTitles,
  getSubmittedAnswers,
  buildSimilarityMatrix,
} from '../../utils/cardSortingAnalytics'
import {
  exportMatrixAsLatex,
  exportMatrixAsPng,
} from '../../utils/cardSortingMatrixExport'
import { getTrafficLightColor } from '../../utils/matrixColors'
import { showError } from '@/shared/utils/toast'

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

const { t } = useI18n()
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
  if (!totalParticipants.value || (displayMode.value === 'absolute' && !abs)) {
    return {}
  }
  const intensity = abs / totalParticipants.value
  return {
    backgroundColor: getTrafficLightColor(intensity),
    color: '#212121',
  }
}

const exportAsPng = async () => {
  try {
    const rows = cardTitles.value.map((rowCard, row) => ({
      label: rowCard,
      cells: cardTitles.value.map((_, column) => {
        const abs = absolute.value[row][column]
        const pct = percentage.value[row][column]
        const style = cellStyle(abs, pct, row === column)
        return {
          text: String(formatCell(abs, pct, row === column)),
          backgroundColor: style.backgroundColor,
          color: style.color,
        }
      }),
    }))
    await exportMatrixAsPng({
      filename: 'card-sorting-similarity-matrix',
      rowHeaderLabel: t('CardSorting.card'),
      columns: cardTitles.value,
      rows,
    })
  } catch {
    showError('CardSorting.similarityMatrixExportError')
  }
}

const exportAsLatex = () => {
  try {
    const rows = cardTitles.value.map((rowCard, row) => ({
      label: rowCard,
      cells: cardTitles.value.map((_, column) =>
        String(
          formatCell(
            absolute.value[row][column],
            percentage.value[row][column],
            row === column,
          ),
        ),
      ),
    }))
    exportMatrixAsLatex({
      filename: 'card-sorting-similarity-matrix',
      rowHeaderLabel: t('CardSorting.card'),
      columns: cardTitles.value,
      rows,
    })
  } catch {
    showError('CardSorting.similarityMatrixExportError')
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
  max-width: 64px;
  font-size: 0.6875rem;
  white-space: nowrap;
}

.header-text {
  display: block;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticky-label,
.sticky-corner {
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 1;
  min-width: 96px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-label-text {
  display: block;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticky-corner {
  z-index: 2;
}

.matrix-cell {
  min-width: 36px;
  padding: 3px 5px;
  border-radius: 6px;
  font-weight: 600;
  display: inline-block;
  font-size: 0.75rem;
}

.matrix-cell--diagonal {
  font-weight: 500;
}
</style>
