<template>
    <div class="eye-tracking-container" style="position: relative;">
        <!-- Config Toggle Button -->
        <v-btn icon color="primary" class="config-btn" elevation="4" rounded @click="configOpen = !configOpen"
            :aria-label="configOpen ? 'Close settings' : 'Open settings'">
            <v-icon>{{ configOpen ? 'mdi-cog-off-outline' : 'mdi-cog-outline' }}</v-icon>
        </v-btn>

        <!-- Config Panel with Transition -->
        <v-slide-x-transition>
            <v-card v-if="configOpen" class="config-panel" elevation="6" rounded outlined>
                <v-card-text>
                    <v-row align="center" justify="space-around" class="g-4">
                        <v-col cols="12" sm="4" class="text-center">
                            <label>
                                Color:
                                <input type="color" v-model="circleColor" />
                            </label>
                        </v-col>

                        <v-col cols="12" sm="4" class="text-center">
                            <v-label class="mb-1">Radius</v-label>
                            <v-slider v-model="circleRadius" min="5" max="100" step="1" ticks tick-size="3"
                                class="mx-auto" style="max-width: 180px;" />
                        </v-col>

                        <v-col cols="12" sm="4" class="text-center">
                            <v-label class="mb-1">Opacity</v-label>
                            <v-slider v-model="circleOpacity" min="0.01" max="1" step="0.01" ticks tick-size="3"
                                class="mx-auto" style="max-width: 180px;" />
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-slide-x-transition>

        <!-- Canvas -->
        <canvas ref="canvas" :width="screenWidth" :height="screenHeight"
            style="border: 1px solid #ccc; display: block; margin: 1rem auto;"></canvas>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
    predictedData: {
        type: Object,
        required: true,
    },
});

const configOpen = ref(false);

const screenWidth = 800;
const screenHeight = 450;

const canvas = ref(null);

// User controls
const circleColor = ref('#ffa500'); // default orange
const circleRadius = ref(5);       // default radius
const circleOpacity = ref(0.80);    // default opacity

// Draw function
function draw() {
    if (!canvas.value) return;

    const ctx = canvas.value.getContext('2d');
    ctx.clearRect(0, 0, screenWidth, screenHeight);

    for (const groupKey in props.predictedData) {
        if (isNaN(groupKey)) continue;

        const group = props.predictedData[groupKey];
        for (const timeKey in group) {
            const data = group[timeKey];
            if (data?.predicted_x && data?.predicted_y) {
                for (let i = 0; i < data.predicted_x.length; i++) {
                    const x = data.predicted_x[i] * (screenWidth / 1920);
                    const y = data.predicted_y[i] * (screenHeight / 1080);
                    ctx.beginPath();
                    ctx.fillStyle = hexToRgba(circleColor.value, circleOpacity.value);
                    ctx.arc(x, y, circleRadius.value, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
}

// Convert HEX to RGBA
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Redraw when any of the controls change
watch([circleColor, circleRadius, circleOpacity], draw, { immediate: true });

// Redraw on mount
onMounted(() => {
    draw();
});
</script>

<style scoped>
.eye-tracking-container {
    max-width: 820px;
    margin: 0 auto;
    position: relative;
}

/* Floating config button bottom right */
.config-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
}

/* Config panel styling */
.config-panel {
    position: fixed;
    bottom: 80px;
    right: 24px;
    width: 360px;
    background-color: white;
    z-index: 999;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: var(--v-shadow-6);
}
</style>
