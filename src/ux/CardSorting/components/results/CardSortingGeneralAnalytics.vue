<template>
  <div class="pa-4 analytics-dashboard">
    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="submittedCount"
          :label="$t('CardSorting.totalParticipants')"
          color="success"
          icon="mdi-account-group"
          :description="
            $t('CardSorting.participantsDescription', {
              total: answers.length,
            })
          "
          :progress="submissionRate"
        />
      </v-col>
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="cardsCount"
          :label="$t('CardSorting.cards')"
          color="info"
          icon="mdi-cards"
          :description="$t('CardSorting.cardsDescription')"
          :progress="100"
        />
      </v-col>
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="categoriesCount"
          :label="$t('CardSorting.categories')"
          color="warning"
          icon="mdi-shape"
          :description="$t('CardSorting.categoriesDescription')"
          :progress="100"
        />
      </v-col>
    </v-row>

    <AnswersTimeline
      v-if="answers.length"
      :task-answers="answers"
      @refresh="onRefreshTimeline"
    />

    <CardSortingMatrix :test="test" :answers="answers" />
    <CardSortingSimilarityMatrix :test="test" :answers="answers" />
    <CardSortingDendrogram :test="test" :answers="answers" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import UxMetricCard from '@/ux/UserTest/components/answers/UxMetricCard.vue'
import AnswersTimeline from '@/ux/UserTest/components/answers/AnswersTimeline.vue'
import CardSortingMatrix from './CardSortingMatrix.vue'
import CardSortingSimilarityMatrix from './CardSortingSimilarityMatrix.vue'
import CardSortingDendrogram from './CardSortingDendrogram.vue'

const store = useStore()

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)

const onRefreshTimeline = async () => {
  await store.dispatch('getCurrentTestAnswerDoc')
}

const submittedCount = computed(
  () => answers.value.filter((answer) => answer?.submitted).length,
)

const submissionRate = computed(() => {
  if (!answers.value.length) return 0
  return Math.round((submittedCount.value / answers.value.length) * 100)
})

const cardsCount = computed(
  () => test.value?.testStructure?.cardSorting?.cards?.length || 0,
)

const categoriesCount = computed(() => {
  const predefined =
    test.value?.testStructure?.cardSorting?.categories?.length || 0
  if (predefined > 0) return predefined

  const custom = new Set()
  answers.value
    .filter((answer) => answer?.submitted)
    .forEach((answer) => {
      Object.keys(answer?.sorting || {}).forEach((category) => {
        if (category !== '__unassigned') custom.add(category)
      })
    })
  return custom.size
})
</script>
