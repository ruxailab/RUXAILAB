<template>
  <PageWrapper :title="hasAnswers ? $t('titles.answers') : ''" :side-gap="true">
    <template v-if="hasAnswers" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('CardSorting.answersSubtitle') }}
      </p>
    </template>

    <div v-if="testAnswerDocument">
      <CardSortingAnswer />
    </div>
  </PageWrapper>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import CardSortingAnswer from '../components/CardSortingAnswer.vue'

const store = useStore()
const route = useRoute()

const test = computed(() => store.getters.test)
const testAnswerDocument = computed(
  () => store.state.Answer.testAnswerDocument || {},
)

const hasAnswers = computed(() => {
  const answers = testAnswerDocument.value.cardSortingAnswers
  return answers && Object.keys(answers).length > 0
})

onMounted(async () => {
  if (!test.value) {
    await store.dispatch('getStudy', { id: route.params.id })
  }
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
