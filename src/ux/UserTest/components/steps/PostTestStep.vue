<template>
  <ShowInfo :title="testTitle + ' - ' + 'PostTest'">
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
              Question {{ step + 1 }}
            </v-chip>
            <span class="text-caption text-medium-emphasis"
              >{{ postTest.length }} total</span
            >
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
              No post-test questions configured for this study.
            </p>
          </div>

          <div v-else-if="currentItem" class="question-shell mx-auto mb-8">
            <h2
              class="text-h4 text-sm-h3 font-weight-bold text-secondary text-center mb-3"
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
                :data-study-field-ref="`postTest:${step}:answer`"
                :placeholder="'Type your answer here…'"
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

          <v-row justify="space-between" class="mt-2">
            <v-col cols="auto">
              <v-btn
                v-if="hasQuestions"
                rounded="pill"
                variant="outlined"
                :disabled="step === 0"
                @click="prev"
              >
                Previous
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
                Next
              </v-btn>
              <v-btn
                v-else
                rounded="pill"
                color="primary"
                variant="flat"
                @click="$emit('done')"
              >
                Done
              </v-btn>
            </v-col>
          </v-row>
        </v-sheet>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
import { ref, computed, watch } from 'vue'

const props = defineProps({
  testTitle: String,
  postTestTitle: String,
  postTest: Array,
  postTestAnswer: Array,
  postTestCompleted: Boolean,
})

const emit = defineEmits(['done', 'update:postTestAnswer'])

const step = ref(0)
const localAnswers = ref(
  Array.isArray(props.postTestAnswer) ? [...props.postTestAnswer] : [],
)

const hasQuestions = computed(() => (props.postTest?.length ?? 0) > 0)
const currentItem = computed(() => props.postTest?.[step.value] ?? null)
const isLastStep = computed(
  () => !hasQuestions.value || step.value === props.postTest.length - 1,
)
const progressPercentage = computed(() => {
  if (!hasQuestions.value) return 100
  return ((step.value + 1) / props.postTest.length) * 100
})

const next = () => {
  if (!hasQuestions.value) return
  if (step.value < props.postTest.length - 1) step.value++
}

const prev = () => {
  if (step.value > 0) step.value--
}

const updateAnswer = (index, value) => {
  if (!localAnswers.value[index]) return
  localAnswers.value[index].answer = value
  emit('update:postTestAnswer', localAnswers.value)
}

watch(
  () => props.postTestAnswer,
  (newAnswers) => {
    if (Array.isArray(newAnswers)) {
      localAnswers.value = [...newAnswers]
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.postTest?.length,
  (length) => {
    if (length && step.value >= length) {
      step.value = Math.max(0, length - 1)
    }
  },
)
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
</style>
