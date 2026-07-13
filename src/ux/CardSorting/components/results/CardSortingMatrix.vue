<template>
  <v-card flat rounded="xl" class="pa-4">
    <div class="d-flex flex-wrap align-center justify-space-between mb-3 ga-2">
      <div>
        <h3 class="text-h6 mb-1">{{ $t('CardSorting.categoryMatrix') }}</h3>
        <p class="text-caption text-medium-emphasis mb-0">
          {{ $t('CardSorting.categoryMatrixHint') }}
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
      <v-icon size="48" color="grey-lighten-1">mdi-cards-outline</v-icon>
      <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
    </div>

    <div v-else class="matrix-scroll">
      <v-table density="comfortable" class="matrix-table">
        <thead>
          <tr>
            <th class="text-left sticky-label">{{ $t('CardSorting.card') }}</th>
            <th
              v-for="category in categoryTitles"
              :key="category"
              class="text-center"
            >
              {{ category }}
            </th>
            <th class="text-center">{{ $t('CardSorting.notCategorized') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="card in cardTitles" :key="card">
            <td class="font-weight-medium sticky-label">{{ card }}</td>
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
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  UNASSIGNED_KEY,
  getCardTitles,
  getCategoryTitles,
  getSubmittedAnswers,
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
  min-width: 120px;
}

.matrix-cell {
  min-width: 44px;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
}

.matrix-cell--muted {
  color: #9e9e9e;
}
</style>
