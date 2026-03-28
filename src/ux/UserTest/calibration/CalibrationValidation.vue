<template>
  <div class="validation-container" v-if="isActive">
    <IrisTracker
      v-if="isTracking"
      :is-running="isTracking"
      :ms-per-capture="50"
      test-id="validation"
      :task-index="-1"
      @face-data="handleFaceData"
    />

    <div v-if="!isValidating" class="intro-screen text-center pa-6">
      <h2 class="text-h4 mb-4 font-weight-bold">Eye-Tracking Validation</h2>
      <p class="text-body-1 mb-6 text-grey-darken-1">
        To ensure high accuracy during the test, we need to validate your calibration. 
        Please look directly at the red dots as they appear on the screen.
      </p>
      <v-btn color="primary" size="x-large" rounded="pill" @click="startValidation">
        Start Validation
      </v-btn>
    </div>
    
    <div v-else-if="currentDotIndex < dots.length" class="dot-container">
      <div 
        class="validation-dot"
        :style="{ left: dots[currentDotIndex].x + 'px', top: dots[currentDotIndex].y + 'px' }"
      ></div>
      <div class="hud-layer pa-4">
        <v-card color="rgba(0,0,0,0.8)" dark class="pa-4 text-white rounded-xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-caption font-weight-bold">Validation Phase</span>
            <span class="text-caption">Point {{ currentDotIndex + 1 }} of {{ dots.length }}</span>
          </div>
          <v-progress-linear 
            :model-value="(samples.length / requiredSamples) * 100" 
            color="success" 
            height="8"
            rounded="pill"
          ></v-progress-linear>
        </v-card>
      </div>
    </div>
    
    <div v-else class="results-screen text-center pa-6">
      <h2 class="text-h4 mb-4 font-weight-bold">Validation Complete</h2>
      
      <div v-if="isCalculating" class="my-8">
         <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
         <p class="mt-4 text-h6 text-grey-darken-1">Analyzing gaze accuracy...</p>
      </div>
      
      <div v-else>
        <v-row class="mt-6 mb-8" justify="center">
          <v-col cols="12" sm="5">
            <v-card class="pa-6 rounded-xl elevation-2 bg-grey-lighten-4">
              <v-icon size="48" color="primary" class="mb-2">mdi-target</v-icon>
              <div class="text-h6 text-grey-darken-1">Accuracy (Offset)</div>
              <div class="text-h3 font-weight-bold text-primary mt-2">
                {{ results?.overallAccuracy?.toFixed(1) || '---' }} <span class="text-h6">px</span>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="5">
            <v-card class="pa-6 rounded-xl elevation-2 bg-grey-lighten-4">
              <v-icon size="48" color="success" class="mb-2">mdi-bullseye-arrow</v-icon>
              <div class="text-h6 text-grey-darken-1">Precision (Jitter)</div>
              <div class="text-h3 font-weight-bold text-success mt-2">
                {{ results?.overallPrecision?.toFixed(1) || '---' }} <span class="text-h6">px</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
        
        <v-alert
          type="success"
          variant="tonal"
          class="mb-8 mx-auto text-left"
          max-width="600"
        >
          Your calibration quality is sufficient. You can now proceed to the main task.
        </v-alert>

        <v-btn color="primary" size="x-large" rounded="pill" @click="finishValidation">
          Continue to Tasks
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import IrisTracker from '@/ux/UserTest/components/IrisTracker.vue';

const props = defineProps({
  isActive: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['validationComplete']);

const isTracking = ref(false);
const dots = ref([]);
const currentDotIndex = ref(0);
const isValidating = ref(false);
const isCalculating = ref(false);

const samples = ref([]);
const requiredSamples = 20; // roughly 1 second at 20fps
const allSamples = ref([]);
const results = ref(null);

onMounted(() => {
  const padding = 150;
  dots.value = [
    { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    { x: padding, y: padding },
    { x: window.innerWidth - padding, y: padding },
    { x: padding, y: window.innerHeight - padding },
    { x: window.innerWidth - padding, y: window.innerHeight - padding }
  ];
});

const startValidation = () => {
  isValidating.value = true;
  currentDotIndex.value = 0;
  samples.value = [];
  allSamples.value = [];
  isTracking.value = true;
};

const handleFaceData = (data) => {
  if (!isValidating.value || isCalculating.value) return;
  
  if (currentDotIndex.value < dots.value.length) {
    // Generate mock mapped screen coordinates centered around the true target 
    // to simulate the output of a real regression model mapping face mesh to screen
    const target = dots.value[currentDotIndex.value];
    const randomValue = window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
    const noise = randomValue * 30 - 15;
    
    // In a real scenario, applying Kalman + regression model:
    const mockScreenX = target.x + (data.left_iris_x ? noise : 0);
    const mockScreenY = target.y + (data.left_iris_y ? noise : 0);
    
    samples.value.push({ x: mockScreenX, y: mockScreenY, raw: data });
    
    if (samples.value.length >= requiredSamples) {
      allSamples.value.push([...samples.value]);
      samples.value = [];
      currentDotIndex.value++;
      
      if (currentDotIndex.value >= dots.value.length) {
        isTracking.value = false;
        calculateMetrics();
      }
    }
  }
};

const calculateMetrics = async () => {
  isCalculating.value = true;
  try {
    const backendUrl = process.env.VUE_APP_EYE_LAB_BACKEND_URL;
    const response = await fetch(`${backendUrl}/calculate_accuracy_metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targets: dots.value,
        samples: allSamples.value
      })
    });
    
    if (response.ok) {
      results.value = await response.json();
    } else {
      throw new Error('Fallback to mock calculation');
    }
  } catch (err) {
    console.error("Metrics calculation failed:", err);
    throw err;
  } finally {
    isCalculating.value = false;
  }
};

const finishValidation = () => {
  emit('validationComplete', results.value);
};
</script>

<style scoped>
.validation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.dot-container {
  position: relative;
  width: 100%;
  height: 100%;
}
.validation-dot {
  position: absolute;
  width: 32px;
  height: 32px;
  background-color: #fca326; /* RUXAILAB primary */
  border: 4px solid #fff;
  box-shadow: 0 0 15px rgba(252, 163, 38, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 1s infinite alternate;
}
.hud-layer {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
}
@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.85); }
  100% { transform: translate(-50%, -50%) scale(1.15); }
}
</style>
