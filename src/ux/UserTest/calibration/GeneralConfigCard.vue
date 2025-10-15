<template>
    <v-container>
        <v-col>
            <v-card flat>
                <v-card-title class="text-h5 font-weight-bold mb-4"
                    :style="{ color: $vuetify.theme.current.colors['on-surface'] }">
                    General Configuration
                </v-card-title>

                <div class="custom-outline space-y-4">
                    <!-- Point Number -->
                    <v-tooltip text="Number of calibration points shown on the screen (more points = higher accuracy).">
                        <template #activator="{ props }">
                            <v-slider v-bind="props" v-model="pointNumber" :min="2" :max="9" step="1"
                                label="Point Number" thumb-label />
                        </template>
                    </v-tooltip>

                    <!-- Samples Per Point -->
                    <v-tooltip
                        text="How many gaze samples are collected per calibration point. Higher values improve precision but increase duration.">
                        <template #activator="{ props }">
                            <v-slider v-bind="props" v-model="samplePerPoint" :min="10" :max="200" step="1"
                                label="Samples Per Point" thumb-label />
                        </template>
                    </v-tooltip>

                    <!-- Milliseconds Per Point Capture -->
                    <v-tooltip
                        text="Duration (in milliseconds) to capture data per point. Defines how long the user must look at each target.">
                        <template #activator="{ props }">
                            <v-slider v-bind="props" v-model="msPerCapture" :min="20" :max="100" step="5"
                                label="Milliseconds Per Point Capture" thumb-label />
                        </template>
                    </v-tooltip>

                    <!-- Points Distance Threshold -->
                    <v-tooltip
                        text="Maximum distance (in pixels) allowed between calibration samples before they are discarded. Controls spatial tolerance.">
                        <template #activator="{ props }">
                            <v-slider v-bind="props" v-model="threshold" :min="0" :max="1000" step="5"
                                label="Points Distance Threshold" thumb-label />
                        </template>
                    </v-tooltip>
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
    border-radius: 5px;margin: 10px;
}
</style>