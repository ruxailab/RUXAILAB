<template>
  <div>
    <IntroAnswer v-if="!hasAnswers" @go-to-coops="goToCoops" />
    <v-row v-else justify="center" class="ma-0">
      <ShowInfo :hide-col="true">
        <template #top>
          <v-tabs
            v-model="tab"
            bg-color="transparent"
            color="#FCA326"
            slider-size="4"
          >
            <v-tab value="0">
              {{ $t('analytics.generalAnalytics') }}
            </v-tab>
            <v-tab value="1">
              {{ $t('analytics.individualAnalytics') }}
            </v-tab>
          </v-tabs>
        </template>

        <template #content>
          <div class="ma-0 pa-0">
            <CardSortingGeneralAnalytics v-if="tab === '0'" />
            <CardSortingIndividualAnalytics v-if="tab === '1'" />
          </div>
        </template>
      </ShowInfo>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import IntroAnswer from '@/shared/components/introduction_cards/IntroAnswer.vue'
import CardSortingGeneralAnalytics from './results/CardSortingGeneralAnalytics.vue'
import CardSortingIndividualAnalytics from './results/CardSortingIndividualAnalytics.vue'

defineProps({
  id: {
    type: String,
    default: '',
  },
})

const store = useStore()
const router = useRouter()

const tab = ref('0')

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)

const hasAnswers = computed(() => answers.value.length > 0)

const goToCoops = () => {
  if (test.value?.id) {
    router.push(`/cardSorting/cooperators/${test.value.id}`).catch(() => {})
  }
}
</script>
