<template>
  <v-card 
    class="h-100 tasks-card"
    elevation="2"
  >
    <!-- Header with gradient background -->
    <div class="tasks-header pa-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div class="icon-container mr-3">
            <v-icon
              color="white"
              size="24"
            >
              mdi-format-list-checks
            </v-icon>
          </div>
          <div>
            <h3 class="text-h6 text-white mb-0">
              Tasks Overview
            </h3>
            <p class="text-body-2 text-white opacity-90 mb-0">
              Task structure and completion
            </p>
          </div>
        </div>
        <v-chip
          size="small"
          color="rgba(255,255,255,0.2)"
          variant="outlined"
          class="border-white text-white"
        >
          <v-icon
            start
            size="16"
          >
            mdi-flask
          </v-icon>
          Beta
        </v-chip>
      </div>
    </div>
    
    <v-card-text class="pa-4">
      <div
        v-if="!hasUserTasks"
        class="text-center text-medium-emphasis py-8"
      >
        <v-icon
          size="48"
          color="grey-lighten-1"
        >
          mdi-clipboard-text-outline
        </v-icon>
        <div class="text-body-2 mt-2">
          No tasks configured
        </div>
      </div>
      
      <div v-else>
        <div class="mb-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">Task Completion Rate</span>
            <span class="text-body-2 font-weight-bold">{{ overallCompletionRate }}%</span>
          </div>
          <v-progress-linear 
            :model-value="overallCompletionRate" 
            color="primary" 
            height="8"
            rounded
          />
        </div>
        
        <div class="mb-3">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2">Total Tasks</span>
            <v-chip
              size="small"
              color="primary"
              variant="outlined"
            >
              {{ totalTasks }}
            </v-chip>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2">Avg. Task Duration</span>
            <v-chip
              size="small"
              color="info"
              variant="outlined"
            >
              {{ averageTaskDuration }}
            </v-chip>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2">Success Rate</span>
            <v-chip
              size="small"
              color="success"
              variant="outlined"
            >
              {{ taskSuccessRate }}%
            </v-chip>
          </div>
        </div>
        
        <!-- Task Types Summary -->
        <div
          v-if="taskTypes.length > 0"
          class="mt-4"
        >
          <div class="text-caption text-medium-emphasis mb-2">
            Task Types
          </div>
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="type in taskTypes"
              :key="type.name"
              size="x-small"
              :color="getTaskTypeColor(type.name)"
              variant="outlined"
            >
              {{ type.name }} ({{ type.count }})
            </v-chip>
          </div>
        </div>
      </div>
    </v-card-text>
    
    <v-card-actions v-if="hasUserTasks">
      <v-spacer />
      <v-btn 
        variant="text" 
        size="small" 
        color="primary"
        @click="viewTasks"
      >
        View Tasks
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

const userTasks = computed(() => props.test?.testStructure?.userTasks || [])
const hasUserTasks = computed(() => userTasks.value.length > 0)
const totalTasks = computed(() => userTasks.value.length)

const answers = computed(() => {
  const testAnswers = props.test?.answers || []
  return Array.isArray(testAnswers) ? testAnswers : Object.values(testAnswers)
})

const overallCompletionRate = computed(() => {
  if (!hasUserTasks.value || answers.value.length === 0) return 0
  
  let totalAttempts = 0
  let completedAttempts = 0
  
  answers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.attempted) {
        totalAttempts++
        if (task.completed) {
          completedAttempts++
        }
      }
    })
  })
  
  return totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0
})

const taskSuccessRate = computed(() => {
  if (!hasUserTasks.value || answers.value.length === 0) return 0
  
  let totalCompleted = 0
  let successfullyCompleted = 0
  
  answers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.attempted) {
        totalCompleted++
        if (task.completed === true) {
          successfullyCompleted++
        }
      }
    })
  })
  
  return totalCompleted > 0 ? Math.round((successfullyCompleted / totalCompleted) * 100) : 0
})

const averageTaskDuration = computed(() => {
  if (!hasUserTasks.value || answers.value.length === 0) return '0 min'
  
  let totalTime = 0
  let taskCount = 0
  
  answers.value.forEach(answer => {
    const tasks = Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks || {})
    tasks.forEach(task => {
      if (task.taskTime && task.attempted) {
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

const taskTypes = computed(() => {
  const typeCount = {}
  
  userTasks.value.forEach(task => {
    const type = task.taskType || 'standard'
    typeCount[type] = (typeCount[type] || 0) + 1
  })
  
  return Object.entries(typeCount).map(([name, count]) => ({ name, count }))
})

const getTaskTypeColor = (type) => {
  const colors = {
    'text-area': 'blue',
    'sus': 'green',
    'nasa-tlx': 'orange',
    'sart': 'deep-blue',
    'post-test': 'purple',
    'post-form': 'teal',
    'no-answer': 'grey'
  }
  return colors[type] || 'primary'
}

const viewTasks = () => {
  const testType = props.test?.testType === 'USER_MODERATED' ? 'moderated' : 'unmoderated'
  router.push(`/userTest/${testType}/answer/${props.test.id}#tasks`)
}
</script>

<style scoped>
.tasks-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.tasks-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.tasks-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  position: relative;
  overflow: hidden;
}

.tasks-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  opacity: 0.1;
}

.icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(10px);
}
</style>