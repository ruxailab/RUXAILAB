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
          This extended assessment measures {{ completedCount }}/26 dimensions of technology acceptance.
        </p>
      </v-card-text>
    </v-card>

    <!-- Progress indicator -->
    <div class="d-flex align-center mb-4">
      <span class="text-subtitle-1">Progress: {{ completedCount }}/26</span>
      <v-progress-linear
        class="ml-4"
        :model-value="(completedCount / 26) * 100"
        :color="completedCount === 26 ? 'success' : 'primary'"
      />
    </div>

    <!-- Intention to Use Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="indigo-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon size="24" color="indigo" class="mr-2">mdi-check-circle</v-icon>
        Intention to Use (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in intQuestions" :key="`int-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.intentionToUse[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
            <span class="font-weight-bold">{{ likertLabels[0] }}</span>
            <span class="font-weight-bold">{{ likertLabels[6] }}</span>
          </div>
          <v-radio-group :model-value="answers.intentionToUse[i]" inline @update:model-value="updateDimensionAnswer('intentionToUse', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Usefulness Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="blue-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon size="24" color="blue" class="mr-2">mdi-target-variant</v-icon>
        Perceived Usefulness (4 items)
      </v-card-title>
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      <v-card v-for="(question, i) in puQuestions" :key="`pu-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedUsefulness[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <v-radio-group :model-value="answers.perceivedUsefulness[i]" inline @update:model-value="updateDimensionAnswer('perceivedUsefulness', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Ease of Use Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="green-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon size="24" color="green" class="mr-2">mdi-lightning-bolt</v-icon>
        Perceived Ease of Use (4 items)
      </v-card-title>
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      <v-card v-for="(question, i) in peuQuestions" :key="`peu-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedEaseOfUse[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <v-radio-group :model-value="answers.perceivedEaseOfUse[i]" inline @update:model-value="updateDimensionAnswer('perceivedEaseOfUse', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Subjective Norm Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="purple-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon size="24" color="purple" class="mr-2">mdi-account-multiple</v-icon>
        Subjective Norm (2 items)
      </v-card-title>
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      <v-card v-for="(question, i) in snQuestions" :key="`sn-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.subjectiveNorm[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <v-radio-group :model-value="answers.subjectiveNorm[i]" inline @update:model-value="updateDimensionAnswer('subjectiveNorm', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Voluntariness Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="pink-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon size="24" color="pink" class="mr-2">mdi-hand-open-variant</v-icon>
        Voluntariness (3 items)
      </v-card-title>
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      <v-card v-for="(question, i) in volQuestions" :key="`vol-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.voluntariness[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <v-radio-group :model-value="answers.voluntariness[i]" inline @update:model-value="updateDimensionAnswer('voluntariness', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Image Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="orange-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon size="24" color="orange" class="mr-2">mdi-image</v-icon>
        Image (3 items)
      </v-card-title>
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      <v-card v-for="(question, i) in imgQuestions" :key="`img-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.image[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <v-radio-group :model-value="answers.image[i]" inline @update:model-value="updateDimensionAnswer('image', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Job Relevance Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="red-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon size="24" color="red" class="mr-2">mdi-briefcase</v-icon>
        Job Relevance (2 items)
      </v-card-title>
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      <v-card v-for="(question, i) in jrQuestions" :key="`jr-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.jobRelevance[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <v-radio-group :model-value="answers.jobRelevance[i]" inline @update:model-value="updateDimensionAnswer('jobRelevance', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Output Quality Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="teal-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon size="24" color="teal" class="mr-2">mdi-check-all</v-icon>
        Output Quality (2 items)
      </v-card-title>
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      <v-card v-for="(question, i) in oqQuestions" :key="`oq-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.outputQuality[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <v-radio-group :model-value="answers.outputQuality[i]" inline @update:model-value="updateDimensionAnswer('outputQuality', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Result Demonstrability Section -->
    <v-card variant="outlined" class="mb-6 pa-4" color="cyan-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
        <v-icon size="24" color="cyan" class="mr-2">mdi-chart-box</v-icon>
        Result Demonstrability (4 items)
      </v-card-title>
      <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-3 px-2">
        <span class="font-weight-bold">{{ likertLabels[0] }}</span>
        <span class="font-weight-bold">{{ likertLabels[6] }}</span>
      </div>
      <v-card v-for="(question, i) in rdQuestions" :key="`rd-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.resultDemonstrability[i] }">
        <v-card-text>
          <div class="text-body-2 mb-2">
            <span class="text-error font-weight-bold">{{ i + 1 }}.</span>
            <span class="font-weight-medium" style="color: #1e293b; font-weight: 600;">{{ question }} *</span>
          </div>
          <v-radio-group :model-value="answers.resultDemonstrability[i]" inline @update:model-value="updateDimensionAnswer('resultDemonstrability', i, $event)">
            <v-radio v-for="n in 7" :key="n" :value="n" :label="`${n}`" class="mx-1" />
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
      intentionToUse: new Array(2).fill(undefined),
      perceivedUsefulness: new Array(4).fill(undefined),
      perceivedEaseOfUse: new Array(4).fill(undefined),
      subjectiveNorm: new Array(2).fill(undefined),
      voluntariness: new Array(3).fill(undefined),
      image: new Array(3).fill(undefined),
      jobRelevance: new Array(2).fill(undefined),
      outputQuality: new Array(2).fill(undefined),
      resultDemonstrability: new Array(4).fill(undefined)
    })
  }
});

const emit = defineEmits(['update:modelValue']);
const form = ref(null);
const valid = ref(false);

const likertLabels = ref([
  "Strongly Disagree",
  "Disagree",
  "Somewhat Disagree",
  "Neutral",
  "Somewhat Agree",
  "Agree",
  "Strongly Agree",
]);

const puQuestions = ref([
  "Using the system improves my performance in my job.",
  "Using the system in my job increases my productivity.",
  "Using the system enhances my effectiveness in my job.",
  "I find the system to be useful in my job."
]);

const peuQuestions = ref([
  "My interaction with the system is clear and understandable.",
  "Interacting with the system does not require a lot of my mental effort.",
  "I find the system to be easy to use.",
  "I find it easy to get the system to do what I want it to do."
]);

const intQuestions = ref([
  "Assuming I have access to the system, I intend to use it.",
  "Given that I have access to the system, I predict that I would use it."
]);

const snQuestions = ref([
  "People who influence my behavior think that I should use the system.",
  "People who are important to me think that I should use the system."
]);

const volQuestions = ref([
  "My use of the system is voluntary.",
  "My supervisor does not require me to use the system.",
  "Although it might be helpful, using the system is certainly not compulsory in my job."
]);

const imgQuestions = ref([
  "People in my organization who use the system have more prestige than those who do not.",
  "People in my organization who use the system have a high profile.",
  "Having the system is a status symbol in my organization."
]);

const jrQuestions = ref([
  "In my job, usage of the system is important.",
  "In my job, usage of the system is relevant."
]);

const oqQuestions = ref([
  "The quality of the output I get from the system is high.",
  "I have no problem with the quality of the system's output."
]);

const rdQuestions = ref([
  "I have no difficulty telling others about the results of using the system.",
  "I believe I could communicate to others the consequences of using the system.",
  "The results of using the system are apparent to me.",
  "I would have difficulty explaining why using the system may or may not be beneficial."
]);

const completedCount = computed(() => {
  const dims = ['intentionToUse', 'perceivedUsefulness', 'perceivedEaseOfUse', 'subjectiveNorm', 'voluntariness', 'image', 'jobRelevance', 'outputQuality', 'resultDemonstrability'];
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
