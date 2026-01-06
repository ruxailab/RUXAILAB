<template>

    <v-card
      elevation="2"
      class="pa-6"
    >
      <!-- Header Section -->
      <h1 class="text-h4 font-weight-bold text-on-surface mb-4">
        {{ $t('HeuristicsWeightsTable.titles.weights') }}
      </h1>
      <v-divider class="mb-6" />

      <!-- Empty State for Insufficient Heuristics -->
      <v-card
        v-if="heuristics.length < 2"
        class="text-center pa-8"
        variant="outlined"
        style="background-color: transparent;"
      >
        <v-icon
          icon="mdi-information-outline"
          size="64"
          color="primary"
          class="mb-4"
        />
        <h3 class="text-h6 text-ternary mb-2">
          {{ $t('HeuristicsWeightsTable.messages.atLeast2HeuristicsForWeighting') }}
        </h3>
      </v-card>

      <!-- Weights Content -->
      <v-card
        v-else
        elevation="0"
        style="background-color: transparent;"
      >
        <!-- Weights Header Tabs -->
        <v-tabs
          v-model="tabs"
          color="accent"
          class="mb-6"
          density="compact"
          bg-color="#F5F7FF"
          show-arrows
        >
          <v-tab
            v-for="(heuri, index) in heuristics.length - 1"
            :key="index"
            class="text-none font-weight-medium"
            :class="{ 'active-weight-tab': tabs === index }"
          >
            <v-tooltip location="top">
              <template #activator="{ props }">
                <span v-bind="props">H {{ index + 1 }}</span>
              </template>
              <span>{{ heuristics[index]?.title || 'Unknown Heuristic' }}</span>
            </v-tooltip>
          </v-tab>
        </v-tabs>

        <!-- Weights Content -->
        <v-tabs-window v-model="tabs">
          <v-tabs-window-item
            v-for="(n, pes) in heuristics.length - 1"
            :key="pes"
            :value="pes"
            style="background-color: #F5F7FF;"
          >
            <v-card
              variant="outlined"
              class="weights-table"
            >
              <!-- Table Header -->
              <div class="d-flex align-center pa-4 bg-grey-lighten-4">
                <div class="weights-header-cell">
                  <span class="text-body-1 font-weight-medium text-on-surface">
                    {{ $t('HeuristicsWeightsTable.titles.heuristics') }}
                  </span>
                </div>
                <div class="weights-header-cell text-center">
                  <span class="text-body-1 font-weight-medium text-on-surface">
                    {{ $t('HeuristicsWeightsTable.titles.weights') }}
                  </span>
                </div>
              </div>

              <v-divider />

              <!-- Table Rows -->
              <div
                v-for="(f, tam) in heuristics.length - (tabs + 1)"
                :key="tam"
                class="d-flex align-center pa-4 weights-row"
              >
                <!-- Heuristic Name -->
                <div class="weights-cell">
                  <div class="d-flex align-center">
                    <v-chip
                      color="accent"
                      variant="tonal"
                      size="small"
                      class="me-3"
                    >
                      H{{ f + (tabs + 1) }}
                    </v-chip>
                    <span class="text-body-1 text-on-surface">
                      {{ heuristics[f + tabs]?.title || 'Unknown Heuristic' }}
                    </span>
                    <v-tooltip location="right">
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          color="#FCA326"
                          size="small"
                          class="ml-2"
                        >
                          mdi-help-circle
                        </v-icon>
                      </template>
                      <span>{{ heuristics[f + tabs]?.title || 'Unknown Heuristic' }}</span>
                    </v-tooltip>
                  </div>
                </div>

                <!-- Weight Radio Buttons -->
                <div class="weights-cell">
                  <v-radio-group
                    v-model="group[tabs][tam]"
                    inline
                    hide-details
                    class="weight-radio-group"
                    density="compact"
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
                          color="#FCA326"
                          class="weight-radio"
                          true-icon="mdi-check-circle-outline"
                          false-icon="mdi-checkbox-blank-circle-outline"
                        />
                      </template>
                      <span>
                        H{{ tabs + 1 }} has {{ importt[rad] }} than H{{ f + (tabs + 1) }}
                      </span>
                    </v-tooltip>
                  </v-radio-group>
                </div>
              </div>
            </v-card>

            <!-- Save Button -->
            <div class="text-center mt-6">
              <v-btn
                color="accent"
                variant="elevated"
                size="large"
                class="text-none px-8"
                @click="updateDatas"
              >
                {{ $t('HeuristicsWeightsTable.actions.saveWeights') }}
              </v-btn>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
    </v-card>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { showSuccess, showError } from '@/shared/utils/toast'


const emit = defineEmits(['change']);
const store = useStore();
const { t } = useI18n();

const tabs = ref(0);
const group = ref({});
const importance = ref({
  'Equal Importance': 1,
  'Moderately Importance': 2,
  'Strongly Importance': 3,
  'Very Strongly Importance': 4,
  'Extreme Importance': 5,
  'Moderately Less Important': 6,
  'Strongly Less Important': 7,
  'Very Strongly Less Important': 8,
  'Extremely Less Important': 9,
});
const importt = ref([
  'Equal Importance',
  'Moderately Importance',
  'Strongly Importance',
  'Very Strongly Importance',
  'Extremely Importance',
  'Moderately Less Important',
  'Strongly Less Important',
  'Very Strongly Less Important',
  'Extremely Less Important',
]);

const heuristics = computed(() => store.getters.heuristics || []);

const updateDatas = () => {
  try {
    store.dispatch('setTestWeights', { ...group.value });
    emit('change');
    showSuccess('HeuristicsWeightsTable.messages.weightsSaved');
  } catch (error) {
    console.error('Error saving weights:', error);
    showError('HeuristicsWeightsTable.errors.failedToSaveWeights');
  }
};

onBeforeMount(() => {
  const heuristicLength = heuristics.value.length;
  const testWeights = store.getters.testWeights || {};

  if (Object.keys(testWeights).length === 0) {
    const weightMap = {};
    for (let i = 0; i < heuristicLength - 1; i++) {
      weightMap[i] = new Array(heuristicLength - (i + 1)).fill(null);
    }
    group.value = weightMap;
  } else {
    group.value = { ...testWeights };
  }
});
</script>

<style scoped>
.weights-table {
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow-x: auto; /* ADDED: Allows horizontal scrolling */
}

.weights-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
  min-width: 700px; /* ADDED: Prevents rows from shrinking too much */
}

.weights-row:hover {
  background-color: rgba(59, 130, 246, 0.02);
}

.weights-row:last-child {
  border-bottom: none;
}

.weights-header-cell {
  flex: 1;
  min-width: 200px; /* ADDED: Prevents header from shrinking */
}

.weights-cell {
  flex: 1;
  min-width: 0; /* ADDED: Allows flex item to shrink */
}

.weights-cell:first-child {
  flex: 0 0 250px; /* Reduced from 300px */
  min-width: 250px; /* ADDED: Prevents it from shrinking too much */
}

.weight-radio-group {
  display: flex;
  gap: 16px; /* Reduced from 24px */
  justify-content: center;
  min-width: 650px; /* ADDED: Ensures radio group has enough space */
}

/* ADDED: Truncate long heuristic names */
.weights-cell:first-child .text-body-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

:deep(.weight-radio .v-selection-control) {
  min-height: auto;
}

:deep(.weight-radio .v-label) {
  font-size: 14px;
  font-weight: 500;
}

.active-weight-tab {
  border-bottom: 2px solid #F97316 !important;
}

:deep(.v-tabs-slider) {
  background-color: #F97316;
}

:deep(.v-tab--selected) {
  color: #F97316;
}

:deep(.v-btn--variant-elevated) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.v-btn--variant-elevated:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.subtitleView {
  font-family: 'Poppins', Helvetica;
  font-style: normal;
  font-weight: 500;
  font-size: 18.1818px;
  color: #000000;
}
</style>