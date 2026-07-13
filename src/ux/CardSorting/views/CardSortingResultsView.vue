<template>
  <PageWrapper :title="$t('CardSorting.results')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('CardSorting.resultsSubtitle') }}
      </p>
    </template>

    <v-container>
      <!-- Summary metrics -->
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
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import ManagerMetricCard from '@/shared/components/manager/ManagerMetricCard.vue'
import CardSortingMatrix from '../components/results/CardSortingMatrix.vue'

const store = useStore()
const route = useRoute()

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)

const submittedCount = computed(
  () => answers.value.filter((answer) => answer?.submitted).length,
)
const cardsCount = computed(
  () => test.value?.testStructure?.cardSorting?.cards?.length || 0,
)
const categoriesCount = computed(
  () => test.value?.testStructure?.cardSorting?.categories?.length || 0,
)

onMounted(async () => {
  if (!test.value) {
    await store.dispatch('getStudy', { id: route.params.id })
  }
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
