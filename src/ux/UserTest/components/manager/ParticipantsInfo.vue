<template>
  <v-card 
    class="h-100 participants-card"
    elevation="2"
  >
    <!-- Header with gradient background -->
    <div class="participants-header pa-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div class="icon-container mr-3">
            <v-icon color="white" size="24">mdi-account-group</v-icon>
          </div>
          <div>
            <h3 class="text-h6 text-white mb-0">Participants</h3>
            <p class="text-body-2 text-white opacity-90 mb-0">Test participation overview</p>
          </div>
        </div>
        <v-chip
          size="small"
          color="rgba(255,255,255,0.2)"
          variant="outlined"
          class="border-white text-white"
        >
          <v-icon start size="16">mdi-flask</v-icon>
          Beta
        </v-chip>
      </div>
    </div>
    
    <v-card-text class="pa-4">
      <!-- Clean Stats Grid -->
      <div class="stats-grid">
        <div class="stat-box stat-box-primary">
          <div class="stat-content">
            <div class="stat-number">{{ completedParticipants }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        
        <div class="stat-box stat-box-primary">
          <div class="stat-content">
            <div class="stat-number">{{ notStartedParticipants }}</div>
            <div class="stat-label">Not Started</div>
          </div>
        </div>
        
        <div class="stat-box stat-box-primary">
          <div class="stat-content">
            <div class="stat-number">{{ pendingInvitations.length }}</div>
            <div class="stat-label">Pending Invites</div>
          </div>
        </div>
      </div>
      
      <!-- Simple Progress Bar -->
      <div class="mt-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">Overall Progress</span>
          <span class="text-body-2 font-weight-bold">{{ completionPercentage }}%</span>
        </div>
        <v-progress-linear 
          :model-value="completionPercentage" 
          :color="progressColor"
          height="6"
          rounded
          class="mb-2"
        />
        <div class="text-caption text-medium-emphasis text-center">
          {{ completedParticipants }} of {{ totalParticipants }} participants completed
        </div>
      </div>
    </v-card-text>
    
    <v-card-actions class="pa-3 pt-0">
      <v-spacer />
      <v-btn 
        variant="text" 
        color="primary"
        size="small"
        class="view-all-btn"
        @click="viewParticipants"
      >
        <v-icon start size="14">mdi-eye</v-icon>
        Details
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

// Get completed participants from answers
const completedAnswers = computed(() => {
  const testAnswers = props.test?.answers || []
  if (Array.isArray(testAnswers)) {
    return testAnswers.filter(answer => answer.submitted)
  } else if (typeof testAnswers === 'object' && testAnswers !== null) {
    return Object.values(testAnswers).filter(answer => answer.submitted)
  }
  return []
})

// Get cooperators
const cooperators = computed(() => {
  const testCooperators = props.test?.cooperators || []
  return Array.isArray(testCooperators) ? testCooperators : []
})

// Get accepted cooperators (who can potentially participate)
const acceptedCooperators = computed(() => {
  return cooperators.value.filter(coop => coop.accepted === true)
})

// Get pending invitations (cooperators who haven't accepted)
const pendingInvitations = computed(() => {
  return cooperators.value.filter(coop => coop.accepted === false)
})

const totalParticipants = computed(() => {
  // Total = accepted cooperators (who can participate)
  return acceptedCooperators.value.length
})

const completedParticipants = computed(() => {
  // Count completed answers
  return completedAnswers.value.length
})

const notStartedParticipants = computed(() => {
  // Accepted cooperators who haven't completed yet
  return acceptedCooperators.value.length - completedAnswers.value.length
})

const completionPercentage = computed(() => {
  if (totalParticipants.value === 0) return 0
  return Math.round((completedParticipants.value / totalParticipants.value) * 100)
})

const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return 'success'
  if (percentage >= 50) return 'warning'
  if (percentage >= 25) return 'orange'
  return 'error'
})

const progressColorClass = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return 'text-success'
  if (percentage >= 50) return 'text-warning'
  if (percentage >= 25) return 'text-orange'
  return 'text-error'
})



const viewParticipants = () => {
  // Navigate to participants/answers view
  const testType = props.test?.testType === 'USER_MODERATED' ? 'moderated' : 'unmoderated'
  router.push(`/userTest/${testType}/cooperators/${props.test.id}`)
}
</script>

<style scoped>
.participants-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.participants-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.participants-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  position: relative;
  overflow: hidden;
}

.participants-header::before {
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

/* Clean Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-box {
  border-radius: 12px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.stat-box-primary {
  background: rgba(var(--v-theme-primary), 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.stat-content {
  text-align: center;
  padding: 20px 16px;
  color: white;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  opacity: 0.9;
}

.view-all-btn {
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  transform: translateY(-1px);
}
</style>