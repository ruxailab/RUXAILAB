<template>
    <v-card variant="outlined" elevation="2" rounded="xl" class="pa-4 overflow-y-auto">
        <!-- Header -->
        <v-row class="mb-4" align="center" justify="space-between">
            <v-col cols="auto">
                <h3 class="text-h5 font-weight-bold mb-1">Eye Tracking Analytics</h3>
                <div class="text-body-2 text-grey">
                    Gaze precision and prediction insights
                </div>
            </v-col>
            <v-col cols="auto">
                <v-chip :color="isAnalyzing ? 'grey' : hasError ? 'red-darken-2' : 'primary'" variant="flat"
                    prepend-icon="mdi-eye">
                    {{ isAnalyzing ? 'Analyzing...' : hasError ? 'Analysis Failed' : 'Analysis Completed' }}
                </v-chip>
            </v-col>
        </v-row>

        <!-- Loading -->
        <v-row v-if="isAnalyzing && !hasError" justify="center" align="center" class="my-12">
            <v-col cols="auto" class="text-center">
                <v-progress-circular indeterminate size="64" color="primary" />
                <div class="mt-3 text-body-1 font-weight-medium">Analyzing gaze data...</div>
                <div class="mt-1 text-body-2 text-grey-darken-1">This may take a few seconds</div>
            </v-col>
        </v-row>

        <!-- Error -->
        <v-row v-else-if="hasError" justify="center" align="center" class="my-12">
            <v-col cols="auto" class="text-center">
                <v-icon size="64" color="red-darken-2">mdi-alert-circle-outline</v-icon>
                <div class="mt-3 text-body-1 font-weight-medium">Analysis failed</div>
                <div class="mt-1 text-body-2 text-grey-darken-1">
                    Could not process gaze data. Please try again later.
                </div>
            </v-col>
        </v-row>

        <!-- Results -->
        <v-row v-else>
            <!-- Summary Metrics -->
            <v-col v-for="metric in summaryMetrics" :key="metric.label" cols="12" sm="6" md="6">
                <v-card class="pa-4" elevation="2" rounded="xl">
                    <div class="d-flex justify-space-between align-center mb-1">
                        <span class="font-weight-medium text-grey-darken-1">{{ metric.label }}</span>
                        <v-icon :color="metric.color">{{ metric.icon }}</v-icon>
                    </div>
                    <div class="text-h6 font-weight-bold">{{ metric.value }}</div>
                    <v-progress-linear :model-value="metric.progress" :color="metric.color" height="6" class="mt-2"
                        rounded />
                </v-card>
            </v-col>

            <!-- Visualization -->
            <v-col cols="12" md="12">
                <v-card class="pa-4" elevation="2" rounded="xl">
                    <h4 class="text-subtitle-1 font-weight-medium mb-3">Prediction Overview</h4>

                    <v-btn-toggle v-model="selectedView" class="mb-2 d-flex justify-space-between" divided mandatory>
                        <v-btn value="precision" variant="outlined"
                            :color="selectedView === 'precision' ? 'blue-darken-2' : 'blue-lighten-3'"
                            class="px-8 py-3 rounded-lg font-weight-medium">
                            <v-icon start :color="selectedView === 'precision' ? 'blue-darken-2' : 'blue-lighten-3'">
                                mdi-crosshairs-gps
                            </v-icon>
                            Prediction Points
                        </v-btn>

                        <v-btn value="heatmap" variant="outlined"
                            :color="selectedView === 'heatmap' ? 'orange-darken-2' : 'orange-lighten-3'"
                            class="px-8 py-3 rounded-lg font-weight-medium">
                            <v-icon start :color="selectedView === 'heatmap' ? 'orange-darken-2' : 'orange-lighten-3'">
                                mdi-fire
                            </v-icon>
                            Heatmap
                        </v-btn>

                        <v-btn value="free" variant="outlined"
                            :color="selectedView === 'free' ? 'red-darken-2' : 'red-lighten-3'"
                            class="px-8 py-3 rounded-lg font-weight-medium">
                            <v-icon start :color="selectedView === 'free' ? 'red-darken-2' : 'red-lighten-3'">
                                mdi-eye
                            </v-icon>
                            Free Eye
                        </v-btn>
                    </v-btn-toggle>
                </v-card>
            </v-col>


            <!-- Insights -->
            <v-col cols="12" md="12">
                <v-card class="pa-4" elevation="2" rounded="xl">
                    <h4 class="text-subtitle-1 font-weight-medium mb-3">Key Insights</h4>
                    <v-row>
                        <v-col v-for="(insight, index) in insights" :key="index" cols="12">
                            <v-alert :type="insight.type" variant="tonal" class="rounded-xl" border="start"
                                :border-color="insight.color">
                                <v-icon class="mr-2" :color="insight.color">{{ insight.icon }}</v-icon>
                                <span class="font-weight-medium">{{ insight.text }}</span>
                            </v-alert>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'

const props = defineProps({
    irisData: { type: Array, required: true },
    userId: { type: String, required: true }
})

const emit = defineEmits(['predictions-ready', 'view-changed'])
const store = useStore()

const calibrationConfig = computed(() => store.state.Tests.Test.calibrationConfig || {})
const selectedView = ref('precision')
const predictedData = ref(null)
const isAnalyzing = ref(true)
const hasError = ref(false)

const accuracy = ref(0)
const totalPredictions = ref(0)
const insights = ref([])
const summaryMetrics = ref([])

watch(selectedView, (value) => emit('view-changed', value))

onMounted(async () => {
    try {
        console.log(calibrationConfig);

        const res = await axios.post(
            process.env.VUE_APP_EYE_LAB_BACKEND_URL + '/api/session/batch_predict',
            {
                k: calibrationConfig.value.pointNumber,
                screen_height: 1080,
                screen_width: 2560,
                iris_tracking_data: props.irisData,
                calib_id: props.userId
            },
            { headers: { 'Content-Type': 'application/json' } }
        )

        const data = res.data
        predictedData.value = JSON.stringify(data, null, 2)

        processAnalytics(data)
        emit('predictions-ready', data)
        console.log('✅ Eye Tracking Data:', data)
    } catch (err) {
        console.error('❌ Eye tracking error:', err)
        predictedData.value = 'Error loading predictions.'
        hasError.value = true
    } finally {
        isAnalyzing.value = false
    }
})

function processAnalytics(data) {
    // Calcula métricas básicas
    const predictions = Array.isArray(data?.predictions)
        ? data.predictions
        : Object.values(data || {})

    totalPredictions.value = predictions.length || 0

    const accuracies = predictions.map((p) => p.accuracy || 0)
    accuracy.value = accuracies.length
        ? Number(((accuracies.reduce((a, b) => a + b, 0) / accuracies.length) * 10).toFixed(1))
        : 0

    // Atualiza métricas
    summaryMetrics.value = [
        {
            label: 'Average Accuracy',
            value: `${accuracy.value}%`,
            progress: accuracy.value,
            color: accuracy.value > 85 ? 'light-green-darken-2' : accuracy.value > 60 ? 'amber-darken-2' : 'red-darken-2',
            icon: accuracy.value > 85 ? 'mdi-check-circle' : accuracy.value > 60 ? 'mdi-alert-circle' : 'mdi-close-circle',
        },
        {
            label: 'Total Predictions',
            value: totalPredictions.value,
            progress: Math.min(totalPredictions.value / 10, 100), // escala simbólica
            color: 'indigo-darken-2',
            icon: 'mdi-eye-outline',
        },
    ]

    generateInsights(accuracy.value, totalPredictions.value)
}

function generateInsights(acc, total) {
    insights.value = []

    if (acc > 90)
        insights.value.push({
            text: `Exceptional tracking accuracy (${acc}%), indicating very stable gaze estimation.`,
            color: 'light-green-darken-2',
            icon: 'mdi-target',
            type: 'success',
        })
    else if (acc > 70)
        insights.value.push({
            text: `Good overall precision (${acc}%), with minor deviations detected.`,
            color: 'amber-darken-2',
            icon: 'mdi-crosshairs',
            type: 'warning',
        })
    else
        insights.value.push({
            text: `Low tracking accuracy (${acc}%) suggests possible calibration or lighting issues.`,
            color: 'red-darken-2',
            icon: 'mdi-alert',
            type: 'error',
        })

    if (total > 200)
        insights.value.push({
            text: `High number of gaze predictions (${total}), ensuring detailed tracking granularity.`,
            color: 'indigo-darken-2',
            icon: 'mdi-chart-timeline-variant',
            type: 'info',
        })
    else if (total < 50)
        insights.value.push({
            text: `Few predictions (${total}) detected — user might have looked away or low sampling occurred.`,
            color: 'blue-grey-darken-1',
            icon: 'mdi-eye-off-outline',
            type: 'info',
        })
    else
        insights.value.push({
            text: `${total} predictions collected — optimal tracking density for analysis.`,
            color: 'blue-darken-1',
            icon: 'mdi-eye-outline',
            type: 'info',
        })
}
</script>
