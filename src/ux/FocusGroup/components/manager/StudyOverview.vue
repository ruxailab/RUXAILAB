<template>
  <v-row>
    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="t('focusGroup.studyOverview.topics')"
        :value="topicCount"
        :subtitle="t('focusGroup.studyOverview.topicsSubtitle')"
        icon="mdi-format-list-numbered"
      />
    </v-col>

    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="t('focusGroup.studyOverview.totalDuration')"
        :value="t('manager.studyOverview.minUnit', { value: totalDuration })"
        :subtitle="t('focusGroup.studyOverview.durationSubtitle')"
        icon="mdi-timer-outline"
      />
    </v-col>

    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="t('focusGroup.studyOverview.maxParticipants')"
        :value="maxParticipants"
        :subtitle="t('focusGroup.studyOverview.perSession')"
        icon="mdi-account-group"
      />
    </v-col>

    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="t('focusGroup.studyOverview.team')"
        :value="teamSize"
        :subtitle="t('focusGroup.studyOverview.teamSubtitle')"
        icon="mdi-account-multiple-outline"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ManagerMetricCard from '@/shared/components/manager/ManagerMetricCard.vue'

const { t } = useI18n()

const props = defineProps({
  test: {
    type: Object,
    default: () => ({}),
  },
})

const discussionGuide = computed(() =>
  Array.isArray(props.test?.discussionGuide) ? props.test.discussionGuide : [],
)

const topicCount = computed(() => discussionGuide.value.length)

const totalDuration = computed(() =>
  discussionGuide.value.reduce(
    (total, topic) => total + (topic?.durationMinutes || 0),
    0,
  ),
)

const maxParticipants = computed(
  () => props.test?.config?.maxParticipants ?? '—',
)

const teamSize = computed(() => {
  const cooperators = props.test?.cooperators
  if (!Array.isArray(cooperators)) return 0
  return cooperators.filter((cooperator) => cooperator.accepted === true).length
})
</script>
