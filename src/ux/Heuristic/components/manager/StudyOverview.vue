<template>
  <v-row v-if="test">
    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="$t('Dashboard.stats.participants')"
        :value="participantsCount"
        icon="mdi-account-group"
      />
    </v-col>

    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="$t('Dashboard.stats.completion')"
        :value="`${completionRate}%`"
        :subtitle="`${completedCount}/${participantsCount}`"
        icon="mdi-check-circle"
      />
    </v-col>

    <v-col cols="12" md="6">
      <ManagerMetricCard
        :title="$t('Dashboard.stats.daysActive')"
        :value="daysActive"
        icon="mdi-calendar-clock"
      />
    </v-col>

    <v-col cols="12" md="6">
      <ManagerMetricCard
        :title="$t('Dashboard.stats.heuristics')"
        :value="heuristicsCount"
        icon="mdi-format-list-checks"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { differenceInDays } from 'date-fns'
import ManagerMetricCard from '@/shared/components/manager/ManagerMetricCard.vue'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

// Computed properties
const participantsCount = computed(() => props.test?.cooperators?.length || 0)

const completedCount = computed(() => {
  return props.test?.cooperators?.filter((c) => c?.progress === 100).length || 0
})

const completionRate = computed(() => {
  if (!props.test?.cooperators?.length) return 0
  return Math.round((completedCount.value / props.test.cooperators.length) * 100)
})

const daysActive = computed(() => {
  if (!props.test?.creationDate) return 0
  return differenceInDays(new Date(), new Date(props.test.creationDate))
})

const heuristicsCount = computed(() => props.test?.testStructure?.length || 0)
</script>
