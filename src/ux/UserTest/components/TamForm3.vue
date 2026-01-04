<template>
  <v-form ref="form" v-model="valid">
    <!-- Information header -->
    <v-card variant="outlined" color="primary" class="mb-6">
      <v-card-text class="text-center">
        <v-icon size="48" color="primary" class="mb-2">mdi-router-wireless</v-icon>
        <h3 class="text-h6 font-weight-bold text-primary mb-2">
          Technology Acceptance Model - TAM-3
        </h3>
        <p class="text-body-2 text-grey-darken-3 mb-2">
          Comprehensive technology acceptance assessment. Rate each statement on a scale from <strong>Strongly Disagree</strong> to <strong>Strongly Agree</strong>.
        </p>
        <p class="text-body-2 text-grey-darken-3">
          This advanced assessment measures {{ completedCount }}/39 dimensions of technology acceptance and use.
        </p>
      </v-card-text>
    </v-card>

    <!-- Tab Navigation -->
    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="form">Form</v-tab>
      <v-tab value="summary">Summary</v-tab>
    </v-tabs>

    <!-- Form Content -->
    <div v-show="activeTab === 'form'">
      <!-- Progress indicator -->
      <div class="d-flex align-center mb-4">
        <span class="text-subtitle-1">Progress: {{ completedCount }}/39</span>
        <v-progress-linear
          class="ml-4"
          :model-value="(completedCount / 39) * 100"
          :color="completedCount === 39 ? 'success' : 'primary'"
        />
      </div>

    <!-- Perceived Usefulness -->
    <v-card variant="outlined" class="mb-6 pa-4" color="blue-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-blue-darken-4">
        <v-icon size="24" color="blue-darken-4" class="mr-2">mdi-target-variant</v-icon>
        Perceived Usefulness (5 items)
      </v-card-title>
      <v-card v-for="(question, i) in puQuestions" :key="`pu-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedUsefulness[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceivedUsefulness[i]" @update:model-value="updateDimensionAnswer('perceivedUsefulness', i, $event)" inline>
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Ease of Use -->
    <v-card variant="outlined" class="mb-6 pa-4" color="green-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-green-darken-4">
        <v-icon size="24" color="green-darken-4" class="mr-2">mdi-lightning-bolt</v-icon>
        Perceived Ease of Use (5 items)
      </v-card-title>
      <v-card v-for="(question, i) in peuQuestions" :key="`peu-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedEaseOfUse[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceivedEaseOfUse[i]" @update:model-value="updateDimensionAnswer('perceivedEaseOfUse', i, $event)" inline>
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
            <!-- </v-radio> -->
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Image -->
    <v-card variant="outlined" class="mb-6 pa-4" color="orange-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-orange-darken-4">
        <v-icon size="24" color="orange-darken-4" class="mr-2">mdi-image</v-icon>
        Image (2 items)
      </v-card-title>
      <v-card v-for="(question, i) in imgQuestions" :key="`img-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.image[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.image[i]" @update:model-value="updateDimensionAnswer('image', i, $event)" inline>
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
            <!-- </v-radio> -->
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Output Quality -->
    <v-card variant="outlined" class="mb-6 pa-4" color="teal-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-teal-darken-4">
        <v-icon size="24" color="teal-darken-4" class="mr-2">mdi-check-all</v-icon>
        Output Quality (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in oqQuestions" :key="`oq-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.outputQuality[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.outputQuality[i]" @update:model-value="updateDimensionAnswer('outputQuality', i, $event)" inline>
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
            <!-- </v-radio> -->
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Computer Self-Efficacy -->
    <v-card variant="outlined" class="mb-6 pa-4" color="indigo-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-indigo-darken-4">
        <v-icon size="24" color="indigo-darken-4" class="mr-2">mdi-brain</v-icon>
        Computer Self-Efficacy (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in cseQuestions" :key="`cse-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.computerSelfEfficacy[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.computerSelfEfficacy[i]" @update:model-value="updateDimensionAnswer('computerSelfEfficacy', i, $event)" inline>
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
            <!-- </v-radio> -->
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Computer Anxiety -->
    <v-card variant="outlined" class="mb-6 pa-4" color="red-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-red-darken-4">
        <v-icon size="24" color="red-darken-4" class="mr-2">mdi-alert-circle</v-icon>
        Computer Anxiety (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in caQuestions" :key="`ca-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.computerAnxiety[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.computerAnxiety[i]" @update:model-value="updateDimensionAnswer('computerAnxiety', i, $event)" inline>
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
            <!-- </v-radio> -->
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Perceived Enjoyment -->
    <v-card variant="outlined" class="mb-6 pa-4" color="lime-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold mb-4 text-lime-darken-4">
        <v-icon size="24" color="lime-darken-4" class="mr-2">mdi-heart</v-icon>
        Perceived Enjoyment (3 items)
      </v-card-title>
      <v-card v-for="(question, i) in peQuestions" :key="`pe-${i}`" variant="outlined" :class="{ 'my-2': true, 'border-error': !answers.perceivedEnjoyment[i] }">
        <v-card-text>
          <span class="text-error font-weight-bold">{{ question }} *</span>
          <v-divider class="my-2" />
          <v-radio-group :model-value="answers.perceivedEnjoyment[i]" @update:model-value="updateDimensionAnswer('perceivedEnjoyment', i, $event)" inline>
            <v-radio v-for="n in 5" :key="n" :value="n" :label="`${n} - ${likertLabels[n - 1]}`" class="mx-4" />
            <!-- </v-radio> -->
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card>
    </div>

    <!-- Summary Content -->
    <div v-show="activeTab === 'summary'" class="mt-6">
      <!-- Header -->
      <v-card variant="outlined" class="mb-6 pa-6" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <v-card-title class="text-h5 font-weight-bold">Your TAM-3 Responses</v-card-title>
        <p class="text-body-2 mt-2">Summary of your answers to this TAM-3 assessment</p>
      </v-card>

      <div v-if="completedCount === 0" class="text-center pa-6">
        <v-icon size="64" color="grey">mdi-checkbox-blank-outline</v-icon>
        <p class="text-h6 text-grey mt-4">No responses yet</p>
        <p class="text-body-2 text-grey">Fill out the form to see your responses here</p>
      </div>

      <div v-else>
        <!-- Overall Stats -->
        <v-row class="mb-6">
          <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" class="pa-6" style="border-left: 4px solid #2196F3;">
              <div class="text-caption font-weight-bold text-blue">TOTAL RESPONSES</div>
              <div class="text-h4 font-weight-bold my-2">{{ completedCount }}/39</div>
              <v-progress-linear :model-value="(completedCount / 39) * 100" color="blue" class="mt-2"></v-progress-linear>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" class="pa-6" style="border-left: 4px solid #4CAF50;">
              <div class="text-caption font-weight-bold text-success">DIMENSIONS COMPLETE</div>
              <div class="text-h4 font-weight-bold my-2">{{ completeDimensions }}/13</div>
              <v-progress-linear :model-value="(completeDimensions / 13) * 100" color="success" class="mt-2"></v-progress-linear>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" class="pa-6" style="border-left: 4px solid #FF9800;">
              <div class="text-caption font-weight-bold text-warning">OVERALL AVERAGE</div>
              <div class="text-h4 font-weight-bold my-2">{{ overallAverage.toFixed(2) }}/5</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" class="pa-6" style="border-left: 4px solid #2196F3;">
              <div class="text-caption font-weight-bold text-primary">STATUS</div>
              <div class="text-h6 font-weight-bold my-2" :style="{ color: completedCount === 39 ? '#4CAF50' : '#FF9800' }">
                {{ completedCount === 39 ? 'COMPLETE' : 'IN PROGRESS' }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Dimensions Breakdown -->
        <v-card variant="outlined" class="pa-6 mb-6">
          <v-card-title class="text-h6 font-weight-bold mb-4">Dimension Scores</v-card-title>
          <v-row>
            <v-col v-for="dimension in summaryDimensions" :key="dimension.key" cols="12" md="6" lg="4">
              <v-card variant="flat" class="pa-4 mb-3" style="border-left: 4px solid;" :style="{ borderLeftColor: dimension.color, background: '#fafafa' }">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-subtitle-2 font-weight-bold">{{ dimension.label }}</div>
                  <v-chip v-if="dimension.answered > 0" :color="dimension.color" text-color="white" size="small">{{ dimension.average.toFixed(1) }}</v-chip>
                  <v-chip v-else color="grey" text-color="white" size="small">-</v-chip>
                </div>
                <v-progress-linear v-if="dimension.answered > 0" :model-value="(dimension.average / 5) * 100" :color="dimension.color" class="my-2"></v-progress-linear>
                <div class="text-caption text-grey-darken-2">
                  {{ dimension.answered }}/{{ dimension.total }} questions answered
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>

        <!-- Detailed Responses -->
        <v-card variant="outlined" class="pa-6">
          <v-card-title class="text-h6 font-weight-bold mb-4">Your Detailed Responses</v-card-title>
          
          <v-expansion-panels>
            <v-expansion-panel v-for="dimension in detailedResponses" :key="dimension.key">
              <template #title>
                <div class="font-weight-bold" :style="{ color: dimension.color }">
                  {{ dimension.label }} 
                  <v-chip :color="dimension.color" text-color="white" size="x-small" class="ml-2">
                    {{ dimension.responses.filter(r => r.value).length }}/{{ dimension.responses.length }}
                  </v-chip>
                </div>
              </template>
              <template #text>
                <v-table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th style="width: 200px;">Your Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(response, idx) in dimension.responses" :key="idx">
                      <td class="text-body-2">{{ response.question }}</td>
                      <td>
                        <v-chip v-if="response.value" :color="dimension.color" text-color="white" size="small">
                          {{ response.value }} - {{ likertLabels[response.value - 1] }}
                        </v-chip>
                        <v-chip v-else color="grey" text-color="white" size="small">Not answered</v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </div>
    </div>
  </v-form>
</template>

<script setup>
import { ref, computed } from "vue";

const activeTab = ref('form')

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
      resultDemonstrability: Array(2).fill(undefined),
      computerSelfEfficacy: Array(3).fill(undefined),
      perceptionsOfExternalControl: Array(3).fill(undefined),
      computerAnxiety: Array(3).fill(undefined),
      computerPlayfulness: Array(2).fill(undefined),
      perceivedEnjoyment: Array(3).fill(undefined),
      objectiveUsability: Array(2).fill(undefined)
    })
  }
});

const emit = defineEmits(['update:modelValue']);
const form = ref(null);
const valid = ref(false);

const likertLabels = ref(["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]);

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

const cseQuestions = ref([
  "I feel confident using the technology.",
  "I can competently use the technology.",
  "I would not feel threatened using the technology if someone was watching me."
]);

const pecQuestions = ref([
  "I have the resources necessary to use the technology.",
  "I have the knowledge necessary to use the technology.",
  "The technology is compatible with other systems I use."
]);

const caQuestions = ref([
  "Using the technology makes me nervous.",
  "I am apprehensive about using the technology.",
  "Using the technology is frustrating."
]);

const cpQuestions = ref([
  "I find using the technology to be enjoyable.",
  "Using the technology is fun."
]);

const peQuestions = ref([
  "I find the technology enjoyable to use.",
  "Using the technology is pleasurable.",
  "Using the technology is entertaining."
]);

const ouQuestions = ref([
  "The technology is user-friendly.",
  "The technology requires minimal effort to use."
]);

const completedCount = computed(() => {
  const dims = ['perceivedUsefulness', 'perceivedEaseOfUse', 'subjectiveNorm', 'image', 'jobRelevance', 'outputQuality', 'resultDemonstrability', 'computerSelfEfficacy', 'perceptionsOfExternalControl', 'computerAnxiety', 'computerPlayfulness', 'perceivedEnjoyment', 'objectiveUsability'];
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

// Summary computed properties
const dimensionConfig = ref([
  { key: 'perceivedUsefulness', label: 'Perceived Usefulness', questions: puQuestions.value, color: '#2196F3' },
  { key: 'perceivedEaseOfUse', label: 'Perceived Ease of Use', questions: peuQuestions.value, color: '#4CAF50' },
  { key: 'subjectiveNorm', label: 'Subjective Norm', questions: snQuestions.value, color: '#FF9800' },
  { key: 'image', label: 'Image', questions: imgQuestions.value, color: '#E91E63' },
  { key: 'jobRelevance', label: 'Job Relevance', questions: jrQuestions.value, color: '#9C27B0' },
  { key: 'outputQuality', label: 'Output Quality', questions: oqQuestions.value, color: '#00BCD4' },
  { key: 'resultDemonstrability', label: 'Result Demonstrability', questions: rdQuestions.value, color: '#8BC34A' },
  { key: 'computerSelfEfficacy', label: 'Computer Self-Efficacy', questions: cseQuestions.value, color: '#03A9F4' },
  { key: 'computerAnxiety', label: 'Computer Anxiety', questions: caQuestions.value, color: '#F44336' },
  { key: 'computerPlayfulness', label: 'Computer Playfulness', questions: cpQuestions.value, color: '#FF5722' },
  { key: 'perceivedEnjoyment', label: 'Perceived Enjoyment', questions: peQuestions.value, color: '#FFEB3B' },
  { key: 'objectiveUsability', label: 'Objective Usability', questions: ouQuestions.value, color: '#4CAF50' }
]);

const summaryDimensions = computed(() => {
  return dimensionConfig.value.map(dim => {
    const responses = answers.value[dim.key] || [];
    const answered = responses.filter(a => typeof a === 'number').length;
    const sum = responses.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
    const average = answered > 0 ? sum / answered : 0;
    return {
      key: dim.key,
      label: dim.label,
      color: dim.color,
      average,
      answered,
      total: responses.length
    };
  });
});

const detailedResponses = computed(() => {
  return dimensionConfig.value.map(dim => {
    const responses = answers.value[dim.key] || [];
    return {
      key: dim.key,
      label: dim.label,
      color: dim.color,
      responses: dim.questions.map((question, idx) => ({
        question,
        value: responses[idx]
      }))
    };
  });
});

const completeDimensions = computed(() => {
  return dimensionConfig.value.filter(dim => {
    const responses = answers.value[dim.key] || [];
    return responses.every(a => typeof a === 'number');
  }).length;
});

const overallAverage = computed(() => {
  let totalScore = 0;
  let totalAnswers = 0;
  
  dimensionConfig.value.forEach(dim => {
    const responses = answers.value[dim.key] || [];
    responses.forEach(response => {
      if (typeof response === 'number') {
        totalScore += response;
        totalAnswers++;
      }
    });
  });
  
  return totalAnswers > 0 ? totalScore / totalAnswers : 0;
});
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
