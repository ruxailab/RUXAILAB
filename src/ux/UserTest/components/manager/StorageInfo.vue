<template>
  <v-card class="h-100 storage-card" elevation="2">
    <!-- Header with gradient background -->
    <div class="storage-header pa-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div class="icon-container mr-3">
            <v-icon color="white" size="24">mdi-database</v-icon>
          </div>
          <div>
            <h3 class="text-h6 text-white mb-0">
              {{ t('manager.storage.title') }}
            </h3>
            <p class="text-body-2 text-white opacity-90 mb-0">
              {{ t('manager.storage.subtitle') }}
            </p>
          </div>
        </div>
        <v-chip
          size="small"
          color="rgba(255,255,255,0.2)"
          variant="outlined"
          class="border-white text-white"
        >
          <v-icon start size="16">mdi-flask</v-icon>
          {{ t('manager.storage.beta') }}
        </v-chip>
      </div>
    </div>

    <v-card-text class="pa-4">
      <div class="mb-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">{{
            t('manager.storage.storageUsed')
          }}</span>
          <span class="text-body-2 font-weight-bold">{{
            storageUsedFormatted
          }}</span>
        </div>
        <v-progress-linear
          :model-value="storagePercentage"
          :color="storageColor"
          height="8"
          rounded
        />
        <div class="text-caption text-medium-emphasis mt-1">
          {{
            t('manager.storage.storageQuota', {
              used: storageUsedFormatted,
              quota: storageQuotaFormatted,
            })
          }}
        </div>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">{{ t('manager.storage.mediaFiles') }}</span>
          <v-chip size="small" color="primary" variant="outlined">
            {{ totalMediaFiles }}
          </v-chip>
        </div>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">{{
            t('manager.storage.videoRecordings')
          }}</span>
          <v-chip size="small" color="success" variant="outlined">
            {{ videoCount }} ({{ videoSizeFormatted }})
          </v-chip>
        </div>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">{{
            t('manager.storage.audioRecordings')
          }}</span>
          <v-chip size="small" color="warning" variant="outlined">
            {{ audioCount }} ({{ audioSizeFormatted }})
          </v-chip>
        </div>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">{{
            t('manager.storage.screenRecordings')
          }}</span>
          <v-chip size="small" color="info" variant="outlined">
            {{ screenCount }} ({{ screenSizeFormatted }})
          </v-chip>
        </div>
      </div>

      <!-- Storage breakdown -->
      <div class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">
          {{ t('manager.storage.storageBreakdown') }}
        </div>
        <div class="d-flex flex-column gap-1">
          <div class="d-flex justify-space-between text-caption">
            <span>{{ t('manager.storage.responsesData') }}</span>
            <span>{{ responseDataSize }}</span>
          </div>
          <div class="d-flex justify-space-between text-caption">
            <span>{{ t('manager.storage.mediaFiles') }}</span>
            <span>{{ mediaDataSize }}</span>
          </div>
          <div class="d-flex justify-space-between text-caption">
            <span>{{ t('manager.storage.analyticsData') }}</span>
            <span>{{ analyticsDataSize }}</span>
          </div>
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn
        variant="text"
        size="small"
        color="primary"
        disabled
        @click="manageStorage"
      >
        {{ t('manager.storage.manageStorage') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatBytes } from '@/shared/utils/formatUtils'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  test: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const { t } = useI18n()

// Storage quota (in bytes) - you can make this configurable
const STORAGE_QUOTA = 5 * 1024 * 1024 * 1024 // 5GB default

const answers = computed(() => {
  const testAnswers = props.test?.answers || []
  return Array.isArray(testAnswers) ? testAnswers : Object.values(testAnswers)
})

const totalMediaFiles = computed(() => {
  let count = 0
  answers.value.forEach((answer) => {
    const tasks = Array.isArray(answer.tasks)
      ? answer.tasks
      : Object.values(answer.tasks || {})
    tasks.forEach((task) => {
      if (task.audioRecordURL) count++
      if (task.webcamRecordURL) count++
      if (task.screenRecordURL) count++
    })
  })
  return count
})

const videoCount = computed(() => {
  let count = 0
  answers.value.forEach((answer) => {
    const tasks = Array.isArray(answer.tasks)
      ? answer.tasks
      : Object.values(answer.tasks || {})
    tasks.forEach((task) => {
      if (task.webcamRecordURL) count++
    })
  })
  return count
})

const audioCount = computed(() => {
  let count = 0
  answers.value.forEach((answer) => {
    const tasks = Array.isArray(answer.tasks)
      ? answer.tasks
      : Object.values(answer.tasks || {})
    tasks.forEach((task) => {
      if (task.audioRecordURL) count++
    })
  })
  return count
})

const screenCount = computed(() => {
  let count = 0
  answers.value.forEach((answer) => {
    const tasks = Array.isArray(answer.tasks)
      ? answer.tasks
      : Object.values(answer.tasks || {})
    tasks.forEach((task) => {
      if (task.screenRecordURL) count++
    })
  })
  return count
})

// Mock storage calculations - you can replace with real data
const estimatedStorageUsed = computed(() => {
  // Estimate based on file counts and average sizes
  const avgVideoSize = 50 * 1024 * 1024 // 50MB per video
  const avgAudioSize = 10 * 1024 * 1024 // 10MB per audio
  const avgScreenSize = 100 * 1024 * 1024 // 100MB per screen recording
  const avgResponseSize = 10 * 1024 // 10KB per response

  const videoStorage = videoCount.value * avgVideoSize
  const audioStorage = audioCount.value * avgAudioSize
  const screenStorage = screenCount.value * avgScreenSize
  const responseStorage = answers.value.length * avgResponseSize

  return videoStorage + audioStorage + screenStorage + responseStorage
})

const storagePercentage = computed(() => {
  return Math.min((estimatedStorageUsed.value / STORAGE_QUOTA) * 100, 100)
})

const storageColor = computed(() => {
  if (storagePercentage.value > 90) return 'error'
  if (storagePercentage.value > 75) return 'warning'
  return 'success'
})

const storageUsedFormatted = computed(() =>
  formatBytes(estimatedStorageUsed.value),
)
const storageQuotaFormatted = computed(() => formatBytes(STORAGE_QUOTA))

const videoSizeFormatted = computed(() => {
  const avgVideoSize = 50 * 1024 * 1024
  return formatBytes(videoCount.value * avgVideoSize)
})

const audioSizeFormatted = computed(() => {
  const avgAudioSize = 10 * 1024 * 1024
  return formatBytes(audioCount.value * avgAudioSize)
})

const screenSizeFormatted = computed(() => {
  const avgScreenSize = 100 * 1024 * 1024
  return formatBytes(screenCount.value * avgScreenSize)
})

const responseDataSize = computed(() => {
  const avgResponseSize = 10 * 1024
  return formatBytes(answers.value.length * avgResponseSize)
})

const mediaDataSize = computed(() => {
  const avgVideoSize = 50 * 1024 * 1024
  const avgAudioSize = 10 * 1024 * 1024
  const avgScreenSize = 100 * 1024 * 1024

  const total =
    videoCount.value * avgVideoSize +
    audioCount.value * avgAudioSize +
    screenCount.value * avgScreenSize
  return formatBytes(total)
})

const analyticsDataSize = computed(() => {
  // Estimate analytics data size based on interactions
  const estimatedAnalyticsSize = answers.value.length * 5 * 1024 // 5KB per answer
  return formatBytes(estimatedAnalyticsSize)
})

const manageStorage = () => {
  // Navigate to storage management or show storage details
  const testType =
    props.test?.testType === 'USER_MODERATED' ? 'moderated' : 'unmoderated'
  router.push(`/userTest/${testType}/storage/${props.test.id}`)
}
</script>

<style scoped>
.storage-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.storage-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.storage-header {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  position: relative;
  overflow: hidden;
}

.storage-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  opacity: 0.1;
}

.icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(10px);
}
</style>
