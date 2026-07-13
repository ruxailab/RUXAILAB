<template>
  <v-card flat rounded="xl" class="pa-4">
    <div v-if="!hasData" class="text-center text-medium-emphasis py-10">
      <v-icon size="48" color="grey-lighten-1">mdi-cards-outline</v-icon>
      <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
    </div>

    <v-table v-else density="comfortable" class="matrix-table">
      <thead>
        <tr>
          <th class="text-left">{{ $t('CardSorting.card') }}</th>
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
          <td class="font-weight-medium">{{ card }}</td>
          <td
            v-for="category in categoryTitles"
            :key="category"
            class="text-center"
          >
            <div
              class="matrix-cell"
              :style="cellStyle(matrix[card][category])"
            >
              {{ matrix[card][category] || '' }}
            </div>
          </td>
          <td class="text-center">
            <div class="matrix-cell matrix-cell--muted">
              {{ matrix[card].__unassigned || '' }}
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>

    <p v-if="hasData" class="text-caption text-medium-emphasis mt-3">
      {{ $t('CardSorting.matrixHint', { total: totalParticipants }) }}
    </p>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

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

const UNASSIGNED_KEY = '__unassigned'

const cardTitles = computed(
  () =>
    (props.test?.testStructure?.cardSorting?.cards || []).map((c) => c.title),
)

// Only submitted answers are counted towards the aggregated results
const submittedAnswers = computed(() =>
  props.answers.filter((answer) => answer?.submitted),
)

const categoryTitles = computed(() => {
  const predefined = (
    props.test?.testStructure?.cardSorting?.categories || []
  ).map((c) => c.title)
  const fromAnswers = new Set(predefined)

  submittedAnswers.value.forEach((answer) => {
    Object.keys(answer?.sorting || {}).forEach((category) => {
      if (category !== UNASSIGNED_KEY) fromAnswers.add(category)
    })
  })

  return Array.from(fromAnswers)
})

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
.matrix-table {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
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
