<template>
  <ShowInfo :title="testTitle + ' - ' + 'PreTest'">
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
              >{{ preTest.length }} total</span
            >
          </div>

          <v-progress-linear
            :model-value="progressPercentage"
            color="primary"
            height="8"
            rounded
            class="mb-7"
          />

          <div class="question-shell mx-auto mb-8">
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

          <v-row class="mt-2" justify="space-between">
            <v-col cols="auto">
              <v-btn
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
                v-if="!isLastStep"
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
import { ref, computed, watch } from 'vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'

const props = defineProps({
  testTitle: String,
  preTest: Array,
  preTestAnswer: Array,
  preTestCompleted: Boolean,
})

const emit = defineEmits(['done', 'update:preTestAnswer'])

const step = ref(0)
const localAnswers = ref([...props.preTestAnswer])

const currentItem = computed(() => props.preTest[step.value])
const isLastStep = computed(() => step.value === props.preTest.length - 1)
const progressPercentage = computed(() => {
  if (!props.preTest?.length) return 0
  return ((step.value + 1) / props.preTest.length) * 100
})

const next = () => {
  if (step.value < props.preTest.length - 1) step.value++
}

const prev = () => {
  if (step.value > 0) step.value--
}

const updateAnswer = (index, value) => {
  localAnswers.value[index].answer = value
  emit('update:preTestAnswer', localAnswers.value)
}

watch(
  () => props.preTestAnswer,
  (newVal) => {
    localAnswers.value = [...newVal]
  },
  { deep: true },
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
</style>
