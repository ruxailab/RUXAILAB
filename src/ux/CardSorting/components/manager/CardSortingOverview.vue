<template>
  <v-row v-if="test">
    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="$t('CardSorting.totalParticipants')"
        :value="participantsCount"
        icon="mdi-account-group"
      />
    </v-col>

    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="$t('CardSorting.submitted')"
        :value="submittedCount"
        :subtitle="`${submittedCount}/${participantsCount}`"
        icon="mdi-check-circle"
      />
    </v-col>

    <v-col cols="12" md="6">
      <ManagerMetricCard
        :title="$t('CardSorting.cards')"
        :value="cardsCount"
        icon="mdi-cards"
      />
    </v-col>

    <v-col cols="12" md="6">
      <ManagerMetricCard
        :title="$t('CardSorting.categories')"
        :value="categoriesCount"
        icon="mdi-shape"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ManagerMetricCard from '@/shared/components/manager/ManagerMetricCard.vue'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const store = useStore()

const answers = computed(() => store.getters.cardSortingAnswersList)

const participantsCount = computed(() => answers.value.length)
const submittedCount = computed(
  () => answers.value.filter((answer) => answer?.submitted).length,
)
const cardsCount = computed(
  () => props.test?.testStructure?.cardSorting?.cards?.length || 0,
)
const categoriesCount = computed(
  () => props.test?.testStructure?.cardSorting?.categories?.length || 0,
)
</script>
