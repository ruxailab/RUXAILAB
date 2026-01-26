<template>
  <v-row>
    <!-- Total Users -->
    <v-col cols="12" md="6" class="py-0">
      <v-card class="study-card study-card-primary-blur" elevation="8">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div class="flex-grow-1">
              <h3 class="card-title-small mb-1 text-white">
                {{ t('manager.studyOverview.totalParticipants') }}
              </h3>
              <div class="metric-value-small text-white">{{ totalUsers }}</div>
            </div>
            <div class="icon-container-small">
              <v-icon size="20" color="white">mdi-account-group</v-icon>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Completed Tests -->
    <v-col cols="12" md="6" class="py-0">
      <v-card class="study-card study-card-primary-blur" elevation="8">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div class="flex-grow-1">
              <h3 class="card-title-small mb-1 text-white">
                {{ t('manager.studyOverview.completed') }}
              </h3>
              <div class="metric-value-small text-white">
                {{ completedTests }}
              </div>
              <span class="progress-text-small text-white opacity-90">{{
                t('manager.studyOverview.rate', {
                  percentage: completionPercentage,
                })
              }}</span>
            </div>
            <div class="icon-container-small">
              <v-icon size="20" color="white">mdi-check-circle</v-icon>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- In Progress -->
    <v-col cols="12" md="6" m>
      <v-card class="study-card study-card-primary-blur" elevation="8">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div class="flex-grow-1">
              <h3 class="card-title-small mb-1 text-white">
                {{ t('manager.studyOverview.inProgress') }}
              </h3>
              <div class="metric-value-small text-white">
                {{ inProgressTests }}
              </div>
              <span class="progress-text-small text-white opacity-90">{{
                t('manager.studyOverview.active', {
                  percentage: inProgressPercentage,
                })
              }}</span>
            </div>
            <div class="icon-container-small">
              <v-icon size="20" color="white">mdi-clock-outline</v-icon>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Average Completion Time -->
    <v-col cols="12" md="6">
      <v-card class="study-card study-card-primary-blur" elevation="8">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div class="flex-grow-1">
              <h3 class="card-title-small mb-1 text-white">
                {{ t('manager.studyOverview.averageTime') }}
              </h3>
              <div class="metric-value-small text-white">
                {{ averageCompletionTime }}
              </div>
              <span class="progress-text-small text-white opacity-90">{{
                t('manager.studyOverview.completionTime')
              }}</span>
            </div>
            <div class="icon-container-small">
              <v-icon size="20" color="white">mdi-timer-outline</v-icon>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  test: {
    type: Object,
    default: () => ({}),
  },
})

// Combine answers and cooperators since both are participants
const getAllParticipants = computed(() => {
  let participants = []

  // Add answers if they exist
  const testAnswers = props.test?.answers || []
  if (Array.isArray(testAnswers)) {
    participants = [...testAnswers]
  } else if (typeof testAnswers === 'object' && testAnswers !== null) {
    participants = Object.values(testAnswers)
  }

  // Add cooperators since they are also participants who respond
  const cooperators = props.test?.cooperators || []
  if (Array.isArray(cooperators)) {
    participants = [...participants, ...cooperators]
  }

  return participants.filter(
    (participant) => typeof participant === 'object' && participant !== null,
  )
})

const totalUsers = computed(() => {
  return getAllParticipants.value.length
})

const completedTests = computed(() => {
  return getAllParticipants.value.filter((answer) => answer.submitted).length
})

const inProgressTests = computed(() => {
  return getAllParticipants.value.filter(
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

const timeEfficiencyPercentage = computed(() => {
  // Simple efficiency indicator based on average time
  const avgMinutes = parseFloat(averageCompletionTime.value)
  if (isNaN(avgMinutes)) return 0
  // Assume 30 minutes is 100% efficiency, scale accordingly
  return Math.min(100, Math.max(0, 100 - (avgMinutes - 30) * 2))
})

const averageCompletionTime = computed(() => {
  const completedAnswers = getAllParticipants.value.filter(
    (answer) => answer.submitted && answer.tasks,
  )

  if (completedAnswers.length === 0) return '0 min'

  let totalTime = 0
  let taskCount = 0

  completedAnswers.forEach((answer) => {
    const tasks = Array.isArray(answer.tasks)
      ? answer.tasks
      : Object.values(answer.tasks || {})
    tasks.forEach((task) => {
      if (task.taskTime) {
        totalTime += task.taskTime
        taskCount++
      }
    })
  })

  if (taskCount === 0) return '0 min'

  const avgMs = totalTime / taskCount
  const avgMinutes = Math.round(avgMs / 1000 / 60)
  return `${avgMinutes} min`
})
</script>

<style scoped>
/* Study Overview Cards */
.study-card {
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%) !important;
  min-height: 110px !important;
  max-height: 120px !important;
}

.study-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
}

/* Primary Blur Card - HIGH CONTRAST */
.study-card-primary-blur {
  background: rgba(var(--v-theme-primary), 0.95) !important;
  backdrop-filter: blur(15px) !important;
  -webkit-backdrop-filter: blur(15px) !important;
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

/* Card Content - HIGH CONTRAST VERSION */
.card-title-small {
  font-size: 0.875rem !important;
  font-weight: 700 !important;
  color: white !important;
  line-height: 1.2 !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.metric-value-small {
  font-size: 1.75rem !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  margin-bottom: 2px !important;
  color: white !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
}

.progress-text-small {
  font-size: 0.75rem !important;
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

/* Icon Containers - Compact Version */
.icon-container-small {
  width: 36px !important;
  height: 36px !important;
  border-radius: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.icon-container-small {
  background: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border: 2px solid rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

/* Responsive Design */
@media (max-width: 960px) {
  .study-card {
    min-height: 100px !important;
    max-height: 110px !important;
  }

  .metric-value-small {
    font-size: 1.25rem !important;
  }

  .icon-container-small {
    width: 32px !important;
    height: 32px !important;
  }
}

@media (max-width: 600px) {
  .study-card {
    min-height: 90px !important;
    max-height: 100px !important;
  }

  .metric-value-small {
    font-size: 1.1rem !important;
  }

  .card-title-small {
    font-size: 0.8rem !important;
  }

  .progress-text-small {
    font-size: 0.65rem !important;
  }
}
</style>
