<template>
  <div class="pa-4">
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <ManagerMetricCard
          :title="$t('CardSorting.totalParticipants')"
          :value="submittedCount"
          icon="mdi-account-group"
        />
      </v-col>
      <v-col cols="12" md="4">
        <ManagerMetricCard
          :title="$t('CardSorting.cards')"
          :value="cardsCount"
          icon="mdi-cards"
        />
      </v-col>
      <v-col cols="12" md="4">
        <ManagerMetricCard
          :title="$t('CardSorting.categories')"
          :value="categoriesCount"
          icon="mdi-shape"
        />
      </v-col>
    </v-row>

    <CardSortingMatrix :test="test" :answers="answers" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ManagerMetricCard from '@/shared/components/manager/ManagerMetricCard.vue'
import CardSortingMatrix from './CardSortingMatrix.vue'

const store = useStore()

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)

const submittedCount = computed(
  () => answers.value.filter((answer) => answer?.submitted).length,
)
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
