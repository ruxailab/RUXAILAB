<template>
  <v-form ref="form" v-model="valid">
    <!-- Information header -->
    <v-card variant="outlined" color="primary" class="mb-6">
      <v-card-text class="text-center">
        <v-icon size="48" color="primary" class="mb-2">mdi-router-wireless</v-icon>
        <h3 class="text-h6 font-weight-bold text-primary mb-2">
          Technology Acceptance Model - TAM-2
        </h3>
        <p class="text-body-2 text-grey-darken-3 mb-2">
          Please evaluate the technology you just used. Rate each statement on a scale from <strong>Strongly Disagree</strong> to <strong>Strongly Agree</strong>.
        </p>
        <p class="text-body-2 text-grey-darken-3">
          This extended assessment measures {{ completedCount }}/25 dimensions of technology acceptance.
        </p>
      </v-card-text>
    </v-card>

    <!-- Progress indicator -->
    <div class="d-flex align-center mb-4">
      <span class="text-subtitle-1">Progress: {{ completedCount }}/25</span>
      <v-progress-linear
        class="ml-4"
        :model-value="(completedCount / 25) * 100"
        :color="completedCount === 25 ? 'success' : 'primary'"
      />
    </div>

    <!-- Perceived Usefulness Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="blue-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon size="24" color="blue" class="mr-2">mdi-target-variant</v-icon>
        Perceived Usefulness (5 items)
      </v-card-title>
      <v-card v-for="(question, i) in puQuestions" :key="`pu-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedUsefulness[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceivedUsefulness[i]" inline @update:model-value="updateDimensionAnswer('perceivedUsefulness', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Ease of Use Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="green-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon size="24" color="green" class="mr-2">mdi-lightning-bolt</v-icon>
        Perceived Ease of Use (5 items)
      </v-card-title>
      <v-card v-for="(question, i) in peuQuestions" :key="`peu-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedEaseOfUse[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceivedEaseOfUse[i]" inline @update:model-value="updateDimensionAnswer('perceivedEaseOfUse', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Subjective Norm Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="purple-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon size="24" color="purple" class="mr-2">mdi-account-multiple</v-icon>
        Subjective Norm (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in snQuestions" :key="`sn-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.subjectiveNorm[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.subjectiveNorm[i]" inline @update:model-value="updateDimensionAnswer('subjectiveNorm', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Image Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="orange-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon size="24" color="orange" class="mr-2">mdi-image</v-icon>
        Image (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in imgQuestions" :key="`img-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.image[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.image[i]" inline @update:model-value="updateDimensionAnswer('image', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Job Relevance Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="red-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon size="24" color="red" class="mr-2">mdi-briefcase</v-icon>
        Job Relevance (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in jrQuestions" :key="`jr-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.jobRelevance[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.jobRelevance[i]" inline @update:model-value="updateDimensionAnswer('jobRelevance', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Output Quality Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="teal-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon size="24" color="teal" class="mr-2">mdi-check-all</v-icon>
        Output Quality (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in oqQuestions" :key="`oq-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.outputQuality[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.outputQuality[i]" inline @update:model-value="updateDimensionAnswer('outputQuality', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Result Demonstrability Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="cyan-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon size="24" color="cyan" class="mr-2">mdi-chart-box</v-icon>
        Result Demonstrability (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in rdQuestions" :key="`rd-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.resultDemonstrability[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.resultDemonstrability[i]" inline @update:model-value="updateDimensionAnswer('resultDemonstrability', i, $event)">
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>
  </v-form>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  taskIndex: { type: Number, required: true },
  modelValue: {
    type: Object,
    default: () => ({
      perceivedUsefulness: Array(5).fill(undefined),
      perceivedEaseOfUse: Array(5).fill(undefined),
      subjectiveNorm: Array(3).fill(undefined),
      image: Array(2).fill(undefined),
      jobRelevance: Array(3).fill(undefined),
      outputQuality: Array(3).fill(undefined),
      resultDemonstrability: Array(2).fill(undefined)
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

const snQuestions = ref([
  "People who are important to me would think that I should use the technology.",
  "People who influence my behavior would think that I should use the technology.",
  "People in my organization who use the technology have more prestige than those who do not."
]);

const imgQuestions = ref([
  "Using the technology improves how others perceive me professionally.",
  "Using the technology enhances my professional image."
]);

const jrQuestions = ref([
  "In my job, usage of the technology is important.",
  "In my job, usage of the technology is relevant.",
  "The technology is applicable to my job."
]);

const oqQuestions = ref([
  "The technology provides high-quality output.",
  "I have full confidence in the output of the technology.",
  "The quality of the output from the technology is very good."
]);

const rdQuestions = ref([
  "I would have difficulty explaining why using the technology might be beneficial.",
  "The results of using the technology are apparent to me."
]);

const completedCount = computed(() => {
  const dims = ['perceivedUsefulness', 'perceivedEaseOfUse', 'subjectiveNorm', 'image', 'jobRelevance', 'outputQuality', 'resultDemonstrability'];
  return dims.reduce((sum, dim) => sum + answers.value[dim].filter(a => typeof a === 'number').length, 0);
});

const answers = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue);
  }
});

const updateDimensionAnswer = (dimension, index, value) => {
  const newAnswers = { ...answers.value };
  newAnswers[dimension] = [...newAnswers[dimension]];
  newAnswers[dimension][index] = value;
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
