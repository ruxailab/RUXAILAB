<template>
  <div class="question-stepper">
    <!-- Progress Header -->
    <div class="progress-header mb-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-subtitle-1 font-weight-medium text-secondary">
          {{ title }}
        </span>
        <span class="text-body-2 text-grey-darken-1">
          {{
            $t('questionStepper.questionOf', {
              current: currentIndex + 1,
              total: questions.length,
            })
          }}
        </span>
      </div>
      <v-progress-linear
        :model-value="progressPercent"
        color="primary"
        height="8"
        rounded
        class="progress-bar"
      />
    </div>

    <!-- Question Content with Transition -->
    <transition name="fade-slide" mode="out-in">
      <div :key="currentIndex" class="question-content pa-6 rounded-xl">
        <h2 class="question-title text-h5 font-weight-bold mb-2">
          {{ currentQuestion.title }}
        </h2>
        <p
          v-if="currentQuestion.description"
          class="question-description text-body-1 text-grey-darken-1 mb-4"
        >
          {{ currentQuestion.description }}
        </p>

        <!-- Text Field Answer -->
        <v-text-field
          v-if="currentQuestion.textField"
          :model-value="currentAnswer"
          :placeholder="currentQuestion.title"
          variant="outlined"
          density="comfortable"
          class="mt-4"
          @update:model-value="updateCurrentAnswer"
        />

        <!-- Radio Button Answer -->
        <v-radio-group
          v-if="currentQuestion.selectionField"
          :model-value="currentAnswer"
          class="mt-4"
          @update:model-value="updateCurrentAnswer"
        >
          <v-radio
            v-for="(option, j) in currentQuestion.selectionFields"
            :key="j"
            :label="option"
            :value="option"
            density="comfortable"
            class="mb-2"
          />
        </v-radio-group>
      </div>
    </transition>

    <!-- Navigation Buttons -->
    <v-row justify="center" class="mt-6 navigation-buttons">
      <v-col cols="12" md="8" class="d-flex justify-space-between">
        <v-btn
          v-if="!isFirstQuestion"
          variant="outlined"
          color="secondary"
          size="large"
          @click="previousQuestion"
        >
          <v-icon start>mdi-chevron-left</v-icon>
          {{ $t('questionStepper.previous') }}
        </v-btn>
        <div v-else />

        <v-btn
          v-if="!isLastQuestion"
          color="primary"
          variant="flat"
          size="large"
          @click="nextQuestion"
        >
          {{ $t('questionStepper.next') }}
          <v-icon end>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          v-else
          color="primary"
          variant="flat"
          size="large"
          @click="$emit('done')"
        >
          {{ $t('questionStepper.done') }}
          <v-icon end>mdi-check</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
  answers: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:answers', 'done'])

// Current question index
const currentIndex = ref(0)

// Local copy of answers
const localAnswers = ref([...props.answers])

// Watch for external answer changes
watch(
  () => props.answers,
  (newVal) => {
    localAnswers.value = [...newVal]
  },
  { deep: true },
)

// Computed properties
const currentQuestion = computed(
  () => props.questions[currentIndex.value] || {},
)

const currentAnswer = computed(() => {
  const answer = localAnswers.value[currentIndex.value]
  return answer?.answer || ''
})

const progressPercent = computed(() => {
  if (props.questions.length === 0) return 0
  return ((currentIndex.value + 1) / props.questions.length) * 100
})

const isFirstQuestion = computed(() => currentIndex.value === 0)

const isLastQuestion = computed(
  () => currentIndex.value === props.questions.length - 1,
)

// Methods
function updateCurrentAnswer(value) {
  // Ensure the answer object exists at this index
  if (!localAnswers.value[currentIndex.value]) {
    localAnswers.value[currentIndex.value] = { answer: '' }
  }
  localAnswers.value[currentIndex.value].answer = value
  emit('update:answers', localAnswers.value)
}

function nextQuestion() {
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++
  }
}

function previousQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}
</script>

<style scoped>
.question-stepper {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.progress-header {
  position: relative;
}

.progress-bar {
  transition: all 0.3s ease;
}

.question-content {
  background: transparent;
  min-height: 200px;
}

.question-title {
  color: inherit;
}

.question-description {
  line-height: 1.6;
}

/* Transition animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.navigation-buttons .v-btn {
  min-width: 120px;
}
</style>
