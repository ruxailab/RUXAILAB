<template>
  <v-container>
    <v-col>
      <v-card flat>
        <v-card-title
          class="text-h5 font-weight-bold mb-4"
          :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
        >
          General Configuration
        </v-card-title>

        <div class="custom-outline space-y-4">
          <v-slider
            v-model="pointNumber"
            :min="2"
            :max="9"
            step="1"
            thumb-label
          >
            <template #label>
              <div class="d-flex align-center">
                Point Number
                <v-tooltip
                  content-class="modern-tooltip"
                  location="top"
                  max-width="300"
                  offset="10"
                  text="Specifies the total number of target points in the calibration grid. Increasing this value enhances mapping accuracy but extends calibration time."
                >
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="x-small"
                      color="primary"
                      icon="mdi-information-outline"
                      class="ml-2"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-slider>

          <v-slider
            v-model="samplePerPoint"
            :min="10"
            :max="200"
            step="1"
            thumb-label
          >
            <template #label>
              <div class="d-flex align-center">
                Samples Per Point
                <v-tooltip
                  content-class="modern-tooltip"
                  location="top"
                  max-width="300"
                  offset="10"
                  text="Determines the number of gaze data packets collected per target. Higher sampling rates improve precision by reducing statistical noise"
                >
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="x-small"
                      color="primary"
                      icon="mdi-information-outline"
                      class="ml-2"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-slider>

          <v-slider
            v-model="msPerCapture"
            :min="20"
            :max="100"
            step="5"
            thumb-label
          >
            <template #label>
              <div class="d-flex align-center">
                Milliseconds Per Point Capture
                <v-tooltip
                  content-class="modern-tooltip"
                  location="top"
                  max-width="300"
                  offset="10"
                  text="The fixed duration (ms) for which each target remains active. Ensures sufficient time for stable gaze fixation during data ingestion."
                >
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="x-small"
                      color="primary"
                      icon="mdi-information-outline"
                      class="ml-2"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-slider>

          <v-slider
            v-model="threshold"
            :min="0"
            :max="1000"
            step="5"
            thumb-label
          >
            <template #label>
              <div class="d-flex align-center">
                Points Distance Threshold
                <v-tooltip
                  content-class="modern-tooltip"
                  location="top"
                  max-width="300"
                  offset="10"
                  text="The maximum spatial variance (in pixels) allowed between samples. Data exceeding this threshold is discarded as an outlier to maintain quality"
                >
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="x-small"
                      color="primary"
                      icon="mdi-information-outline"
                      class="ml-2"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-slider>
        </div>

        <div class="custom-outline">
          <RadiusCalibration />
          <OffsetCalibration />
        </div>
      </v-card>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import RadiusCalibration from './RadiusCalibration.vue'
import OffsetCalibration from './OffsetCalibration.vue'
import EyeCalibrationSettings from '../models/EyeCalibrationSettings'

const store = useStore()

// --- State Management: Calibration Reactive References ---
// These refs hold the local state for the calibration settings shown in the UI.
const pointNumber = ref(8)
const samplePerPoint = ref(90)
const msPerCapture = ref(100)
const threshold = ref(200)

/**
 * Data Initialization:
 * Fetches existing calibration configuration from the store.
 * Initializes the settings model if not already present in the Vuex state.
 */
const getCalibrationConfig = () => {
  const calibrationConfig =
    store.getters.test.calibrationConfig instanceof EyeCalibrationSettings
      ? store.getters.test.calibrationConfig
      : new EyeCalibrationSettings()

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)

  // Syncing local refs with the store data
  pointNumber.value = calibrationConfig.pointNumber || 8
  samplePerPoint.value = calibrationConfig.samplePerPoint || 90
  msPerCapture.value = calibrationConfig.msPerCapture || 100
  threshold.value = calibrationConfig.threshold || 200
}

/**
 * State Synchronization:
 * Updates the global store with new calibration settings whenever a value changes.
 * Creates a new instance of EyeCalibrationSettings to maintain data integrity and trigger reactivity.
 */
const updateCalibrationConfig = () => {
  const calibrationConfig = new EyeCalibrationSettings({
    ...store.getters.test.calibrationConfig,
    pointNumber: pointNumber.value,
    samplePerPoint: samplePerPoint.value,
    msPerCapture: msPerCapture.value,
    threshold: threshold.value,
  })

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)
}

// --- Watchers ---
// Automatically sync UI changes to the Vuex store to ensure data persistence during the session.
watch([pointNumber, samplePerPoint, msPerCapture, threshold], () => {
  updateCalibrationConfig()
})

// --- Lifecycle Hooks ---
// Initial data fetch happens when the component is first mounted to the DOM.
onMounted(() => {
  getCalibrationConfig()
})
</script>

<style scoped>
/**
 * Styling for the calibration blocks.
 * Provides a clear visual boundary (outline) for different configuration sections.
 */
.custom-outline {
  border: 1px solid #000;
  padding: 10px;
  border-radius: 5px;
  margin: 10px;
}
</style>

<style>
.modern-tooltip {
  background: rgba(33, 33, 33, 0.95) !important;
  backdrop-filter: blur(4px);
  border-radius: 8px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
}
</style>
