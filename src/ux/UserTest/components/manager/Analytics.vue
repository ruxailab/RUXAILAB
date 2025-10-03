<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center pb-2">
      <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
      Analytics
    </v-card-title>
    
    <v-card-text class="pa-4">
      <div v-if="!hasData" class="text-center text-medium-emphasis py-8">
        <v-icon size="48" color="grey-lighten-1">mdi-chart-box-outline</v-icon>
        <div class="text-body-2 mt-2">No analytics data yet</div>
      </div>
      
      <div v-else>
        <div class="mb-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">User Satisfaction</span>
            <span class="text-body-2 font-weight-bold">{{ averageSatisfaction }}/10</span>
          </div>
          <v-progress-linear 
            :model-value="(averageSatisfaction / 10) * 100" 
            color="success" 
            height="8"
            rounded
          />
        </div>
        
        <div class="mb-3">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2">NASA-TLX Responses</span>
            <v-chip size="small" color="orange" variant="outlined">
              {{ nasaTlxResponses }}
            </v-chip>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2">SUS Responses</span>
            <v-chip size="small" color="blue" variant="outlined">
              {{ susResponses }}
            </v-chip>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2">Avg. NASA-TLX Score</span>
            <v-chip size="small" color="warning" variant="outlined">
              {{ averageNasaTlx }}/100
            </v-chip>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2">Avg. SUS Score</span>
            <v-chip size="small" color="info" variant="outlined">
              {{ averageSusScore }}/100
            </v-chip>
          </div>
        </div>
        
        <!-- Task Success Rate -->
        <div class="mt-4">
          <div class="text-caption text-medium-emphasis mb-2">Task Success Breakdown</div>
          <div class="d-flex justify-space-between text-caption">
            <span>Successful: {{ successfulTasks }}</span>
            <span>Failed: {{ failedTasks }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
    
    <v-card-actions v-if="hasData">
      <v-spacer />
      <v-btn 
        variant="text" 
        size="small" 
        color="primary"
        @click="viewAnalytics"
      >
        View Analytics
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  test: {
    type: Object,
    default: () => ({})
  }
})

const router = useRouter()

const answers = computed(() => {
  const testAnswers = props.test?.answers || []
  return Array.isArray(testAnswers) ? testAnswers : Object.values(testAnswers)
})

const completedAnswers = computed(() => 
  answers.value.filter(answer => answer.submitted)
)

const hasData = computed(() => completedAnswers.value.length > 0)

const nasaTlxResponses = computed(() => {
  let count = 0
  completedAnswers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.nasaTlxAnswers && Object.keys(task.nasaTlxAnswers).length > 0) {
        count++
      }
    })
  })
  return count
})

const susResponses = computed(() => {
  let count = 0
  completedAnswers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.susAnswers && task.susAnswers.length > 0) {
        count++
      }
    })
  })
  return count
})

const averageNasaTlx = computed(() => {
  const scores = []
  completedAnswers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.nasaTlxAnswers) {
        const values = Object.values(task.nasaTlxAnswers).filter(v => typeof v === 'number')
        if (values.length > 0) {
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length
          scores.push(avg)
        }
      }
    })
  })
  return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
})

const averageSusScore = computed(() => {
  const scores = []
  completedAnswers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.susAnswers && task.susAnswers.length === 10) {
        // Calculate SUS score
        let score = 0
        task.susAnswers.forEach((answer, index) => {
          if (typeof answer === 'number') {
            if (index % 2 === 0) { // Odd questions (0-indexed)
              score += answer - 1
            } else { // Even questions
              score += 5 - answer
            }
          }
        })
        scores.push(score * 2.5) // Convert to 0-100 scale
      }
    })
  })
  return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
})

const averageSatisfaction = computed(() => {
  // This is a mock calculation - you might want to add specific satisfaction questions
  const susScore = averageSusScore.value
  return susScore > 0 ? Math.round((susScore / 100) * 10 * 10) / 10 : 0
})

const successfulTasks = computed(() => {
  let count = 0
  completedAnswers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.completed === true) count++
    })
  })
  return count
})

const failedTasks = computed(() => {
  let count = 0
  completedAnswers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.attempted && task.completed === false) count++
    })
  })
  return count
})

const viewAnalytics = () => {
  const testType = props.test?.testType === 'USER_MODERATED' ? 'moderated' : 'unmoderated'
  router.push(`/userTest/${testType}/analytics/${props.test.id}`)
}
</script>