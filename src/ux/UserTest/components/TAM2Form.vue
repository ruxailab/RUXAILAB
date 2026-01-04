<template>
  <v-form ref="form" v-model="valid">
    <!-- Information header -->
    <v-card variant="outlined" color="primary" class="mb-6">
      <v-card-text class="text-center">
        <v-icon size="48" color="primary" class="mb-2">
          mdi-clipboard-check-outline
        </v-icon>
        <h3 class="text-h6 font-weight-bold text-primary mb-2">
          Technology Acceptance Model (TAM-2)
        </h3>
        <p class="text-body-2 text-grey-darken-3 mb-2">
          Please evaluate the system you just used by answering the following
          questions. Rate each statement on a scale from
          <strong>Strongly Disagree</strong> to <strong>Strongly Agree</strong>.
        </p>
        <p class="text-body-2 text-grey-darken-3">
          Your honest feedback helps us understand technology acceptance
          including social factors. All questions are required.
        </p>
      </v-card-text>
    </v-card>

    <!-- Progress indicator -->
    <div class="d-flex align-center mb-4">
      <span class="text-subtitle-1"
        >Progress: {{ completedCount }}/{{ totalQuestions }}</span
      >
      <v-progress-linear
        class="ml-4"
        :model-value="(completedCount / totalQuestions) * 100"
        :color="completedCount === totalQuestions ? 'success' : 'primary'"
      />
    </div>

    <!-- TAM-1 Core Constructs -->
    <ConstructSection
      title="Perceived Usefulness"
      icon="mdi-star-outline"
      color="blue-lighten-5"
      :questions="tam1Items.perceivedUsefulness"
      :answers="answers.perceivedUsefulness"
      :start-index="1"
      @update:answers="updateConstructAnswers('perceivedUsefulness', $event)"
    />

    <ConstructSection
      title="Perceived Ease of Use"
      icon="mdi-hand-heart-outline"
      color="green-lighten-5"
      :questions="tam1Items.perceivedEaseOfUse"
      :answers="answers.perceivedEaseOfUse"
      :start-index="7"
      @update:answers="updateConstructAnswers('perceivedEaseOfUse', $event)"
    />

    <!-- TAM-2 Additional Constructs -->
    <ConstructSection
      title="Subjective Norm"
      icon="mdi-account-group-outline"
      color="purple-lighten-5"
      :questions="tam2Items.subjectiveNorm"
      :answers="answers.subjectiveNorm"
      :start-index="13"
      @update:answers="updateConstructAnswers('subjectiveNorm', $event)"
    />

    <ConstructSection
      title="Image"
      icon="mdi-image-outline"
      color="orange-lighten-5"
      :questions="tam2Items.image"
      :answers="answers.image"
      :start-index="17"
      @update:answers="updateConstructAnswers('image', $event)"
    />

    <ConstructSection
      title="Job Relevance"
      icon="mdi-briefcase-outline"
      color="teal-lighten-5"
      :questions="tam2Items.jobRelevance"
      :answers="answers.jobRelevance"
      :start-index="20"
      @update:answers="updateConstructAnswers('jobRelevance', $event)"
    />

    <ConstructSection
      title="Output Quality"
      icon="mdi-quality-high"
      color="indigo-lighten-5"
      :questions="tam2Items.outputQuality"
      :answers="answers.outputQuality"
      :start-index="22"
      @update:answers="updateConstructAnswers('outputQuality', $event)"
    />

    <ConstructSection
      title="Result Demonstrability"
      icon="mdi-presentation"
      color="pink-lighten-5"
      :questions="tam2Items.resultDemonstrability"
      :answers="answers.resultDemonstrability"
      :start-index="24"
      @update:answers="updateConstructAnswers('resultDemonstrability', $event)"
    />
  </v-form>
</template>

<script setup>
import { ref, computed } from 'vue'
import ConstructSection from './ConstructSection.vue'
import { TAM1_ITEMS, TAM2_ADDITIONAL_ITEMS } from '../utils/tamData.js'

const props = defineProps({
  taskIndex: {
    type: Number,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({
      perceivedUsefulness: Array(6).fill(null),
      perceivedEaseOfUse: Array(6).fill(null),
      subjectiveNorm: Array(4).fill(null),
      image: Array(3).fill(null),
      jobRelevance: Array(2).fill(null),
      outputQuality: Array(2).fill(null),
      resultDemonstrability: Array(4).fill(null),
    }),
  },
})

const emit = defineEmits(['update:modelValue'])

const form = ref(null)
const valid = ref(false)

// TAM items
const tam1Items = TAM1_ITEMS
const tam2Items = TAM2_ADDITIONAL_ITEMS

// Reactive answers with proper defaults
const answers = computed({
  get: () => {
    const defaultAnswers = {
      perceivedUsefulness: Array(6).fill(null),
      perceivedEaseOfUse: Array(6).fill(null),
      subjectiveNorm: Array(4).fill(null),
      image: Array(3).fill(null),
      jobRelevance: Array(2).fill(null),
      outputQuality: Array(2).fill(null),
      resultDemonstrability: Array(4).fill(null),
    }

    // Merge with existing values, ensuring arrays exist
    const currentValue = props.modelValue || {}
    const mergedAnswers = { ...defaultAnswers }

    Object.keys(defaultAnswers).forEach((key) => {
      if (currentValue[key] && Array.isArray(currentValue[key])) {
        mergedAnswers[key] = currentValue[key]
      }
    })

    return mergedAnswers
  },
  set: (newValue) => {
    emit('update:modelValue', newValue)
  },
})

// Calculate total questions
const totalQuestions = computed(() => {
  return (
    Object.values(tam1Items).flat().length +
    Object.values(tam2Items).flat().length
  )
})

// Progress tracking
const completedCount = computed(() => {
  let count = 0
  Object.values(answers.value).forEach((constructAnswers) => {
    if (Array.isArray(constructAnswers)) {
      count += constructAnswers.filter(
        (answer) => answer !== null && answer !== undefined,
      ).length
    }
  })
  return count
})

// Update construct answers
const updateConstructAnswers = (construct, newAnswers) => {
  const updatedAnswers = { ...answers.value }
  updatedAnswers[construct] = newAnswers
  emit('update:modelValue', updatedAnswers)
}

// Form validation
const isFormValid = computed(() => {
  return completedCount.value === totalQuestions.value
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
