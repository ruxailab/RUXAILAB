<template>
  <v-col
    style="background-color:#F5F7FF"
    class="rounded pa-0 pb-1 mb-10"
  >
    <v-card-title class="subtitleView">
      {{ $t('HeuristicsWeightsTable.titles.weights') }}
    </v-card-title>
    <v-divider class="mb-4" />
    <v-card
      v-if="heuristics.length < 2"
      class="mx-auto mb-5 py-4 bg-transparent rounded-0 subtitleView"
      elevation="0"
      align="center"
    >
      {{ $t('HeuristicsWeightsTable.messages.atLeast2HeuristicsForWeighting') }}
    </v-card>
    <v-card
      v-else
      class="mx-auto mt-4 mb-5 rounded-0"
      elevation="0"
    >
      <!-- tabs -->
      <v-tabs
        v-model="tabs"
        align-tabs="center"
        bg-color="#F5F7FF"
        color="orange"
        show-arrows
      >
        <v-tab
          v-for="(heuri, index) in heuristics.length - 1"
          :key="index"
        >
          <v-tooltip location="top">
            <template #activator="{ props }">
              <span v-bind="props"> H {{ heuri }}</span>
            </template>
            <span>{{ heuristics[index].title }}</span>
          </v-tooltip>
        </v-tab>
      </v-tabs>
      <!-- tab items -->
      <v-window v-model="tabs">
        <v-window-item
          v-for="(n, pes) in heuristics && heuristics.length
            ? heuristics.length - 1
            : 0"
          :key="pes"
          style="background-color:#F5F7FF"
        >
          <v-card
            flat
            class="mx-4 mt-2 mb-8"
          >
            <v-card-text class="tablebody">
              <v-table>
                <thead>
                  <tr>
                    <th class="text-left">
                      {{ $t('HeuristicsWeightsTable.titles.heuristics') }}
                    </th>
                    <th class="text-center">
                      {{ $t('HeuristicsWeightsTable.titles.weights') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(f, tam) in heuristics.length - (tabs + 1)"
                    :key="tam"
                  >
                    <td>
                      H {{ f + (tabs + 1) }}
                      <!-- tooltips -->
                      <v-tooltip location="right">
                        <template #activator="{ props }">
                          <v-icon
                            v-bind="props"
                            color="#FCA326"
                            size="small"
                          >
                            mdi-help-circle
                          </v-icon>
                        </template>
                        <span>{{ heuristics[f + tabs].title }}</span>
                      </v-tooltip>
                    </td>
                    <!-- radio-group -->
                    <td>
                      <v-radio-group
                        v-model="group[tabs][tam]"
                        density="compact"
                        inline
                        class="px-10 mx-2 v-input--radio-group__input justify-space-around"
                      >
                        <v-tooltip
                          v-for="(r, rad) in importance"
                          :key="rad"
                          location="bottom"
                        >
                          <template #activator="{ props }">
                            <v-radio
                              v-bind="props"
                              :label="`${r}`"
                              :value="r"
                              false
                              class="padding-left mx-4"
                              true-icon="mdi-check-circle-outline"
                              false-icon="mdi-checkbox-blank-circle-outline"
                              color="#FCA326"
                            />
                          </template>
                          <span>
                            H{{ tabs + 1 }} has
                            {{ importt[r - 1] }} than H{{ f + (tabs + 1) }}
                          </span>
                        </v-tooltip>
                      </v-radio-group>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <!-- save button -->
              <v-row
                align="center"
                justify="space-around"
              >
                <v-btn
                  variant="flat"
                  class="mt-8 mb-4"
                  size="large"
                  align="center"
                  color="orange"
                  type="submit"
                  @click="updateDatas"
                >
                  {{ $t('HeuristicsWeightsTable.actions.saveWeights') }}
                </v-btn>
              </v-row>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-col>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const tabs = ref(0)
const row = ref([])
const group = ref({})
const scores = ref(null)
const importance = ref({
  'Equal Importance': 1,
  'Moderately Importance': 2,
  'Strongly Importance': 3,
  'Very Strongly Importance': 4,
  'Extreme Importance': 5,
  'Moderately Less Important': 6,
  'Strongly Less Important': 7,
  'Very Strongly Less Important': 8,
  'Extremely Less Important': 9
})
const importt = ref([
  'Equal Importance',
  'Moderately Importance',
  'Strongly Importance',
  'Very Strongly Importance',
  'Extremely Importance',
  'Moderately Less Important',
  'Strongly Less Important',
  'Very Strongly Less Important',
  'Extremely Less Important'
])

const testAll = computed(() => store.state.Tests.Test)
const heuristics = computed(() => testAll.value.testStructure || [])
const heuristicaTamanho = computed(() => heuristics.value.length)
const scoresPercentage = computed(() => store.state.Tests.scoresPercentage)

const updateDatas = () => {
  testAll.value.testWeights = group.value
  store.dispatch('updateTest', testAll.value)
}

onBeforeMount(() => {
  if (!testAll.value.testWeights) {
    console.error('testWeights is undefined')
    return
  }
  
  const heuristicLength = testAll.value.testStructure.length
  group.value = testAll.value.testWeights

  if (Object.keys(testAll.value.testWeights).length === 0) {
    const weightMap = {}
    for (let i = 0; i < heuristicLength - 1; i++) {
      weightMap[i] = new Array(heuristicLength - (i + 1)).fill(null)
    }
    group.value = weightMap
  }
})
</script>

<style scoped>
.justify-space-between {
  justify-content: space-between !important;
}
.padding-left {
  padding-left: 23px;
}
.if-card {
  width: 950px;
  font-size: 18px;
}
.subtitleView {
  font-family: 'Poppins', Helvetica;
  font-style: normal;
  font-weight: 500;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
.tablebody {
  display: contents;
}
.v-input--radio-group__input {
  border: none;
  cursor: default;
  display: flex;
  width: 100%;
  justify-content: space-evenly !important;
}
/* Optional: Customize the active tab indicator */
:deep(.v-tabs .v-tab--active .v-tab__slider) {
  background-color: #FF9800 !important;
}
</style>