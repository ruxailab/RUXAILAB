<template>
  <v-row>
    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="t('manager.studyOverview.totalParticipants')"
        :value="totalUsers"
        icon="mdi-account-group"
      />
    </v-col>

    <v-col cols="12" md="6" class="py-0">
      <ManagerMetricCard
        :title="t('manager.studyOverview.completed')"
        :value="completedTests"
        :subtitle="
          t('manager.studyOverview.rate', {
            percentage: completionPercentage,
          })
        "
        icon="mdi-check-circle"
      />
    </v-col>

    <v-col cols="12" md="6" m>
      <ManagerMetricCard
        :title="t('manager.studyOverview.inProgress')"
        :value="inProgressTests"
        :subtitle="
          t('manager.studyOverview.active', {
            percentage: inProgressPercentage,
          })
        "
        icon="mdi-clock-outline"
      />
    </v-col>

    <v-col cols="12" md="6">
      <ManagerMetricCard
        :title="t('manager.studyOverview.averageTime')"
        :value="averageCompletionTime"
        :subtitle="t('manager.studyOverview.completionTime')"
        icon="mdi-timer-outline"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import ManagerMetricCard from '@/shared/components/manager/ManagerMetricCard.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  test: {
    type: Object,
    default: () => ({}),
  },
})

// Read answers from the centralized Answer Vuex store getter
const allAnswers = computed(() => store.getters.allAnswersList)

// Accepted cooperators from the test document
const acceptedCooperators = computed(() => {
  const testCooperators = props.test?.cooperators || []
  return Array.isArray(testCooperators)
    ? testCooperators.filter((cooperator) => cooperator.accepted === true)
    : []
})

const totalUsers = computed(() => {
  // Use the larger of: accepted cooperators count or answers count
  // This ensures we count all participants who have taken the test
  // even if they weren't added as cooperators
  return Math.max(acceptedCooperators.value.length, allAnswers.value.length)
})

const completedTests = computed(() => {
  return allAnswers.value.filter((answer) => answer.submitted).length
})

const inProgressTests = computed(() => {
  return allAnswers.value.filter(
    (answer) => !answer.submitted && (answer.progress || 0) > 0,
  ).length
})

// Additional computed properties for progress indicators
const completionPercentage = computed(() => {
  if (totalUsers.value === 0) return 0
  return Math.round((completedTests.value / totalUsers.value) * 100)
})

const inProgressPercentage = computed(() => {
  if (totalUsers.value === 0) return 0
  return Math.round((inProgressTests.value / totalUsers.value) * 100)
})

const averageCompletionTime = computed(() => {
  const answersWithTasks = allAnswers.value.filter((answer) => answer.tasks)

  if (answersWithTasks.length === 0) return '0 min'

  let totalTime = 0
  let taskCount = 0

  answersWithTasks.forEach((answer) => {
    Object.values(answer.tasks || {}).forEach((task) => {
      totalTime += task.taskTime || 0
      taskCount++
    })
  })

  if (taskCount === 0) return '0 min'

  const avgMs = totalTime / taskCount
  const avgSeconds = Math.round(avgMs / 1000)
  if (avgSeconds < 60) return `${avgSeconds} sec`
  const avgMinutes = Math.round(avgMs / 1000 / 60)
  return `${avgMinutes} min`
})
</script>
