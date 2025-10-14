<template>
    <v-card flat class="pa-4">
        <!-- Título -->
        <h4 class="text-h5 mb-4">Eye Tracking Analytics</h4>

        <!-- Cards com métricas -->
        <v-row class="mb-4" dense>
            <v-col cols="6">
                <v-card outlined rounded="lg" class="pa-4">
                    <div class="text-caption text-grey-darken-1 mb-1">Accuracy</div>
                    <div class="text-h5 font-weight-bold">{{ accuracy }}%</div>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card outlined rounded="lg" class="pa-4">
                    <div class="text-caption text-grey-darken-1 mb-1">Fixations</div>
                    <div class="text-h5 font-weight-bold">{{ fixations }}</div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Seletor de visualização -->
        <div class="mb-6">
            <div class="text-caption text-grey-darken-1 mb-2">Visualization Style</div>
            <v-btn-toggle v-model="selectedView" color="primary" rounded="lg" group>
                <v-btn value="prediction" class="px-4">
                    <v-icon start>mdi-crosshairs-gps</v-icon> Prediction Points
                </v-btn>
                <v-btn value="heatmap" class="px-4">
                    <v-icon start>mdi-fire</v-icon> Heatmap
                </v-btn>
                <v-btn value="free" class="px-4">
                    <v-icon start>mdi-eye</v-icon> Free Eye
                </v-btn>
            </v-btn-toggle>
        </div>

        <!-- Área para visualização (mostra a resposta da API) -->
        <v-sheet class="d-flex align-center justify-center pa-6" color="#fafafa" rounded="lg">
            <span class="text-grey" v-if="!predictedData">Carregando predições...</span>
            <pre v-else class="text-left" style="white-space: pre-wrap;">{{ predictedData }}</pre>
        </v-sheet>
    </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex';

const props = defineProps({
    accuracy: { type: Number, default: 92 },
    fixations: { type: Number, default: 34 },
    irisData: { type: Array, required: true }
})

const store = useStore();
const calibrationConfig = computed(() => store.state.Tests.Test.calibrationConfig || {})
const selectedView = ref('prediction')
const predictedData = ref(null)

onMounted(async () => {
    try {
        const response = await axios.post(process.env.VUE_APP_EYE_LAB_BACKEND_URL + '/api/session/batch_predict', {
            k: calibrationConfig.value.pointNumber,
            screen_height: 1080,
            screen_width: 1920,
            iris_tracking_data: props.irisData
        }, {
            headers: { 'Content-Type': 'application/json' }
        })

        predictedData.value = JSON.stringify(response.data, null, 2)
        console.log('Resposta do backend:', response.data)
    } catch (error) {
        console.error('Erro ao chamar batch_predict:', error)
        predictedData.value = 'Erro ao obter predições.'
    }
})
</script>

<style scoped>
.v-btn-toggle .v-btn.v-btn--active {
    background-color: #1976d2 !important;
    color: white !important;
}
</style>
