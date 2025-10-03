<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center pb-2">
      <v-icon class="mr-2" color="primary">mdi-cog</v-icon>
      Test Settings
    </v-card-title>
    
    <v-card-text class="pa-4">
      <div class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">Status</span>
          <v-chip 
            size="small" 
            :color="statusColor" 
            variant="outlined"
          >
            {{ test.status || 'Unknown' }}
          </v-chip>
        </div>
      </div>
      
      <div class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">Test Type</span>
          <v-chip size="small" color="info" variant="outlined">
            {{ testTypeDisplay }}
          </v-chip>
        </div>
      </div>
      
      <div class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">Visibility</span>
          <v-chip 
            size="small" 
            :color="test.isPublic ? 'success' : 'warning'" 
            variant="outlined"
          >
            {{ test.isPublic ? 'Public' : 'Private' }}
          </v-chip>
        </div>
      </div>
      
      <div v-if="test.endDate" class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">End Date</span>
          <v-chip 
            size="small" 
            :color="isExpired ? 'error' : 'success'" 
            variant="outlined"
          >
            {{ formattedEndDate }}
          </v-chip>
        </div>
      </div>
      
      <div class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">Created</span>
          <span class="text-caption text-medium-emphasis">
            {{ formattedCreatedDate }}
          </span>
        </div>
      </div>
      
      <!-- Recording Features -->
      <div v-if="hasRecordingFeatures" class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">Recording Features</div>
        <div class="d-flex flex-wrap gap-1">
          <v-chip
            v-if="hasScreenRecording"
            size="x-small"
            color="blue"
            variant="outlined"
          >
            <v-icon start size="12">mdi-monitor-screenshot</v-icon>
            Screen
          </v-chip>
          <v-chip
            v-if="hasVideoRecording"
            size="x-small"
            color="green"
            variant="outlined"
          >
            <v-icon start size="12">mdi-camera</v-icon>
            Video
          </v-chip>
          <v-chip
            v-if="hasAudioRecording"
            size="x-small"
            color="orange"
            variant="outlined"
          >
            <v-icon start size="12">mdi-microphone</v-icon>
            Audio
          </v-chip>
          <v-chip
            v-if="hasEyeTracking"
            size="x-small"
            color="purple"
            variant="outlined"
          >
            <v-icon start size="12">mdi-eye</v-icon>
            Eye Tracking
          </v-chip>
        </div>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer />
      <v-btn 
        variant="text" 
        size="small" 
        color="primary"
        @click="editSettings"
      >
        Edit Settings
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

const statusColor = computed(() => {
  switch (props.test?.status) {
    case 'active': return 'success'
    case 'draft': return 'warning'
    case 'finished': return 'info'
    case 'paused': return 'orange'
    default: return 'grey'
  }
})

const testTypeDisplay = computed(() => {
  switch (props.test?.testType) {
    case 'USER': return 'Unmoderated'
    case 'USER_MODERATED': return 'Moderated'
    default: return 'User Test'
  }
})

const isExpired = computed(() => {
  if (!props.test?.endDate) return false
  return new Date(props.test.endDate) < new Date()
})

const formattedEndDate = computed(() => {
  if (!props.test?.endDate) return 'No end date'
  return new Date(props.test.endDate).toLocaleDateString()
})

const formattedCreatedDate = computed(() => {
  if (!props.test?.createdAt) return 'Unknown'
  return new Date(props.test.createdAt).toLocaleDateString()
})

const userTasks = computed(() => props.test?.testStructure?.userTasks || [])

const hasScreenRecording = computed(() => 
  userTasks.value.some(task => task.hasScreenRecord)
)

const hasVideoRecording = computed(() => 
  userTasks.value.some(task => task.hasCamRecord)
)

const hasAudioRecording = computed(() => 
  userTasks.value.some(task => task.hasAudioRecord)
)

const hasEyeTracking = computed(() => 
  userTasks.value.some(task => task.hasEye)
)

const hasRecordingFeatures = computed(() => 
  hasScreenRecording.value || hasVideoRecording.value || hasAudioRecording.value || hasEyeTracking.value
)

const editSettings = () => {
  const testType = props.test?.testType === 'USER_MODERATED' ? 'moderated' : 'unmoderated'
  router.push(`/userTest/${testType}/edit/${props.test.id}`)
}
</script>