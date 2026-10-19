<template>
  <v-card class="queue-jobs-card" elevation="2">
    <div class="queue-jobs-header pa-4">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div class="d-flex align-center">
          <div class="icon-container mr-3">
            <v-icon color="white" size="24">mdi-progress-clock</v-icon>
          </div>
          <div>
            <h3 class="text-h6 text-white mb-0">
              {{ t('manager.queueJobs.title') }}
            </h3>
            <p class="text-body-2 text-white opacity-90 mb-0">
              {{ t('manager.queueJobs.subtitle') }}
            </p>
          </div>
        </div>
        <v-chip
          size="small"
          color="rgba(255,255,255,0.2)"
          variant="outlined"
          class="border-white text-white"
        >
          <v-icon start size="16">mdi-access-point</v-icon>
          {{ t('manager.queueJobs.live') }}
        </v-chip>
      </div>
    </div>

    <v-card-text class="pa-4">
      <v-alert
        v-if="loadError"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ t('manager.queueJobs.loadError') }}
      </v-alert>

      <div v-if="loading" class="d-flex justify-center py-8">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <template v-else>
      <div class="mb-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">{{ t('manager.queueJobs.overall') }}</span>
          <span class="text-body-2 font-weight-bold">{{ completionRate }}%</span>
        </div>
        <v-progress-linear
          :model-value="completionRate"
          color="primary"
          height="8"
          rounded
        />
        <div class="text-caption text-medium-emphasis mt-1">
          {{
            t('manager.queueJobs.settledCount', {
              settled: settledCount,
              total: jobs.length,
            })
          }}
        </div>
      </div>

      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-chip
          v-for="item in statusSummary"
          :key="item.status"
          size="small"
          :color="statusColor(item.status)"
          :variant="activeFilter === item.status ? 'flat' : 'outlined'"
          class="status-filter"
          @click="toggleFilter(item.status)"
        >
          {{ t(`manager.queueJobs.status.${item.status}`) }}
          <span class="ml-1 font-weight-bold">{{ item.count }}</span>
        </v-chip>
      </div>

      <v-table density="comfortable" class="queue-jobs-table">
        <thead>
          <tr>
            <th>{{ t('manager.queueJobs.columns.type') }}</th>
            <th>{{ t('manager.queueJobs.columns.participant') }}</th>
            <th>{{ t('manager.queueJobs.columns.task') }}</th>
            <th>{{ t('manager.queueJobs.columns.updated') }}</th>
            <th>{{ t('manager.queueJobs.columns.status') }}</th>
            <th class="progress-col">
              {{ t('manager.queueJobs.columns.progress') }}
            </th>
            <th class="text-end">
              {{ t('manager.queueJobs.columns.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in visibleJobs" :key="job.id">
            <td>
              <div class="d-flex align-center">
                <v-icon size="18" class="mr-2" :color="typeColor(job.type)">
                  {{ typeIcon(job.type) }}
                </v-icon>
                <span>{{ t(`manager.queueJobs.types.${job.type}`) }}</span>
              </div>
            </td>
            <td>{{ participantLabel(job) }}</td>
            <td>{{ taskLabel(job) }}</td>
            <td>{{ formatUpdatedAt(job.updatedAt) }}</td>
            <td>
              <v-chip
                size="small"
                :color="statusColor(job.status)"
                variant="tonal"
              >
                {{ t(`manager.queueJobs.status.${job.status}`) }}
              </v-chip>
              <div
                v-if="job.error"
                class="text-caption text-error mt-1 job-error"
              >
                {{ job.error }}
              </div>
            </td>
            <td>
              <div class="d-flex align-center ga-2">
                <v-progress-linear
                  :model-value="job.progress"
                  :indeterminate="
                    job.status === 'processing' && job.progress === 0
                  "
                  :color="statusColor(job.status)"
                  height="6"
                  rounded
                  class="flex-grow-1"
                />
                <span class="text-caption text-medium-emphasis progress-label">
                  {{
                    job.status === 'missing'
                      ? t('manager.queueJobs.notApplicable')
                      : `${job.progress}%`
                  }}
                </span>
              </div>
            </td>
            <td class="text-end">
              <v-tooltip
                v-if="
                  job.status !== 'done' &&
                  job.status !== 'failed' &&
                  job.status !== 'processing'
                "
                location="top"
              >
                <template #activator="{ props: tooltipProps }">
                  <span v-bind="tooltipProps" class="d-inline-block">
                    <v-btn
                      icon="mdi-delete-outline"
                      size="small"
                      variant="text"
                      color="error"
                      :disabled="job.status === 'missing'"
                      :aria-label="t('manager.queueJobs.remove')"
                      @click="askRemove(job)"
                    />
                  </span>
                </template>
                {{ t('manager.queueJobs.remove') }}
              </v-tooltip>
            </td>
          </tr>
          <tr v-if="!loading && visibleJobs.length === 0">
            <td colspan="7" class="text-center text-medium-emphasis py-6">
              {{
                activeFilter
                  ? t('manager.queueJobs.emptyFilter')
                  : t('manager.queueJobs.empty')
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <p
        v-if="filteredJobs.length > visibleJobs.length"
        class="text-caption text-medium-emphasis mt-2 mb-0"
      >
        {{ t('manager.queueJobs.latestOnly', { count: visibleJobs.length }) }}
      </p>
      </template>
    </v-card-text>

    <ConfirmDialog
      v-model:show="removeDialog"
      :title="t('manager.queueJobs.removeDialog.title')"
      :message="
        t('manager.queueJobs.removeDialog.message', {
          type: pendingJob
            ? t(`manager.queueJobs.types.${pendingJob.type}`)
            : '',
          participant: pendingJob?.participant || pendingJob?.userDocId || '',
        })
      "
      :confirm-text="t('manager.queueJobs.remove')"
      :cancel-text="t('buttons.cancel')"
      confirm-color="error"
      confirm-icon="mdi-delete"
      icon="mdi-delete-outline"
      icon-color="error"
      type="error"
      :loading="removing"
      @confirm="confirmRemove"
    >
      <template #content>
        <v-alert
          v-if="removeError"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
        >
          {{ removeError }}
        </v-alert>
      </template>
    </ConfirmDialog>
  </v-card>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { buildStudyQueueRows } from '@/app/services/jobs/buildStudyQueueRows'
import { cancelQueuedJob } from '@/app/services/jobs/cancelQueuedJob'
import { watchStudyJobs } from '@/app/services/jobs/watchStudyJobs'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'

const { t, locale } = useI18n()
const store = useStore()

const test = computed(() => store.getters.test)
const taskAnswers = computed(
  () => store.getters.testAnswerDocument?.taskAnswers || {},
)
const storedJobs = ref([])
const loading = ref(false)
const loadError = ref(false)
const activeFilter = ref(null)
const removeDialog = ref(false)
const pendingJob = ref(null)
const removing = ref(false)
const removeError = ref('')

let stopWatch = null

const jobs = computed(() =>
  buildStudyQueueRows({
    jobs: storedJobs.value,
    taskAnswers: taskAnswers.value,
    userTasks: test.value?.testStructure?.userTasks || [],
  }),
)

watch(
  () => test.value?.id,
  (studyId) => {
    if (stopWatch) {
      stopWatch()
      stopWatch = null
    }
    storedJobs.value = []
    loadError.value = false
    if (!studyId) {
      loading.value = false
      return
    }
    loading.value = true
    stopWatch = watchStudyJobs(
      studyId,
      (nextJobs) => {
        storedJobs.value = nextJobs
        loading.value = false
        loadError.value = false
      },
      () => {
        loading.value = false
        loadError.value = true
      },
    )
  },
  { immediate: true },
)

onUnmounted(() => {
  if (stopWatch) stopWatch()
})

const STATUS_ORDER = ['queued', 'processing', 'done', 'failed']

const statusSummary = computed(() =>
  STATUS_ORDER.map((status) => ({
    status,
    count: jobs.value.filter((job) => job.status === status).length,
  })),
)

const settledCount = computed(
  () => jobs.value.filter((job) => job.status === 'done').length,
)

const completionRate = computed(() => {
  if (jobs.value.length === 0) return 0
  return Math.round((settledCount.value / jobs.value.length) * 100)
})

const LATEST_ROWS = 10

const filteredJobs = computed(() => {
  if (!activeFilter.value) return jobs.value
  return jobs.value.filter((job) => job.status === activeFilter.value)
})

const visibleJobs = computed(() => filteredJobs.value.slice(0, LATEST_ROWS))

const toggleFilter = (status) => {
  activeFilter.value = activeFilter.value === status ? null : status
}

const statusColor = (status) => {
  const colors = {
    queued: 'info',
    processing: 'warning',
    done: 'success',
    failed: 'error',
    missing: 'grey',
  }
  return colors[status] || 'primary'
}

const typeIcon = (type) => {
  const icons = {
    transcription: 'mdi-text-recognition',
    facialSentiment: 'mdi-emoticon-outline',
    textSentiment: 'mdi-message-text-outline',
  }
  return icons[type] || 'mdi-progress-clock'
}

const typeColor = (type) => {
  const colors = {
    transcription: 'primary',
    facialSentiment: 'deep-purple',
    textSentiment: 'teal',
  }
  return colors[type] || 'primary'
}

const participantLabel = (job) =>
  job.participant || job.userDocId || t('manager.queueJobs.unknownParticipant')

const formatUpdatedAt = (value) => {
  if (!value) return t('manager.queueJobs.notApplicable')
  return new Date(value).toLocaleString(locale.value)
}

const taskLabel = (job) => {
  if (job.taskLabel) return job.taskLabel
  if (job.taskNumber) {
    return t('manager.queueJobs.taskFallback', { number: job.taskNumber })
  }
  return t('manager.queueJobs.unknownTask')
}

const askRemove = (job) => {
  if (job.status !== 'queued') return
  pendingJob.value = job
  removeError.value = ''
  removeDialog.value = true
}

const confirmRemove = async () => {
  if (!pendingJob.value || pendingJob.value.status !== 'queued') return
  removing.value = true
  removeError.value = ''
  try {
    await cancelQueuedJob({ jobId: pendingJob.value.id })
    removeDialog.value = false
    pendingJob.value = null
  } catch (err) {
    removeError.value =
      err?.message || t('manager.queueJobs.removeDialog.error')
  } finally {
    removing.value = false
  }
}
</script>

<style scoped>
.queue-jobs-card {
  overflow: hidden;
}

.queue-jobs-header {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
}

.icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
}

.status-filter {
  cursor: pointer;
}

.progress-col {
  min-width: 160px;
}

.progress-label {
  min-width: 36px;
  text-align: right;
}

.job-error {
  max-width: 220px;
}
</style>
