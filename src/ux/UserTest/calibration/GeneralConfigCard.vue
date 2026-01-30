<template>
    <v-container>
        <v-col>
            <v-card flat>
                <v-card-title
class="text-h5 font-weight-bold mb-4"
                    :style="{ color: $vuetify.theme.current.colors['on-surface'] }">
                    General Configuration
                </v-card-title>

                <div class="custom-outline space-y-4">
                    <!-- Point Number -->
                    <div class="config-item">
                        <v-tooltip text="Number of calibration points shown on the screen (more points = higher accuracy).">
                            <template #activator="{ props }">
                                <v-slider
                                    v-bind="props" 
                                    v-model="pointNumber" 
                                    :min="2" 
                                    :max="9" 
                                    step="1"
                                    label="Point Number" 
                                    thumb-label 
                                    class="slider-input" />
                            </template>
                        </v-tooltip>
                        <v-text-field
                            v-model.number="pointNumber"
                            type="number"
                            :min="2"
                            :max="9"
                            step="1"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="number-input"
                            placeholder="2-9"
                            @blur="validatePointNumber" />
                    </div>

                    <!-- Samples Per Point -->
                    <div class="config-item">
                        <v-tooltip
                            text="How many gaze samples are collected per calibration point. Higher values improve precision but increase duration.">
                            <template #activator="{ props }">
                                <v-slider
                                    v-bind="props" 
                                    v-model="samplePerPoint" 
                                    :min="10" 
                                    :max="200" 
                                    step="1"
                                    label="Samples Per Point" 
                                    thumb-label 
                                    class="slider-input" />
                            </template>
                        </v-tooltip>
                        <v-text-field
                            v-model.number="samplePerPoint"
                            type="number"
                            :min="10"
                            :max="200"
                            step="1"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="number-input"
                            placeholder="10-200"
                            @blur="validateSamplePerPoint" />
                    </div>

                    <!-- Milliseconds Per Point Capture -->
                    <div class="config-item">
                        <v-tooltip
                            text="Duration (in milliseconds) to capture data per point. Defines how long the user must look at each target.">
                            <template #activator="{ props }">
                                <v-slider
                                    v-bind="props" 
                                    v-model="msPerCapture" 
                                    :min="20" 
                                    :max="100" 
                                    step="5"
                                    label="Milliseconds Per Point Capture" 
                                    thumb-label 
                                    class="slider-input" />
                            </template>
                        </v-tooltip>
                        <v-text-field
                            v-model.number="msPerCapture"
                            type="number"
                            :min="20"
                            :max="100"
                            step="5"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="number-input"
                            placeholder="20-100"
                            @blur="validateMsPerCapture" />
                    </div>

                    <!-- Points Distance Threshold -->
                    <div class="config-item">
                        <v-tooltip
                            text="Maximum distance (in pixels) allowed between calibration samples before they are discarded. Controls spatial tolerance.">
                            <template #activator="{ props }">
                                <v-slider
                                    v-bind="props" 
                                    v-model="threshold" 
                                    :min="0" 
                                    :max="1000" 
                                    step="5"
                                    label="Points Distance Threshold" 
                                    thumb-label 
                                    class="slider-input" />
                            </template>
                        </v-tooltip>
                        <v-text-field
                            v-model.number="threshold"
                            type="number"
                            :min="0"
                            :max="1000"
                            step="5"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="number-input"
                            placeholder="0-1000"
                            @blur="validateThreshold" />
                    </div>
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
    const calibrationConfig = store.getters.test.calibrationConfig instanceof EyeCalibrationSettings
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

// Validation methods to ensure values stay within bounds
const validatePointNumber = () => {
    if (isNaN(pointNumber.value) || pointNumber.value === null || pointNumber.value === undefined) {
        pointNumber.value = 8 // default value
    } else if (pointNumber.value < 2) {
        pointNumber.value = 2 // minimum value
    } else if (pointNumber.value > 9) {
        pointNumber.value = 9 // maximum value
    }
}

const validateSamplePerPoint = () => {
    if (isNaN(samplePerPoint.value) || samplePerPoint.value === null || samplePerPoint.value === undefined) {
        samplePerPoint.value = 90 // default value
    } else if (samplePerPoint.value < 10) {
        samplePerPoint.value = 10 // minimum value
    } else if (samplePerPoint.value > 200) {
        samplePerPoint.value = 200 // maximum value
    }
}

const validateMsPerCapture = () => {
    if (isNaN(msPerCapture.value) || msPerCapture.value === null || msPerCapture.value === undefined) {
        msPerCapture.value = 100 // default value
    } else if (msPerCapture.value < 20) {
        msPerCapture.value = 20 // minimum value
    } else if (msPerCapture.value > 100) {
        msPerCapture.value = 100 // maximum value
    }
}

const validateThreshold = () => {
    if (isNaN(threshold.value) || threshold.value === null || threshold.value === undefined) {
        threshold.value = 200 // default value
    } else if (threshold.value < 0) {
        threshold.value = 0 // minimum value
    } else if (threshold.value > 1000) {
        threshold.value = 1000 // maximum value
    }
}

watch([pointNumber, samplePerPoint, msPerCapture, threshold], () => {
    updateCalibrationConfig();
});

onMounted(() => {
    getCalibrationConfig()
})
</script>


<style scoped>
.custom-outline {
    border: 1px solid #000;
    padding: 10px;
    border-radius: 5px;
    margin: 10px;
}

.config-item {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.slider-input {
    flex: 1;
    min-width: 0;
}

.number-input {
    flex: 0 0 120px;
    max-width: 120px;
}

/* Ensure proper spacing between config items */
.config-item:last-child {
    margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .config-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }
    
    .number-input {
        flex: 1;
        max-width: none;
    }
}
</style>