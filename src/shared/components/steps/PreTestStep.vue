<template>
  <ShowInfo :title="`${testTitle} - ${$t('UserTestView.PreTestStep.title')}`">
    <template #content>
      <div class="test-content pa-2 pa-sm-4">
        <v-sheet rounded="xl" border class="pa-4 pa-sm-6">
          <div class="d-flex align-center justify-space-between mb-4">
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="font-weight-bold"
            >
              {{
                $t('UserTestView.PreTestStep.question', {
                  number: step + 1,
                })
              }}
            </v-chip>
            <span class="text-caption text-medium-emphasis">{{
              $t('UserTestView.PreTestStep.total', {
                count: preTest.length,
              })
            }}</span>
          </div>

          <v-progress-linear
            :model-value="progressPercentage"
            color="primary"
            height="8"
            rounded
            class="mb-7"
          />

          <div
            v-if="!hasQuestions"
            class="question-shell mx-auto mb-8 text-center"
          >
            <p class="text-body-1 text-medium-emphasis">
              {{ $t('UserTestView.PreTestStep.noQuestions') }}
            </p>
          </div>

          <div
            v-else-if="currentItem"
            class="question-shell mx-auto mb-8"
            @keydown.enter.prevent="handleEnter"
          >
            <h2
              class="text-h5 text-sm-h4 font-weight-bold text-secondary text-center mb-3"
            >
              {{ currentItem.title }}
            </h2>
            <p
              v-if="currentItem.description"
              class="text-subtitle-1 text-center text-medium-emphasis mb-6"
            >
              {{ currentItem.description }}
            </p>

            <div v-if="currentItem.textField" class="answer-field-wrap mx-auto">
              <v-text-field
                v-model="localAnswers[step].answer"
                :data-study-field-ref="`preTest:${step}:answer`"
                :placeholder="$t('UserTestView.PreTestStep.answerPlaceholder')"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details="auto"
                class="answer-input"
                @update:model-value="updateAnswer(step, $event)"
              />
            </div>

            <div
              v-if="currentItem.selectionField"
              class="answer-field-wrap mx-auto"
            >
              <v-radio-group
                v-model="localAnswers[step].answer"
                hide-details="auto"
                class="options-center"
                @update:model-value="updateAnswer(step, $event)"
              >
                <v-radio
                  v-for="(selection, j) in currentItem.selectionFields"
                  :key="j"
                  :label="selection"
                  :value="selection"
                  density="comfortable"
                  class="mb-1"
                />
              </v-radio-group>
            </div>
          </div>

          <v-row class="mt-2" justify="space-between">
            <v-col cols="auto">
              <v-btn
                v-if="hasQuestions"
                rounded="pill"
                variant="outlined"
                :disabled="step === 0"
                @click="prev"
              >
                {{ $t('UserTestView.PreTestStep.previous') }}
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                v-if="hasQuestions && !isLastStep"
                rounded="pill"
                color="primary"
                variant="flat"
                @click="next"
              >
                {{ $t('UserTestView.PreTestStep.next') }}
              </v-btn>

              <v-btn
                v-else
                rounded="pill"
                color="primary"
                variant="flat"
                @click="$emit('done')"
              >
                {{ $t('UserTestView.PreTestStep.done') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-sheet>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'

const props = defineProps({
  testTitle: String,
  preTest: Array,
  preTestAnswer: Array,
  preTestCompleted: Boolean,
})

const emit = defineEmits(['done', 'update:preTestAnswer', 'selection-changed'])

const step = ref(0)
const normalizeAnswers = (questions, answers) => {
  if (!Array.isArray(questions)) return []

  return questions.map((_, index) => {
    const answer = answers?.[index]
    return {
      ...(answer && typeof answer === 'object' ? answer : {}),
      answer: answer && typeof answer === 'object' ? (answer.answer ?? '') : '',
    }
  })
}

const localAnswers = ref(normalizeAnswers(props.preTest, props.preTestAnswer))

const hasQuestions = computed(() => (props.preTest?.length ?? 0) > 0)
const currentItem = computed(() => props.preTest?.[step.value] ?? null)
const isLastStep = computed(
  () => !hasQuestions.value || step.value === props.preTest.length - 1,
)
const progressPercentage = computed(() => {
  if (!hasQuestions.value) return 100
  return ((step.value + 1) / props.preTest.length) * 100
})

const next = () => {
  if (!hasQuestions.value) return
  if (step.value < props.preTest.length - 1) step.value++
}

const prev = () => {
  if (step.value > 0) step.value--
}

const handleEnter = () => {
  if (!hasQuestions.value || isLastStep.value) {
    emit('done')
    return
  }
  next()
}

const updateAnswer = (index, value) => {
  if (!localAnswers.value[index]) return
  localAnswers.value[index].answer = value
  emit('update:preTestAnswer', localAnswers.value)
  if (props.preTest?.[index]?.selectionField) {
    emit('selection-changed', {
      itemRef: `preTest:question:${index}`,
      value,
    })
  }
}

watch(
  [() => props.preTest, () => props.preTestAnswer],
  ([questions, answers]) => {
    localAnswers.value = normalizeAnswers(questions, answers)
    if (
      Array.isArray(questions) &&
      questions.length > 0 &&
      (!Array.isArray(answers) ||
        answers.length !== questions.length ||
        answers.some((answer) => !answer || typeof answer !== 'object'))
    ) {
      emit('update:preTestAnswer', localAnswers.value)
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.preTest?.length,
  (length) => {
    if (length && step.value >= length) {
      step.value = Math.max(0, length - 1)
    }
  },
)

// function updateAnswer(index, value) {
//   localAnswers.value[index].answer = value;
//   emit("update:preTestAnswer", localAnswers.value);
// }
</script>

<style scoped>
.question-shell {
  max-width: 880px;
}

.answer-field-wrap {
  width: 560px;
  max-width: 100%;
}

.answer-input :deep(.v-field__input) {
  font-size: 1.25rem;
  text-align: center;
}

.options-center :deep(.v-selection-control-group) {
  width: fit-content;
  margin-inline: auto;
}
</style>
