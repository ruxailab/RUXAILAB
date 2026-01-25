<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <!-- Information header -->
    <v-card 
      variant="outlined" 
      color="primary" 
      class="mb-6"
    >
      <v-card-text class="text-center">
        <v-icon 
          size="48" 
          color="primary" 
          class="mb-2"
        >
          mdi-router-wireless
        </v-icon>
        <h3 class="text-h6 font-weight-bold mb-2" style="color: #0f172a;">
          Technology Acceptance Model - TAM-1
        </h3>
        <p class="text-body-2 text-grey-darken-3 mb-2">
          Please evaluate the technology you just used. Rate each statement on a scale from <strong>Strongly Disagree</strong> to <strong>Strongly Agree</strong>.
        </p>
        <p class="text-body-2 text-grey-darken-3">
          This assessment measures four dimensions: <strong>Perceived Usefulness</strong>, <strong>Perceived Ease of Use</strong>, <strong>Attitude Toward Using</strong>, and <strong>Actual System Use</strong>.
        </p>
      </v-card-text>
    </v-card>

    <!-- Progress indicator -->
    <div class="d-flex align-center mb-4">
      <span class="text-subtitle-1">Progress: {{ completedCount }}/20</span>
      <v-progress-linear
        class="ml-4"
        :model-value="(completedCount / 20) * 100"
        :color="completedCount === 20 ? 'success' : 'primary'"
      />
    </div>

    <!-- Perceived Usefulness Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="blue-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #0f172a;">
        <v-icon size="24" style="color: #0f172a;" class="mr-2">mdi-target-variant</v-icon>
        Perceived Usefulness (10 items)
      </v-card-title>
      
      <!-- Scale labels -->
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      
      <v-card
        v-for="(question, i) in puQuestions"
        :key="`pu-${i}`"
        variant="outlined"
        :class="{ 'my-2': true, 'border-error': !answers.perceivedUsefulness[i] }"
      >
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e3a8a;">{{ question }} *</span>
          </div>
          <v-radio-group
            :model-value="answers.perceivedUsefulness[i]"
            inline
            @update:model-value="updatePUAnswer(i, $event)"
          >
            <v-radio
              v-for="n in 7"
              :key="n"
              :value="n"
              :label="`${n}`"
              class="mx-1"
            />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Ease of Use Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="green-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #0f172a;">
        <v-icon size="24" style="color: #0f172a;" class="mr-2">mdi-lightning-bolt</v-icon>
        Perceived Ease of Use (10 items)
      </v-card-title>
      
      <!-- Scale labels -->
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      
      <v-card
        v-for="(question, i) in peuQuestions"
        :key="`peu-${i}`"
        variant="outlined"
        :class="{ 'my-2': true, 'border-error': !answers.perceivedEaseOfUse[i] }"
      >
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e3a8a;">{{ question }} *</span>
          </div>
          <v-radio-group
            :model-value="answers.perceivedEaseOfUse[i]"
            inline
            @update:model-value="updatePEUAnswer(i, $event)"
          >
            <v-radio
              v-for="n in 7"
              :key="n"
              :value="n"
              :label="`${n}`"
              class="mx-1"
            />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>
  </v-form>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  taskIndex: {
    type: Number,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({
      perceivedUsefulness: new Array(10).fill(undefined),
      perceivedEaseOfUse: new Array(10).fill(undefined)
    })
  }
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);
const valid = ref(false);

const likertLabels = ref([
  "Strongly Agree",
  "Agree",
  "Somewhat Agree",
  "Neutral",
  "Somewhat Disagree",
  "Disagree",
  "Strongly Disagree",
]);

// PU: Perceived Usefulness (Davis 1985, Appendix-1)
// 1-7 Likert scale (Strongly Agree → Strongly Disagree)
// Using template: "Using the system has a positive effect on [dimension]"
const puQuestions = ref([
  "Using the system has a positive effect on my job performance.",
  "Using the system has a positive effect on my productivity.",
  "Using the system has a positive effect on my effectiveness.",
  "Using the system has a positive effect on my job relevancy.",
  "Using the system has a positive effect on its importance to my job.",
  "Using the system has a positive effect on my job effects.",
  "Using the system has a positive effect on my perception of its utility.",
  "Using the system has a positive effect on its applicability to my work.",
  "Using the system has a positive effect on the necessity of using it.",
  "Using the system has a positive effect on its overall usefulness."
]);

// PEOU: Perceived Ease of Use (Davis 1985, Appendix-1)
// 1-7 Likert scale (Strongly Agree → Strongly Disagree)
// Using template: "Overall, I find the system [dimension]"
const peuQuestions = ref([
  "Overall, I find the system controllable.",
  "Overall, I find the system cumbersome.",
  "Overall, I find the system rigid and inflexible.",
  "Overall, I find the system frustrating.",
  "Overall, I find the system understandable.",
  "Overall, I find the mental effort required manageable.",
  "Overall, I find the system confusing.",
  "Overall, I find it easy to remember how to use the system.",
  "Overall, I am dependent on the manual to use the system.",
  "Overall, I find the system provides adequate guidance."
]);

const completedCount = computed(() => {
  const puCount = answers.value.perceivedUsefulness.filter(a => typeof a === 'number').length;
  const peuCount = answers.value.perceivedEaseOfUse.filter(a => typeof a === 'number').length;
  return puCount + peuCount;
});

const answers = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue);
  }
});

const updatePUAnswer = (index, value) => {
  const newAnswers = { ...answers.value };
  newAnswers.perceivedUsefulness = [...newAnswers.perceivedUsefulness];
  newAnswers.perceivedUsefulness[index] = value;
  emit('update:modelValue', newAnswers);
};

const updatePEUAnswer = (index, value) => {
  const newAnswers = { ...answers.value };
  newAnswers.perceivedEaseOfUse = [...newAnswers.perceivedEaseOfUse];
  newAnswers.perceivedEaseOfUse[index] = value;
  emit('update:modelValue', newAnswers);
};
</script>

<style scoped>
.border-error {
  border-color: rgb(var(--v-theme-error)) !important;
}

:deep(.v-radio .v-label) {
  color: rgba(0, 0, 0, 0.87) !important;
}

:deep(.v-radio.v-selection-control--checked .v-icon) {
  color: #1e3a8a !important;
}

:deep(.v-radio .v-selection-control__input .v-icon) {
  color: #1e3a8a !important;
}
</style>
