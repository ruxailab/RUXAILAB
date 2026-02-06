<template>
  <v-container>
    <v-col>
      <v-card flat>
        <v-card-title
          class="text-h5 font-weight-bold mb-4"
          :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
        >
          Miscellaneous Configuration
        </v-card-title>

        <div class="custom-outline">
          <div class="d-flex align-center">
            <span class="mr-2">Control:</span>
            <v-tooltip
              location="top"
              text="Enable to override default theme colors with specific background and stimulus point colors."
            >
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  size="x-small"
                  color="primary"
                  icon="mdi-information-outline"
                ></v-icon>
              </template>
            </v-tooltip>
          </div>
          <v-checkbox
            v-model="customColors"
            label="Use Custom Colors"
            color="primary"
            hide-details
          ></v-checkbox>
        </div>

        <v-expand-transition>
          <div v-if="customColors" class="d-flex flex-wrap">
            <div class="custom-outline flex-grow-1">
              <p class="text-subtitle-2 mb-2">Background Color</p>
              <v-color-picker
                v-model="backgroundColor"
                hide-inputs
                show-swatches
              ></v-color-picker>
            </div>
            <div class="custom-outline flex-grow-1">
              <p class="text-subtitle-2 mb-2">Point Color</p>
              <v-color-picker
                v-model="pointColor"
                hide-inputs
                show-swatches
              ></v-color-picker>
            </div>
          </div>
        </v-expand-transition>

        <div class="custom-outline">
          <div class="d-flex align-center mb-2">
            <span class="mr-2">Model Selection:</span>
            <v-tooltip
              location="top"
              max-width="300"
              text="Select the mathematical regression model used to map raw eye-tracking data to screen coordinates."
            >
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  size="x-small"
                  color="primary"
                  icon="mdi-information-outline"
                ></v-icon>
              </template>
            </v-tooltip>
          </div>
          <v-select
            v-model="selectedModel"
            :items="availableModels"
            variant="outlined"
            density="compact"
            placeholder="Select Regression Model"
          ></v-select>
        </div>

        <div class="custom-outline bg-grey-lighten-4">
          <v-icon
            icon="mdi-alert-circle-outline"
            size="small"
            class="mr-1"
          ></v-icon>
          <span class="text-caption">
            <strong>Note:</strong> The selected regression model directly
            impacts the computational overhead during calibration. Default is
            <strong>Linear Regression</strong>. High-complexity models may
            increase training latency.
          </span>
        </div>
      </v-card>
    </v-col>
  </v-container>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import EyeCalibrationSettings from '../models/EyeCalibrationSettings'

const store = useStore()

// --- State Management: Miscellaneous Refs ---
const backgroundColor = ref('#FFFFFFFF')
const pointColor = ref('#000000FF')
const customColors = ref(false)
const selectedModel = ref('Linear Regression')

// List of supported mathematical models for gaze mapping
const availableModels = [
  'Linear Regression',
  'Ridge Regression',
  'Lasso Regression',
  'Elastic Net',
  'Bayesian Ridge',
  'SGD Regressor',
  'Support Vector Regressor',
]

/**
 * Data Ingestion: Loads configuration from Vuex store.
 */
const getCalibrationConfig = () => {
  const calibrationConfig =
    store.getters.test.calibrationConfig instanceof EyeCalibrationSettings
      ? store.getters.test.calibrationConfig
      : new EyeCalibrationSettings()

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)

  backgroundColor.value = calibrationConfig.backgroundColor || '#FFFFFFFF'
  pointColor.value = calibrationConfig.pointColor || '#000000FF'
  customColors.value = calibrationConfig.customColors || false
  selectedModel.value = calibrationConfig.models || 'Linear Regression'
}

/**
 * State Synchronization: Persists UI changes back to the global store.
 */
const updateCalibrationConfig = () => {
  const calibrationConfig = new EyeCalibrationSettings({
    ...store.getters.test.calibrationConfig,
    backgroundColor: backgroundColor.value,
    pointColor: pointColor.value,
    customColors: customColors.value,
    models: selectedModel.value,
  })

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)
}

// Auto-sync watcher
watch([backgroundColor, pointColor, customColors, selectedModel], () => {
  updateCalibrationConfig()
})

onMounted(() => {
  getCalibrationConfig()
})
</script>

<style scoped>
.custom-outline {
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 15px;
  border-radius: 10px;
  margin: 10px;
  background-color: #fff;
}

.bg-grey-lighten-4 {
  background-color: #f5f5f5 !important;
  border-left: 4px solid #1976d2 !important;
}
</style>
