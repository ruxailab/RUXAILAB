<template>
  <v-card rounded="xl" flat class="mb-6 py-2" style="background: #f5f7ff">
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

    <div v-else key="heuristics-data">
      <v-card-title class="subtitleView">
        {{ $t('HeuristicsTestAnswer.heuristics.headers.heuristicsData') }}
      </v-card-title>
      <v-divider />

      <v-tabs
        bg-color="transparent"
        color="grey-darken-2"
        class="mt-2"
        align-tabs="center"
      >
        <v-tab
          class="tab-text"
          style="text-transform: none !important"
          @click="localInd = 0"
        >
          {{ $t('HeuristicsTestAnswer.heuristics.headers.answersByEvaluator') }}
        </v-tab>
        <v-tab
          class="tab-text"
          style="text-transform: none !important"
          @click="localInd = 1"
        >
          {{
            $t('HeuristicsTestAnswer.heuristics.headers.answersByHeuristics')
          }}
        </v-tab>
        <v-tab
          class="tab-text"
          style="text-transform: none !important"
          @click="localInd = 2"
        >
          {{ $t('HeuristicsTestAnswer.heuristics.headers.graphic') }}
        </v-tab>
        <v-tab
          class="tab-text"
          style="text-transform: none !important"
          @click="localInd = 3"
        >
          {{ $t('HeuristicsTestAnswer.heuristics.headers.weights') }}
        </v-tab>
        <v-tab
          class="tab-text"
          style="text-transform: none !important"
          @click="localInd = 4"
        >
          Time by heuristics
        </v-tab>
      </v-tabs>

      <v-row justify="center">
        <v-col cols="10">
          <v-row>
            <!-- Sub-tab 0: Answers by Evaluator -->
            <v-col v-if="localInd == 0" cols="12">
              <v-data-table
                :headers="heuristicsEvaluator.header"
                :items="heuristicsEvaluator.items"
                :items-per-page="15"
                class="elevation-0 cardStyle mx-2 mt-3 mb-6"
                density="compact"
              >
                <template
                  v-for="header in heuristicsEvaluator.header"
                  :key="header.value"
                  #[`item.${header.value}`]="{ item }"
                >
                  <v-chip
                    v-if="header.value != 'heuristic'"
                    :class="[
                      'score-chip',
                      getColor(item[header.value], item.max, item.min),
                    ]"
                    variant="flat"
                  >
                    {{ formatScore(item[header.value]) }}
                  </v-chip>
                  <v-btn
                    v-else
                    variant="text"
                    @click="$emit('go-to-heuristic', item.heuristic)"
                  >
                    {{ item[header.value] }}
                  </v-btn>
                </template>
              </v-data-table>
            </v-col>

            <!-- Sub-tab 1: Answers by Heuristics -->
            <v-col v-if="localInd == 1" cols="12">
              <v-data-table
                :headers="heuristicsStatistics.header"
                :items="heuristicsStatistics.items"
                :items-per-page="15"
                class="elevation-0 cardStyle mx-2 mt-3 mb-6"
                density="compact"
              >
                <template #item.percentage="{ item }">
                  <div style="padding-top: 2px; padding-bottom: 2px">
                    <v-chip
                      style="width: 35%"
                      :class="[
                        'score-chip',
                        getColor(item.average, item.max, item.min),
                      ]"
                      variant="flat"
                    >
                      {{ checkIfNan(item.percentage) }}
                    </v-chip>
                  </div>
                </template>
                <template #item.sd="{ item }">
                  {{ checkIfNan(item.sd) }}
                </template>
                <template #item.average="{ item }">
                  {{ checkIfNan(item.average) }}
                </template>
              </v-data-table>
            </v-col>

            <!-- Sub-tab 2: Bar Chart -->
            <v-col v-if="localInd == 2" cols="12">
              <BarChart
                class="mx-2 mt-3 mb-6"
                :labels="heuristicsStatistics.items.map((item) => item.name)"
                :data="heuristicsStatistics.items.map((item) => item.average)"
                legend="Average"
              />
            </v-col>

            <!-- Sub-tab 3: Weights -->
            <v-col v-if="localInd == 3" cols="12" align="center">
              <v-card
                v-if="relative === null"
                class="mx-auto mt-10 mb-10 py-6 if-card"
                align="center"
                width="970px"
              >
                {{
                  $t(
                    'HeuristicsTestAnswer.heuristics.messages.runWeightFunction',
                  )
                }}
              </v-card>
              <div v-else>
                <v-row align="center" justify="space-around">
                  <v-col md="4" sm="8">
                    <v-card
                      align="center"
                      class="elevation-4 weightsStatisticsStyle mt-6 py-4 mb-6 mx-auto"
                      width="950px"
                    >
                      <v-card-title class="mt-4 mb-4 font-weight-bold">
                        <v-row align="center" justify="center">
                          Usability Percentage <br />
                          With Weights
                        </v-row>
                      </v-card-title>
                      <v-card-text>
                        <v-row align="center" justify="center mt-2 mb-2">
                          <p class="text-h2">{{ usabilityTotalFix }}</p>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="6" md="8">
                    <v-card
                      align="center"
                      class="elevation-4 weightsStatisticsStyle mt-6 py-4 px-4 mb-6 mx-auto"
                      width="950px"
                    >
                      <RadarWeight
                        :labels="
                          Array.from(
                            { length: heuristicsLength },
                            (_, index) => `H ${index + 1}`,
                          )
                        "
                        :data="weightsStatistics.items.map((item) => item.rw)"
                        :max-value="maxValue"
                      />
                    </v-card>
                  </v-col>
                </v-row>
                <v-row align="center" justify="space-around">
                  <v-data-table
                    :headers="weightsStatistics.header"
                    :items="weightsStatistics.items"
                    :items-per-page="10"
                    align="center"
                    class="elevation-4 weightsStatisticsStyle mt-3 mb-6 mx-auto"
                    width="950px"
                  />
                </v-row>
              </div>
            </v-col>

            <!-- Sub-tab 4: Time by Heuristics -->
            <v-col v-if="localInd == 4" cols="12">
              <v-data-table
                :headers="timeByHeuristics.header"
                :items="timeByHeuristics.items"
                :items-per-page="15"
                class="elevation-0 cardStyle mx-2 mt-3 mb-6"
                density="compact"
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
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import BarChart from '@/ux/Heuristic/components/charts/BarChart.vue'
import RadarWeight from '@/ux/Heuristic/components/weights_evaluation/RadarWeight.vue'

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
  heuristicsStatistics: {
    type: Object,
    required: true,
    default: () => ({ header: [], items: [] }),
  },
  timeByHeuristics: {
    type: Object,
    required: true,
    default: () => ({ header: [], items: [] }),
  },
  weightsStatistics: {
    type: Object,
    required: true,
    default: () => ({ header: [], items: [] }),
  },
  relative: {
    type: Object,
    default: null,
  },
  usabilityTotalFix: {
    type: String,
    default: '0%',
  },
  heuristicsLength: {
    type: Number,
    default: 0,
  },
  maxValue: {
    type: Number,
    default: 1,
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

const checkIfNan = (value) => {
  return isNaN(value) || value === null ? '—' : value
}

const formatScore = (value) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : '—'
}
</script>

<style scoped>
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
