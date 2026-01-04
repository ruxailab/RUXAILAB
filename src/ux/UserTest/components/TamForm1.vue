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
        <h3 class="text-h6 font-weight-bold text-primary mb-2">
          Technology Acceptance Model - TAM-1
        </h3>
        <p class="text-body-2 text-grey-darken-3 mb-2">
          Please evaluate the technology you just used. Rate each statement on a scale from <strong>Strongly Disagree</strong> to <strong>Strongly Agree</strong>.
        </p>
        <p class="text-body-2 text-grey-darken-3">
          This assessment measures two key dimensions: <strong>Perceived Usefulness</strong> and <strong>Perceived Ease of Use</strong>.
        </p>
      </v-card-text>
    </v-card>

    <!-- Progress indicator -->
    <div class="d-flex align-center mb-4">
      <span class="text-subtitle-1">Progress: {{ completedCount }}/10</span>
      <v-progress-linear
        class="ml-4"
        :model-value="(completedCount / 10) * 100"
        :color="completedCount === 10 ? 'success' : 'primary'"
      />
    </div>

    <!-- Perceived Usefulness Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="blue-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-blue-darken-4">
        <v-icon size="24" color="blue-darken-4" class="mr-2">mdi-target-variant</v-icon>
        Perceived Usefulness
      </v-card-title>
      
      <v-card
        v-for="(question, i) in puQuestions"
        :key="`pu-${i}`"
        variant="outlined"
        :class="{ 'my-2': true, 'border-error': !answers.perceivedUsefulness[i] }"
      >
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group
            :model-value="answers.perceivedUsefulness[i]"
            inline
            @update:model-value="updatePUAnswer(i, $event)"
          >
            <v-radio
              v-for="n in 5"
              :key="n"
              :value="n"
              :label="`${n} - ${likertLabels[n - 1]}`"
              class="mx-4"
            />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Ease of Use Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="green-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-green-darken-4">
        <v-icon size="24" color="green-darken-4" class="mr-2">mdi-lightning-bolt</v-icon>
        Perceived Ease of Use
      </v-card-title>
      
      <v-card
        v-for="(question, i) in peuQuestions"
        :key="`peu-${i}`"
        variant="outlined"
        :class="{ 'my-2': true, 'border-error': !answers.perceivedEaseOfUse[i] }"
      >
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group
            :model-value="answers.perceivedEaseOfUse[i]"
            inline
            @update:model-value="updatePEUAnswer(i, $event)"
          >
            <v-radio
              v-for="n in 5"
              :key="n"
              :value="n"
              :label="`${n} - ${likertLabels[n - 1]}`"
              class="mx-4"
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
      perceivedUsefulness: Array(5).fill(undefined),
      perceivedEaseOfUse: Array(5).fill(undefined)
    })
  }
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);
const valid = ref(false);

const likertLabels = ref([
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
]);

const puQuestions = ref([
  "Using the technology improves my performance in my job.",
  "Using the technology increases my productivity.",
  "Using the technology enhances my effectiveness in my job.",
  "Using the technology makes it easier to do my job.",
  "I find the technology to be useful in my job."
]);

const peuQuestions = ref([
  "My interaction with the technology is clear and understandable.",
  "It would be easy for me to become skillful at using the technology.",
  "I find the technology easy to use.",
  "Learning to operate the technology is easy for me.",
  "It is easy for me to remember how to perform tasks using the technology."
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
