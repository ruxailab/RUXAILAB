<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-container>
      <div class="sart-header mb-6">
        <h3 class="text-h5 font-weight-bold mb-2">Situation Awareness Rating Technique</h3>
        <p class="text-body-1 mb-4">
          Please rate your situational awareness during the task by moving the sliders for each dimension.
          Each dimension is rated on a 7-point scale.
        </p>
      </div>

      <v-row
        v-for="(dimension, key) in sartDimensions"
        :key="key"
        dense
        class="mb-4"
      >
        <v-col cols="12">
          <v-card
            variant="outlined"
            class="pa-4"
          >
            <div class="d-flex justify-space-between mb-1">
              <span class="font-weight-medium">{{ dimension.title }}</span>
              <span class="text-caption text-grey">(1-7)</span>
            </div>
            
            <!-- Dimension Description -->
            <p class="text-caption text-grey-darken-1 mb-3">
              {{ dimension.description }}
            </p>

            <!-- Slider with labels -->
            <v-slider
              v-model="localSart[key]"
              :min="1"
              :max="7"
              :step="1"
              :ticks="[1,4,7]"
              show-ticks="always"
              track-color="grey-lighten-2"
              color="black"
              thumb-color="black"
              thumb-size="24"
            >
              <template #prepend>
                <div class="slider-label">
                  <span class="text-caption">{{ dimension.lowLabel }}</span>
                  <span class="text-caption text-grey ml-1">(1)</span>
                </div>
              </template>
              <template #append>
                <div class="slider-label">
                  <span class="text-caption text-grey mr-1">(7)</span>
                  <span class="text-caption">{{ dimension.highLabel }}</span>
                </div>
              </template>
            </v-slider>

            <!-- Current Value Display -->
            <div class="text-center mt-2">
              <v-chip
                :color="getValueColor(localSart[key])"
                size="small"
                class="font-weight-bold"
              >
                Current: {{ localSart[key] }}
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';

const props = defineProps({
  sart: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const emit = defineEmits(['update:sart']);

// Initialize with default values
const defaultSart = {
  instability: 4,
  complexity: 4,
  variability: 4,
  arousal: 4,
  spareCapacity: 4,
  concentration: 4,
  division: 4,
  information: 4,
  familiarity: 4,
  understanding: 4
};

const localSart = reactive({ ...defaultSart, ...props.sart });

// SART Dimensions configuration
const sartDimensions = {
  instability: {
    title: "Instability of Situation",
    description: "How stable or unstable was the situation?",
    lowLabel: "Very Stable",
    highLabel: "Very Unstable"
  },
  complexity: {
    title: "Complexity of Situation",
    description: "How simple or complex was the situation?",
    lowLabel: "Very Simple",
    highLabel: "Very Complex"
  },
  variability: {
    title: "Variability of Situation",
    description: "How consistent or variable was the situation?",
    lowLabel: "Very Consistent",
    highLabel: "Very Variable"
  },
  arousal: {
    title: "Arousal",
    description: "How low or high was your mental arousal?",
    lowLabel: "Very Low",
    highLabel: "Very High"
  },
  spareCapacity: {
    title: "Spare Mental Capacity",
    description: "How little or much spare mental capacity did you have?",
    lowLabel: "Very Little",
    highLabel: "Very Much"
  },
  concentration: {
    title: "Concentration",
    description: "How difficult or easy was it to concentrate?",
    lowLabel: "Very Difficult",
    highLabel: "Very Easy"
  },
  division: {
    title: "Division of Attention",
    description: "How focused or divided was your attention?",
    lowLabel: "Very Focused",
    highLabel: "Very Divided"
  },
  information: {
    title: "Information Quantity",
    description: "How little or much information was available?",
    lowLabel: "Very Little",
    highLabel: "Very Much"
  },
  familiarity: {
    title: "Familiarity with Situation",
    description: "How unfamiliar or familiar were you with the situation?",
    lowLabel: "Very Unfamiliar",
    highLabel: "Very Familiar"
  },
  understanding: {
    title: "Understanding of Situation",
    description: "How poor or good was your understanding of the situation?",
    lowLabel: "Very Poor",
    highLabel: "Very Good"
  }
};

// Watch for prop changes
watch(() => props.sart, (newVal) => {
  Object.assign(localSart, { ...defaultSart, ...newVal });
});

// Watch for local changes and emit
watch(localSart, () => {
  const fullUpdate = {};
  for (const key in sartDimensions) {
    fullUpdate[key] = localSart[key] ?? 4;
  }
  
  emit('update:sart', fullUpdate);
}, { deep: true });

const getValueColor = (value) => {
  if (value <= 2) return 'error';
  if (value <= 3) return 'warning';
  if (value <= 5) return 'info';
  return 'success';
};

let valid = ref(false);
</script>

<style scoped>
.sart-header {
  text-align: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.slider-label {
  min-width: 100px;
  text-align: center;
}
</style>
