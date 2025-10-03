<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center pb-2">
      <v-icon class="mr-2" color="primary">mdi-clock-time-eight-outline</v-icon>
      Recent Activity
    </v-card-title>
    
    <v-card-text class="pa-4">
      <div v-if="recentActivities.length === 0" class="text-center text-medium-emphasis py-8">
        <v-icon size="48" color="grey-lighten-1">mdi-inbox-outline</v-icon>
        <div class="text-body-2 mt-2">No recent activity</div>
      </div>
      
      <div v-else>
        <div 
          v-for="(activity, index) in recentActivities" 
          :key="index"
          class="d-flex align-start mb-3"
          :class="{ 'mb-0': index === recentActivities.length - 1 }"
        >
          <v-avatar size="32" class="mr-3" :color="activity.color">
            <v-icon size="16" color="white">{{ activity.icon }}</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-body-2 font-weight-medium">{{ activity.title }}</div>
            <div class="text-caption text-medium-emphasis">{{ activity.subtitle }}</div>
            <div class="text-caption text-medium-emphasis">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </v-card-text>
    
    <v-card-actions v-if="recentActivities.length > 0">
      <v-spacer />
      <v-btn 
        variant="text" 
        size="small" 
        color="primary"
        @click="$emit('viewAll')"
      >
        View All
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  test: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['viewAll'])

const recentActivities = computed(() => {
  const answers = props.test?.answers || []
  const answersArray = Array.isArray(answers) ? answers : Object.values(answers)
  
  const activities = []
  
  // Get recent submissions
  answersArray
    .filter(answer => answer.submitted && answer.lastUpdate)
    .sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0))
    .slice(0, 5)
    .forEach(answer => {
      activities.push({
        title: `${answer.fullName || 'Anonymous User'} completed test`,
        subtitle: `Submitted test response`,
        time: formatTime(answer.lastUpdate),
        icon: 'mdi-check-circle',
        color: 'success'
      })
    })
  
  // Get recent starts
  answersArray
    .filter(answer => !answer.submitted && answer.progress > 0)
    .sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0))
    .slice(0, 3)
    .forEach(answer => {
      activities.push({
        title: `${answer.fullName || 'Anonymous User'} started test`,
        subtitle: `Progress: ${answer.progress || 0}%`,
        time: formatTime(answer.lastUpdate),
        icon: 'mdi-play-circle',
        color: 'primary'
      })
    })
  
  return activities
    .sort((a, b) => new Date(b.rawTime || 0) - new Date(a.rawTime || 0))
    .slice(0, 5)
})

function formatTime(timestamp) {
  if (!timestamp) return 'Unknown time'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString()
}
</script>