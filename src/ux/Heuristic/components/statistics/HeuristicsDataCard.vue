<template>
  <!-- Guard: not enough answers -->
  <v-card
    v-if="!hasEnoughData"
    key="heuristics-insufficient"
    class="mx-auto mt-10 mb-10 py-6 if-card"
    align="center"
    width="970px"
  >
    {{ $t('HeuristicsTestAnswer.heuristics.messages.needMoreThan1Answer') }}
  </v-card>

  <v-card
    v-else
    key="heuristics-data"
    flat
    rounded="xl"
    class="evaluator-results-card pb-5"
  >
    <v-tabs bg-color="transparent" color="#FB5C6C" slider-size="4" class="mt-2">
      <v-tab @click="localInd = 0">
        {{ $t('HeuristicsTestAnswer.heuristics.headers.answersByEvaluator') }}
      </v-tab>
      <v-tab v-if="trackTime" @click="localInd = 2">
        {{ $t('HeuristicsTestAnswer.heuristics.headers.timeByHeuristics') }}
      </v-tab>
    </v-tabs>

    <v-row justify="center">
      <!-- Sub-tab 0: Answers by Evaluator -->
      <v-col v-if="localInd == 0" cols="12" lg="11" xl="10">
        <v-data-table
          :headers="heuristicsEvaluator.header"
          :items="heuristicsEvaluator.items"
          :items-per-page="15"
          density="compact"
          class="evaluator-results-table mt-4 mb-6"
        >
          <template
            v-for="header in heuristicsEvaluator.header"
            :key="header.value"
            #[`item.${header.value}`]="{ item }"
          >
            <v-btn
              v-if="header.value === 'heuristic'"
              variant="text"
              @click="$emit('go-to-heuristic', item.heuristic)"
            >
              {{ item[header.value] }}
            </v-btn>
            <span
              v-else-if="
                header.value === 'averageScore' ||
                header.value === 'standardDeviation'
              "
            >
              {{ item[header.value] }}
            </span>
            <v-chip
              v-else
              :class="[
                'score-chip',
                getColor(item[header.value], item.max, item.min),
              ]"
              variant="flat"
            >
              {{ formatScore(item[header.value]) }}
            </v-chip>
          </template>
        </v-data-table>
      </v-col>

      <!-- Sub-tab 2: Time by Heuristics -->
      <v-col v-if="localInd == 2 && trackTime" cols="12" lg="11" xl="10">
        <v-data-table
          :headers="timeByHeuristics.header"
          :items="timeByHeuristics.items"
          :items-per-page="15"
          density="compact"
          class="evaluator-results-table mt-4 mb-6"
        >
          <template
            v-for="header in timeByHeuristics.header"
            :key="header.value"
            #[`item.${header.value}`]="{ item }"
          >
            <span v-if="header.value === 'heuristic'">
              {{ item.heuristic }}
            </span>
            <span v-else>
              {{ item[header.value] }}
            </span>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

// Local tab index — independent from parent ind to avoid collision
const localInd = ref(0)

defineProps({
  hasEnoughData: {
    type: Boolean,
    required: true,
  },
  heuristicsEvaluator: {
    type: Object,
    required: true,
    default: () => ({ header: [], items: [] }),
  },
  timeByHeuristics: {
    type: Object,
    required: true,
    default: () => ({ header: [], items: [] }),
  },
  trackTime: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['go-to-heuristic'])

const getColor = (value, max, min) => {
  const numericValue = Number(value)
  const numericMax = Number(max)
  const numericMin = Number(min)

  if (!Number.isFinite(numericValue)) return 'score-chip--empty'
  if (!Number.isFinite(numericMax) || !Number.isFinite(numericMin)) {
    return 'score-chip--empty'
  }
  if (numericMax === numericMin) {
    return numericValue > 0 ? 'score-chip--high' : 'score-chip--empty'
  }

  const normalized = (numericValue - numericMin) / (numericMax - numericMin)
  if (normalized < 0.25) return 'score-chip--low'
  if (normalized < 0.5) return 'score-chip--medium-low'
  if (normalized < 0.75) return 'score-chip--medium-high'
  return 'score-chip--high'
}

const formatScore = (value) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : '—'
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

.score-chip {
  min-width: 58px;
  justify-content: center;
  font-weight: 500;
}

.score-chip--low {
  background-color: #fde5e2 !important;
  color: #ff2a1a !important;
}

.score-chip--medium-low {
  background-color: #ffefd9 !important;
  color: #ff8500 !important;
}

.score-chip--medium-high {
  background-color: #fff8dc !important;
  color: #ffd000 !important;
}

.score-chip--high {
  background-color: #e5f3e8 !important;
  color: #25a83a !important;
}

.score-chip--empty {
  background-color: #eeeeee !important;
  color: #777777 !important;
}
</style>
