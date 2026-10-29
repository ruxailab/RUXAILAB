<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <v-card class="pa-4 elevation-4 rounded-xl chart-card">
        <div
          class="d-flex flex-wrap justify-space-between align-center mb-4 ga-2"
        >
          <div>
            <h3 class="text-h5 font-weight-bold text-on-surface mb-1">
              {{ $t('CardSorting.categoryMatrix') }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ $t('CardSorting.categoryMatrixHint') }}
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
                  :aria-label="$t('CardSorting.exportCategoryMatrix')"
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
          <v-icon size="48" color="grey-lighten-1">mdi-cards-outline</v-icon>
          <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
        </div>

        <div v-else class="matrix-scroll">
          <v-table density="compact" class="matrix-table">
            <thead>
              <tr>
                <th class="text-left sticky-label" scope="col">
                  {{ $t('CardSorting.card') }}
                </th>
                <th
                  v-for="category in categoryTitles"
                  :key="category"
                  class="text-center category-header"
                  scope="col"
                >
                  <v-tooltip :text="category" location="top">
                    <template #activator="{ props: tooltipProps }">
                      <span v-bind="tooltipProps" class="category-header-text">
                        {{ category }}
                      </span>
                    </template>
                  </v-tooltip>
                </th>
                <th class="text-center category-header" scope="col">
                  <v-tooltip
                    :text="$t('CardSorting.notCategorized')"
                    location="top"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <span v-bind="tooltipProps" class="category-header-text">
                        {{ $t('CardSorting.notCategorized') }}
                      </span>
                    </template>
                  </v-tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="card in cardTitles" :key="card">
                <td class="font-weight-medium sticky-label">
                  <v-tooltip :text="card" location="top">
                    <template #activator="{ props: tooltipProps }">
                      <span v-bind="tooltipProps" class="row-label-text">
                        {{ card }}
                      </span>
                    </template>
                  </v-tooltip>
                </td>
                <td
                  v-for="category in categoryTitles"
                  :key="category"
                  class="text-center"
                >
                  <div
                    class="matrix-cell"
                    :style="cellStyle(matrix[card][category])"
                  >
                    {{ formatCell(matrix[card][category]) }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="matrix-cell matrix-cell--muted">
                    {{ formatCell(matrix[card].__unassigned) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <p v-if="hasData" class="text-caption text-medium-emphasis mt-3 mb-0">
          {{ $t('CardSorting.matrixHint', { total: totalParticipants }) }}
        </p>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  UNASSIGNED_KEY,
  getCardTitles,
  getCategoryTitles,
  getSubmittedAnswers,
} from '../../utils/cardSortingAnalytics'
import {
  exportMatrixAsLatex,
  exportMatrixAsPng,
} from '../../utils/cardSortingMatrixExport'
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
const displayMode = ref('absolute')

const cardTitles = computed(() => getCardTitles(props.test))
const submittedAnswers = computed(() => getSubmittedAnswers(props.answers))
const categoryTitles = computed(() =>
  getCategoryTitles(props.test, submittedAnswers.value),
)
const totalParticipants = computed(() => submittedAnswers.value.length)

const hasData = computed(
  () => cardTitles.value.length > 0 && totalParticipants.value > 0,
)

const matrix = computed(() => {
  const result = {}
  cardTitles.value.forEach((card) => {
    result[card] = { [UNASSIGNED_KEY]: 0 }
    categoryTitles.value.forEach((category) => {
      result[card][category] = 0
    })
  })

  submittedAnswers.value.forEach((answer) => {
    const sorting = answer?.sorting || {}
    Object.entries(sorting).forEach(([category, cards]) => {
      ;(cards || []).forEach((cardTitle) => {
        if (!result[cardTitle]) return
        if (category === UNASSIGNED_KEY) {
          result[cardTitle][UNASSIGNED_KEY] += 1
        } else if (result[cardTitle][category] !== undefined) {
          result[cardTitle][category] += 1
        }
      })
    })
  })

  return result
})

const formatCell = (count) => {
  if (!count) return ''
  if (displayMode.value === 'percentage' && totalParticipants.value) {
    const pct = Math.round((count / totalParticipants.value) * 1000) / 10
    return `${pct}%`
  }
  return count
}

const cellStyle = (count) => {
  if (!count || !totalParticipants.value) return {}
  const intensity = count / totalParticipants.value
  return {
    backgroundColor: `rgba(63, 81, 181, ${0.15 + intensity * 0.6})`,
    color: intensity > 0.6 ? '#fff' : 'inherit',
  }
}

const categoryColumns = computed(() => [
  ...categoryTitles.value,
  t('CardSorting.notCategorized'),
])

const getCellCount = (card, columnIndex) =>
  columnIndex < categoryTitles.value.length
    ? matrix.value[card][categoryTitles.value[columnIndex]]
    : matrix.value[card][UNASSIGNED_KEY]

const exportAsPng = async () => {
  try {
    const rows = cardTitles.value.map((card) => ({
      label: card,
      cells: categoryColumns.value.map((_, column) => {
        const count = getCellCount(card, column)
        const style = cellStyle(count)
        return {
          text: String(formatCell(count)),
          backgroundColor: style.backgroundColor,
          color: style.color,
        }
      }),
    }))
    await exportMatrixAsPng({
      filename: 'card-sorting-category-matrix',
      rowHeaderLabel: t('CardSorting.card'),
      columns: categoryColumns.value,
      rows,
      cellWidth: 120,
    })
  } catch {
    showError('CardSorting.categoryMatrixExportError')
  }
}

const exportAsLatex = () => {
  try {
    const rows = cardTitles.value.map((card) => ({
      label: card,
      cells: categoryColumns.value.map((_, column) =>
        String(formatCell(getCellCount(card, column))),
      ),
    }))
    exportMatrixAsLatex({
      filename: 'card-sorting-category-matrix',
      rowHeaderLabel: t('CardSorting.card'),
      columns: categoryColumns.value,
      rows,
    })
  } catch {
    showError('CardSorting.categoryMatrixExportError')
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

.sticky-label {
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 1;
  min-width: 96px;
  max-width: 140px;
}

.category-header {
  max-width: 140px;
  font-size: 0.75rem;
}

.category-header-text,
.row-label-text {
  display: block;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-label-text {
  font-size: 0.8125rem;
}

.matrix-cell {
  min-width: 36px;
  padding: 3px 5px;
  border-radius: 6px;
  font-weight: 600;
  display: inline-block;
  font-size: 0.75rem;
}

.matrix-cell--muted {
  color: #9e9e9e;
}
</style>
