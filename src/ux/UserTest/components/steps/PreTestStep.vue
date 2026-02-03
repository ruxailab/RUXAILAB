<template>
  <ShowInfo
    v-if="preTest && preTest.length > 0"
    :title="testTitle + ' - ' + $t('UserTestView.titles.preTest')"
  >
    <template #content>
      <div class="test-content pa-4 rounded-xl">
        <QuestionStepper
          :questions="preTest"
          :answers="localAnswers"
          :title="$t('UserTestView.titles.preTest')"
          @update:answers="handleAnswerUpdate"
          @done="$emit('done')"
        />
      </div>
    </template>
  </ShowInfo>
  <div v-else @vue:mounted="$emit('done')" />
</template>

<script setup>
import { ref, watch } from 'vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import QuestionStepper from './QuestionStepper.vue'

const props = defineProps({
  testTitle: String,
  preTest: Array,
  preTestAnswer: Array,
  preTestCompleted: Boolean,
})

const emit = defineEmits(['done', 'update:preTestAnswer'])

const localAnswers = ref([...props.preTestAnswer])

watch(
  () => props.preTestAnswer,
  (newVal) => {
    localAnswers.value = [...newVal]
  },
  { deep: true },
)

function handleAnswerUpdate(answers) {
  localAnswers.value = answers
  emit('update:preTestAnswer', localAnswers.value)
}
</script>
