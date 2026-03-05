<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-container>
      <div class="sart-header mb-6">
        <h3 class="text-h5 font-weight-bold mb-2">
          Situation Awareness Rating Technique (SART 10D)
        </h3>
        <p class="text-body-1 mb-4">
          For each of the 10 contributing factors, please select one of the seven boxes that best represents your experience.
          Rate each dimension on a 7-point scale (1 = Low, 7 = High).
        </p>
      </div>

      <!-- DEMAND CATEGORY -->
      <v-card
        variant="outlined"
        class="mb-6 pa-4"
        color="warning"
      >
        <div class="d-flex align-center mb-3">
          <v-chip
            color="warning"
            size="small"
            class="mr-2"
          >
            <v-icon
              start
              size="small"
            >
              mdi-arrow-up-bold
            </v-icon>
            Demand
          </v-chip>
          <span class="text-caption text-grey">(3 dimensions)</span>
        </div>
        
        <v-row
          v-for="dimension in demandDimensions"
          :key="dimension.key"
          dense
          class="mb-4"
        >
          <v-col cols="12">
            <v-card
              variant="flat"
              class="pa-3"
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
                v-model="localSart[dimension.key]"
                :min="1"
                :max="7"
                :step="1"
                :ticks="[1,2,3,4,5,6,7]"
                show-ticks="always"
                track-color="grey-lighten-2"
                color="warning"
                thumb-color="warning"
                thumb-size="24"
              >
                <template #prepend>
                  <div class="slider-label">
                    <span class="text-caption">{{ dimension.lowLabel }}</span>
                  </div>
                </template>
                <template #append>
                  <div class="slider-label">
                    <span class="text-caption">{{ dimension.highLabel }}</span>
                  </div>
                </template>
              </v-slider>

              <!-- Current Value Display -->
              <div class="text-center mt-2">
                <v-chip
                  :color="getValueColor(localSart[dimension.key])"
                  size="small"
                  class="font-weight-bold"
                >
                  Rating: {{ localSart[dimension.key] }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>

      <!-- SUPPLY CATEGORY -->
      <v-card
        variant="outlined"
        class="mb-6 pa-4"
        color="success"
      >
        <div class="d-flex align-center mb-3">
          <v-chip
            color="success"
            size="small"
            class="mr-2"
          >
            <v-icon
              start
              size="small"
            >
              mdi-arrow-down-bold
            </v-icon>
            Supply
          </v-chip>
          <span class="text-caption text-grey">(4 dimensions)</span>
        </div>
        
        <v-row
          v-for="dimension in supplyDimensions"
          :key="dimension.key"
          dense
          class="mb-4"
        >
          <v-col cols="12">
            <v-card
              variant="flat"
              class="pa-3"
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
                v-model="localSart[dimension.key]"
                :min="1"
                :max="7"
                :step="1"
                :ticks="[1,2,3,4,5,6,7]"
                show-ticks="always"
                track-color="grey-lighten-2"
                color="success"
                thumb-color="success"
                thumb-size="24"
              >
                <template #prepend>
                  <div class="slider-label">
                    <span class="text-caption">{{ dimension.lowLabel }}</span>
                  </div>
                </template>
                <template #append>
                  <div class="slider-label">
                    <span class="text-caption">{{ dimension.highLabel }}</span>
                  </div>
                </template>
              </v-slider>

              <!-- Current Value Display -->
              <div class="text-center mt-2">
                <v-chip
                  :color="getValueColor(localSart[dimension.key])"
                  size="small"
                  class="font-weight-bold"
                >
                  Rating: {{ localSart[dimension.key] }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>

      <!-- UNDERSTANDING CATEGORY -->
      <v-card
        variant="outlined"
        class="mb-6 pa-4"
        color="purple"
      >
        <div class="d-flex align-center mb-3">
          <v-chip
            color="purple"
            size="small"
            class="mr-2"
          >
            <v-icon
              start
              size="small"
            >
              mdi-brain
            </v-icon>
            Understanding
          </v-chip>
          <span class="text-caption text-grey">(3 dimensions)</span>
        </div>
        
        <v-row
          v-for="dimension in understandingDimensions"
          :key="dimension.key"
          dense
          class="mb-4"
        >
          <v-col cols="12">
            <v-card
              variant="flat"
              class="pa-3"
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
                v-model="localSart[dimension.key]"
                :min="1"
                :max="7"
                :step="1"
                :ticks="[1,2,3,4,5,6,7]"
                show-ticks="always"
                track-color="grey-lighten-2"
                color="purple"
                thumb-color="purple"
                thumb-size="24"
              >
                <template #prepend>
                  <div class="slider-label">
                    <span class="text-caption">{{ dimension.lowLabel }}</span>
                  </div>
                </template>
                <template #append>
                  <div class="slider-label">
                    <span class="text-caption">{{ dimension.highLabel }}</span>
                  </div>
                </template>
              </v-slider>

              <!-- Current Value Display -->
              <div class="text-center mt-2">
                <v-chip
                  :color="getValueColor(localSart[dimension.key])"
                  size="small"
                  class="font-weight-bold"
                >
                  Rating: {{ localSart[dimension.key] }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-form>
</template>

<script setup>
import { reactive, watch, ref, onMounted, computed } from 'vue';

const props = defineProps({
  sart: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const emit = defineEmits(['update:sart', 'valid']);

// CORRECT 10D default values
const defaultSart = {
  instability: 4,
  complexity: 4,
  variability: 4,
  arousal: 4,
  concentration: 4,
  division: 4,
  spareCapacity: 4,
  informationQuantity: 4,
  informationQuality: 4,
  familiarity: 4
};

const localSart = reactive({ ...defaultSart, ...props.sart });

// CORRECT SART 10D Dimensions configuration
const sartDimensions = {
  // DEMAND dimensions (3)
  instability: {
    key: 'instability',
    title: "Instability of Situation",
    description: "How stable or unstable is the situation? Is the situation highly unstable and likely to change suddenly (High) or is it very stable and straightforward (Low)?",
    lowLabel: "Very Stable (Low)",
    highLabel: "Very Unstable (High)",
    category: 'demand'
  },
  complexity: {
    key: 'complexity',
    title: "Complexity of Situation",
    description: "How complicated is the situation? Is it complex with many interrelated components (High) or is it simple and straightforward (Low)?",
    lowLabel: "Very Simple (Low)",
    highLabel: "Very Complex (High)",
    category: 'demand'
  },
  variability: {
    key: 'variability',
    title: "Variability of Situation",
    description: "How many variables are changing within the situation? Are there a large number of factors varying (High) or are there very few variables changing (Low)?",
    lowLabel: "Very Few (Low)",
    highLabel: "Very Many (High)",
    category: 'demand'
  },
  
  // SUPPLY dimensions (4)
  arousal: {
    key: 'arousal',
    title: "Arousal",
    description: "How aroused are you in the situation? Are you alert and ready for activity (High) or do you have a low degree of alertness (Low)?",
    lowLabel: "Low Alertness",
    highLabel: "High Alertness",
    category: 'supply'
  },
  concentration: {
    key: 'concentration',
    title: "Concentration of Attention",
    description: "How much are you concentrating on the situation? Are you concentrating on many aspects of the situation (High) or focused on only one (Low)?",
    lowLabel: "Focused on One",
    highLabel: "Many Aspects",
    category: 'supply'
  },
  division: {
    key: 'division',
    title: "Division of Attention",
    description: "How much is your attention divided in the situation? Are you concentrating on many aspects of the situation (High) or focused on only one (Low)?",
    lowLabel: "Focused",
    highLabel: "Divided",
    category: 'supply'
  },
  spareCapacity: {
    key: 'spareCapacity',
    title: "Spare Mental Capacity",
    description: "How much mental capacity do you have to spare in the situation? Do you have sufficient capacity to attend to many variables (High) or nothing to spare at all (Low)?",
    lowLabel: "No Spare Capacity",
    highLabel: "Much Spare Capacity",
    category: 'supply'
  },
  
  // UNDERSTANDING dimensions (3)
  informationQuantity: {
    key: 'informationQuantity',
    title: "Information Quantity",
    description: "How much information have you gained about the situation? Have you received and understood a great deal of knowledge (High) or very little (Low)?",
    lowLabel: "Very Little",
    highLabel: "Great Deal",
    category: 'understanding'
  },
  informationQuality: {
    key: 'informationQuality',
    title: "Information Quality",
    description: "How good is the information you have gained about the situation? Is the knowledge communicated very useful (High) or is it not usable at all (Low)?",
    lowLabel: "Not Usable",
    highLabel: "Very Useful",
    category: 'understanding'
  },
  familiarity: {
    key: 'familiarity',
    title: "Familiarity with Situation",
    description: "How familiar are you with the situation? Do you have a great deal of relevant experience (High) or is it a new situation (Low)?",
    lowLabel: "New Situation",
    highLabel: "Very Familiar",
    category: 'understanding'
  }
};

// Computed properties for categorizing dimensions
const demandDimensions = computed(() => {
  return Object.values(sartDimensions).filter(dim => dim.category === 'demand');
});

const supplyDimensions = computed(() => {
  return Object.values(sartDimensions).filter(dim => dim.category === 'supply');
});

const understandingDimensions = computed(() => {
  return Object.values(sartDimensions).filter(dim => dim.category === 'understanding');
});

// Validation function
const validateForm = () => {
  // Check if all dimensions have valid values
  const allValid = Object.keys(sartDimensions).every(key => {
    const value = localSart[key];
    return value !== null && value !== undefined && 
           value >= 1 && value <= 7;
  });
  
  valid.value = allValid;
  emit('valid', allValid);
  return allValid;
};

// Watch for prop changes
watch(() => props.sart, (newVal) => {
  Object.assign(localSart, { ...defaultSart, ...newVal });
  validateForm();
});

// Watch for local changes and emit
watch(localSart, () => {
  const fullUpdate = {};
  for (const key in sartDimensions) {
    fullUpdate[key] = localSart[key] ?? 4;
  }
  
  emit('update:sart', fullUpdate);
  validateForm();
}, { deep: true });

const getValueColor = (value) => {
  if (value <= 2) return 'error';
  if (value <= 3) return 'warning';
  if (value <= 5) return 'info';
  return 'success';
};

let valid = ref(false);

// Initial validation on mount
onMounted(() => {
  validateForm();
  
  // Force emit valid after delay
  setTimeout(() => {
    validateForm();
  }, 100);
});
</script>

<style scoped>
.sart-header {
  text-align: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.slider-label {
  min-width: 120px;
  text-align: center;
}

.v-card {
  transition: all 0.3s ease;
}
</style>
