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
        <!-- <v-chip
          size="small"
          color="rgba(255,255,255,0.2)"
          variant="outlined"
          class="border-white text-white"
        >
          <v-icon start size="16">mdi-flask</v-icon>
          {{ t('manager.storage.beta') }}
        </v-chip> -->
      </div>
    </div>

    <v-card-text class="pa-4">
      <div class="mb-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">{{
            t('manager.storage.storageUsed')
          }}</span>
          <span class="text-body-2 font-weight-bold">
            <v-progress-circular
              v-if="loading"
              indeterminate
              color="primary"
              size="16"
              width="2"
              class="mr-1"
            />
            <span v-else>{{ storageUsedFormatted }}</span>
          </span>
        </div>
        <v-progress-linear
          :model-value="storagePercentage"
          :color="storageColor"
          height="8"
          rounded
          :indeterminate="loading"
        />
        <div class="text-caption text-medium-emphasis mt-1">
          <!-- {{
            t('manager.storage.storageQuota', {
              used: storageUsedFormatted,
              quota: storageQuotaFormatted,
            })
          }} -->
          {{ storageUsedFormatted }}
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
        :disabled="loading || !canManageStorage"
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
import { useStore } from 'vuex'
import { useStorageFiles } from '@/shared/composables/useStorageFiles'
import {
  STUDY_CAPABILITY,
  hasStudyCapability,
} from '@/shared/utils/studyAccessPolicy'

const props = defineProps({
  test: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const store = useStore()
const { t } = useI18n()

// Use the storage files composable to calculate sizes dynamically
const {
  loading,
  filteredFiles,
  accountUsedBytes,
  typeBreakdown,
  storageQuotaBytes,
} = useStorageFiles()

// Read answers from the centralized Answer Vuex store getter
const answers = computed(() => store.getters.allAnswersList)

const totalMediaFiles = computed(() => filteredFiles.value.length)

const webcamBreakdown = computed(
  () =>
    typeBreakdown.value.find((b) => b.type === 'webcam') || {
      count: 0,
      size: 0,
    },
)
const audioBreakdown = computed(
  () =>
    typeBreakdown.value.find((b) => b.type === 'audio') || {
      count: 0,
      size: 0,
    },
)
const screenBreakdown = computed(
  () =>
    typeBreakdown.value.find((b) => b.type === 'screen') || {
      count: 0,
      size: 0,
    },
)

const videoCount = computed(() => webcamBreakdown.value.count)
const videoSizeFormatted = computed(() =>
  formatBytes(webcamBreakdown.value.size),
)

const audioCount = computed(() => audioBreakdown.value.count)
const audioSizeFormatted = computed(() =>
  formatBytes(audioBreakdown.value.size),
)

const screenCount = computed(() => screenBreakdown.value.count)
const screenSizeFormatted = computed(() =>
  formatBytes(screenBreakdown.value.size),
)

// Estimations for response/analytics data size
const responseDataSize = computed(() => {
  const avgResponseSize = 10 * 1024 // 10KB per response
  return formatBytes(answers.value.length * avgResponseSize)
})

const analyticsDataSize = computed(() => {
  const estimatedAnalyticsSize = answers.value.length * 5 * 1024 // 5KB per answer
  return formatBytes(estimatedAnalyticsSize)
})

// mediaDataSize is the actual sum of all media files
const mediaDataSize = computed(() => formatBytes(accountUsedBytes.value))

// estimatedStorageUsed is a hybrid of actual media file sizes and estimated response/analytics document sizes
const estimatedStorageUsed = computed(() => {
  const avgResponseSize = 10 * 1024
  const responseStorage = answers.value.length * avgResponseSize
  const estimatedAnalyticsSize = answers.value.length * 5 * 1024
  return accountUsedBytes.value + responseStorage + estimatedAnalyticsSize
})

const storagePercentage = computed(() => {
  return Math.min((estimatedStorageUsed.value / storageQuotaBytes) * 100, 100)
})

const storageColor = computed(() => {
  if (storagePercentage.value > 90) return 'error'
  if (storagePercentage.value > 75) return 'warning'
  return 'success'
})

const storageUsedFormatted = computed(() =>
  formatBytes(estimatedStorageUsed.value),
)
// const storageQuotaFormatted = computed(() => formatBytes(storageQuotaBytes))

const canManageStorage = computed(() => {
  return hasStudyCapability(
    props.test,
    store.getters.user,
    STUDY_CAPABILITY.STORAGE_ACCESS,
  )
})

const manageStorage = () => {
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
