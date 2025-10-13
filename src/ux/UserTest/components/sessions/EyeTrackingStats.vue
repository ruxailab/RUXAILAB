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

        <!-- Área para visualização (mock por enquanto) -->
        <v-sheet class="d-flex align-center justify-center pa-6" color="#fafafa" rounded="lg">
            <span class="text-grey">[Eye tracking visualization placeholder]</span>
        </v-sheet>
    </v-card>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    accuracy: { type: Number, default: 92 },
    fixations: { type: Number, default: 34 },
})

const selectedView = ref('prediction')
</script>

<style scoped>
.v-btn-toggle .v-btn.v-btn--active {
    background-color: #1976d2 !important;
    color: white !important;
}
</style>
