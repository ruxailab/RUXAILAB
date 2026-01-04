<template>
  <v-form ref="form" v-model="valid">
    <!-- Information header -->
    <v-card variant="outlined" color="primary" class="mb-6">
      <v-card-text class="text-center">
        <v-icon size="48" color="primary" class="mb-2">
          mdi-clipboard-check-outline
        </v-icon>
        <h3 class="text-h6 font-weight-bold text-primary mb-2">
          Technology Acceptance Model (TAM-1)
        </h3>
        <p class="text-body-2 text-grey-darken-3 mb-2">
          Please evaluate the system you just used by answering the following
          <strong>12 questions</strong>. Rate each statement on a scale from
          <strong>Strongly Disagree</strong> to <strong>Strongly Agree</strong>.
        </p>
        <p class="text-body-2 text-grey-darken-3">
          Your honest feedback helps us understand technology acceptance. All
          questions are required.
        </p>
      </v-card-text>
    </v-card>

    <!-- Progress indicator -->
    <div class="d-flex align-center mb-4">
      <span class="text-subtitle-1">Progress: {{ completedCount }}/12</span>
      <v-progress-linear
        class="ml-4"
        :model-value="(completedCount / 12) * 100"
        :color="completedCount === 12 ? 'success' : 'primary'"
      />
    </div>

    <!-- Perceived Usefulness Section -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-h6 bg-blue-lighten-5">
        <v-icon class="mr-2">mdi-star-outline</v-icon>
        Perceived Usefulness
      </v-card-title>
      <v-card-text>
        <v-card
          v-for="(question, i) in perceivedUsefulnessQuestions"
          :key="`pu-${i}`"
          variant="outlined"
          :class="{ 'my-3': true, 'border-error': !answers[i] }"
        >
          <v-card-text>
            <span :class="{ 'text-error': !answers[i] }"
              >{{ i + 1 }}. {{ question }} *</span
            >
            <v-divider class="my-3" />

            <v-radio-group v-model="answers[i]" inline class="justify-center">
              <v-radio
                v-for="(scale, n) in tamScale"
                :key="n"
                :value="scale.value"
                class="d-flex flex-column align-center mx-2"
              >
                <template #label>
                  <div class="text-center mt-1 text-caption">
                    {{ scale.label }}
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- Perceived Ease of Use Section -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-h6 bg-green-lighten-5">
        <v-icon class="mr-2">mdi-hand-heart-outline</v-icon>
        Perceived Ease of Use
      </v-card-title>
      <v-card-text>
        <v-card
          v-for="(question, i) in perceivedEaseOfUseQuestions"
          :key="`peou-${i}`"
          variant="outlined"
          :class="{ 'my-3': true, 'border-error': !answers[i + 6] }"
        >
          <v-card-text>
            <span :class="{ 'text-error': !answers[i + 6] }"
              >{{ i + 7 }}. {{ question }} *</span
            >
            <v-divider class="my-3" />

            <v-radio-group
              v-model="answers[i + 6]"
              inline
              class="justify-center"
            >
              <v-radio
                v-for="(scale, n) in tamScale"
                :key="n"
                :value="scale.value"
                class="d-flex flex-column align-center mx-2"
              >
                <template #label>
                  <div class="text-center mt-1 text-caption">
                    {{ scale.label }}
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TAM_SCALE, TAM1_ITEMS } from '../utils/tamData.js'

const props = defineProps({
  taskIndex: {
    type: Number,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => Array(12).fill(null),
  },
})

const emit = defineEmits(['update:modelValue'])

const form = ref(null)
const valid = ref(false)

// TAM scale and questions
const tamScale = TAM_SCALE
const perceivedUsefulnessQuestions = TAM1_ITEMS.perceivedUsefulness
const perceivedEaseOfUseQuestions = TAM1_ITEMS.perceivedEaseOfUse

// Progress tracking
const completedCount = computed(() => {
  return answers.value.filter(
    (answer) => answer !== null && answer !== undefined,
  ).length
})

// Reactive answers using v-model pattern
const answers = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue)
  },
})

// Form validation
const isFormValid = computed(() => {
  return completedCount.value === 12
})

// Expose validation method for parent components
defineExpose({
  validate: () => isFormValid.value,
  isValid: isFormValid,
})
</script>

<style scoped>
.v-radio-group {
  flex-wrap: wrap;
}

.v-radio {
  margin: 0 4px;
}

.border-error {
  border-color: rgb(var(--v-theme-error)) !important;
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1.2;
  max-width: 80px;
  word-wrap: break-word;
}
</style>
