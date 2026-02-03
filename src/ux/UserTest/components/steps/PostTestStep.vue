<template>
  <ShowInfo
    v-if="postTest && postTest.length > 0"
    :title="testTitle + ' - ' + $t('UserTestView.titles.postTest')"
  >
    <template #content>
      <div class="test-content pa-4 rounded-xl">
        <QuestionStepper
          :questions="postTest"
          :answers="localAnswers"
          :title="$t('UserTestView.titles.postTest')"
          @update:answers="handleAnswerUpdate"
          @done="$emit('done')"
        />
      </div>
    </template>
  </ShowInfo>
  <div v-else @vue:mounted="$emit('done')" />
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
import QuestionStepper from './QuestionStepper.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  testTitle: String,
  postTestTitle: String,
  postTest: Array,
  postTestAnswer: Array,
  postTestCompleted: Boolean,
})

const emit = defineEmits(['done', 'update:postTestAnswer'])

const localAnswers = ref([...props.postTestAnswer])

function handleAnswerUpdate(answers) {
  localAnswers.value = answers
  emit('update:postTestAnswer', localAnswers.value)
}

watch(
  () => props.postTestAnswer,
  (newAnswers) => {
    if (newAnswers) {
      localAnswers.value = [...newAnswers]
    }
  },
  { deep: true, immediate: true },
)
</script>
