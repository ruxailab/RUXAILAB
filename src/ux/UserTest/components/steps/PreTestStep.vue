<template>
  <ShowInfo :title="testTitle + ' - ' + 'PreTest'">
    <template #content>
      <div class="test-content pa-4 rounded-xl">
        <!-- Step Indicator -->
        <div class="text-center mb-4 text-grey">
          Question {{ step + 1 }} / {{ preTest.length }}
        </div>
        <div class="mb-6">
          <v-col cols="12" class="py-0">
            <span class="text-subtitle-1 font-weight-bold text-secondary">{{
              currentItem.title
            }}</span>
            <br />
            <span
              v-if="currentItem.description"
              class="text-body-2 text-grey-darken-1"
              >{{ currentItem.description }}</span
            >

            <!-- text field -->
            <v-text-field
              v-if="currentItem.textField"
              v-model="localAnswers[step].answer"
              :placeholder="'Type your answer here…'"
              variant="outlined"
              density="comfortable"
              class="mt-2"
              @update:model-value="updateAnswer(step, $event)"
            />

            <!-- radio group -->
            <v-radio-group
              v-if="currentItem.selectionField"
              v-model="localAnswers[step].answer"
              class="mt-2"
              @update:model-value="updateAnswer(step, $event)"
            >
              <v-radio
                v-for="(selection, j) in currentItem.selectionFields"
                :key="j"
                :label="selection"
                :value="selection"
                density="compact"
              />
            </v-radio-group>
          </v-col>
        </div>

        <v-row class="mt-6" justify="space-between">
          <v-col cols="auto">
            <v-btn variant="outlined" :disabled="step === 0" @click="prev">
              Previous
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="!isLastStep" color="primary" @click="next">
              Next
            </v-btn>

            <v-btn v-else color="primary" variant="flat" @click="$emit('done')">
              Done
            </v-btn>
          </v-col>
        </v-row>
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
