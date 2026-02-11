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

        <div class="custom-outline space-y-6">
          <v-row align="center" no-gutters class="mb-2">
            <v-col cols="12" sm="9">
              <v-slider
                v-model="pointNumber"
                :min="2"
                :max="9"
                step="1"
                thumb-label
                hide-details
              >
                <template #label>
                  <div class="d-inline-flex align-center">
                    <span class="text-no-wrap">Point Number</span>
                    <v-tooltip
                      content-class="modern-tooltip"
                      location="top"
                      max-width="300"
                      text="Specifies the total number of target points in the calibration grid. Increasing this value enhances mapping accuracy but extends calibration time."
                    >
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="x-small"
                          color="primary"
                          icon="mdi-information-outline"
                          class="ml-1"
                        ></v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="12" sm="3" class="ps-sm-4 pt-2 pt-sm-0">
              <v-text-field
                v-model.number="pointNumber"
                type="number"
                :min="2"
                :max="9"
                density="compact"
                variant="outlined"
                hide-details
                @blur="validatePointNumber"
              />
            </v-col>
          </v-row>

          <v-row align="center" no-gutters class="mb-2">
            <v-col cols="12" sm="9">
              <v-slider
                v-model="samplePerPoint"
                :min="10"
                :max="200"
                step="1"
                thumb-label
                hide-details
              >
                <template #label>
                  <div class="d-inline-flex align-center">
                    <span class="text-no-wrap">Samples Per Point</span>
                    <v-tooltip
                      content-class="modern-tooltip"
                      location="top"
                      max-width="300"
                      text="Determines the number of gaze data packets collected per target. Higher sampling rates improve precision by reducing statistical noise"
                    >
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="x-small"
                          color="primary"
                          icon="mdi-information-outline"
                          class="ml-1"
                        ></v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="12" sm="3" class="ps-sm-4 pt-2 pt-sm-0">
              <v-text-field
                v-model.number="samplePerPoint"
                type="number"
                :min="10"
                :max="200"
                density="compact"
                variant="outlined"
                hide-details
                @blur="validateSamplePerPoint"
              />
            </v-col>
          </v-row>

          <v-row align="center" no-gutters class="mb-2">
            <v-col cols="12" sm="9">
              <v-slider
                v-model="msPerCapture"
                :min="20"
                :max="100"
                step="5"
                thumb-label
                hide-details
              >
                <template #label>
                  <div class="d-inline-flex align-center">
                    <span class="text-no-wrap"
                      >Milliseconds Per Point Capture</span
                    >
                    <v-tooltip
                      content-class="modern-tooltip"
                      location="top"
                      max-width="300"
                      text="The fixed duration (ms) for which each target remains active. Ensures sufficient time for stable gaze fixation during data ingestion."
                    >
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="x-small"
                          color="primary"
                          icon="mdi-information-outline"
                          class="ml-1"
                        ></v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="12" sm="3" class="ps-sm-4 pt-2 pt-sm-0">
              <v-text-field
                v-model.number="msPerCapture"
                type="number"
                :min="20"
                :max="100"
                density="compact"
                variant="outlined"
                hide-details
                @blur="validateMsPerCapture"
              />
            </v-col>
          </v-row>

          <v-row align="center" no-gutters>
            <v-col cols="12" sm="9">
              <v-slider
                v-model="threshold"
                :min="0"
                :max="1000"
                step="5"
                thumb-label
                hide-details
              >
                <template #label>
                  <div class="d-inline-flex align-center">
                    <span class="text-no-wrap">Points Distance Threshold</span>
                    <v-tooltip
                      content-class="modern-tooltip"
                      location="top"
                      max-width="300"
                      text="The maximum spatial variance (in pixels) allowed between samples. Data exceeding this threshold is discarded as an outlier to maintain quality"
                    >
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="x-small"
                          color="primary"
                          icon="mdi-information-outline"
                          class="ml-1"
                        ></v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="12" sm="3" class="ps-sm-4 pt-2 pt-sm-0">
              <v-text-field
                v-model.number="threshold"
                type="number"
                :min="0"
                :max="1000"
                density="compact"
                variant="outlined"
                hide-details
                @blur="validateThreshold"
              />
            </v-col>
          </v-row>
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

const pointNumber = ref(8)
const samplePerPoint = ref(90)
const msPerCapture = ref(100)
const threshold = ref(200)

const getCalibrationConfig = () => {
  const calibrationConfig =
    store.getters.test.calibrationConfig instanceof EyeCalibrationSettings
      ? store.getters.test.calibrationConfig
      : new EyeCalibrationSettings()

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)

  pointNumber.value = calibrationConfig.pointNumber || 8
  samplePerPoint.value = calibrationConfig.samplePerPoint || 90
  msPerCapture.value = calibrationConfig.msPerCapture || 100
  threshold.value = calibrationConfig.threshold || 200
}

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

// Validation functions to maintain colleague's requirements
const validatePointNumber = () => {
  if (pointNumber.value < 2) pointNumber.value = 2
  if (pointNumber.value > 9) pointNumber.value = 9
}

const validateSamplePerPoint = () => {
  if (samplePerPoint.value < 10) samplePerPoint.value = 10
  if (samplePerPoint.value > 200) samplePerPoint.value = 200
}

const validateMsPerCapture = () => {
  if (msPerCapture.value < 20) msPerCapture.value = 20
  if (msPerCapture.value > 100) msPerCapture.value = 100
}

const validateThreshold = () => {
  if (threshold.value < 0) threshold.value = 0
  if (threshold.value > 1000) threshold.value = 1000
}

watch([pointNumber, samplePerPoint, msPerCapture, threshold], () => {
  updateCalibrationConfig()
})

onMounted(() => {
  getCalibrationConfig()
})
</script>

<style scoped>
.custom-outline {
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 20px;
  border-radius: 8px;
  margin: 10px;
}

/* Ensures the text field looks aligned with the slider row */
:deep(.v-text-field .v-field__input) {
  padding-top: 4px;
  padding-bottom: 4px;
  min-height: 40px;
  text-align: center;
}
</style>

<style>
.modern-tooltip {
  background: rgba(33, 33, 33, 0.95) !important;
  backdrop-filter: blur(4px);
  border-radius: 8px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
  padding: 8px 12px;
  font-size: 12px;
}
</style>
