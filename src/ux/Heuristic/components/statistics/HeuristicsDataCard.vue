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
          v-if="trackTime"
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
                    :color="getColor(item[header.value], item.max, item.min)"
                    class="chip"
                  >
                    {{ item[header.value] ? item[header.value].toFixed(2) : 0 }}
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
                      :color="getColor(item.average, item.max, item.min)"
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
            <v-col v-if="localInd == 4 && trackTime" cols="12">
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
  trackTime: {
    type: Boolean,
    default: true,
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

// Local copy — keeps component self-contained without importing from parent
const getColor = (value, max, min) => {
  if (value === null || value === undefined) return 'grey'
  if (max === min) return 'blue'
  const normalized = (value - min) / (max - min)
  if (normalized < 0.25) return 'red'
  if (normalized < 0.5) return 'orange'
  if (normalized < 0.75) return 'yellow'
  return 'green'
}

const checkIfNan = (value) => {
  return isNaN(value) || value === null ? '—' : value
}
</script>
