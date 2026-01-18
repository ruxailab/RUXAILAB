<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
    persistent
    class="task-details-modal-dialog"
  >
    <v-card v-if="userSession" class="task-details-modal">
      <!-- Header -->
      <v-card-title
        class="modal-header d-flex align-center justify-space-between pa-6"
      >
        <div class="header-content">
          <h2 class="text-h5 font-weight-bold text-white mb-1">
            Task Details - {{ userSession.identifier }}
          </h2>
          <div class="text-body-1 text-white opacity-90">
            {{ userSession.fullName }}
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          size="large"
          class="close-btn"
          @click="closeModal"
        />
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- Summary Section -->
        <div class="pa-6 bg-grey-50">
          <div class="d-flex align-center justify-center gap-8 mb-4">
            <!-- Completed -->
            <div class="text-center">
              <div class="d-flex align-center justify-center mb-2">
                <v-icon color="success" size="24" class="mr-2">
                  mdi-check-circle
                </v-icon>
                <span class="text-h6 font-weight-bold text-success">{{
                  completedTasks
                }}</span>
              </div>
              <div class="text-body-2 text-grey-600">Completed</div>
            </div>

            <!-- Skipped -->
            <div class="text-center">
              <div class="d-flex align-center justify-center mb-2">
                <v-icon color="error" size="24" class="mr-2">
                  mdi-close-circle
                </v-icon>
                <span class="text-h6 font-weight-bold text-error">{{
                  skippedTasks
                }}</span>
              </div>
              <div class="text-body-2 text-grey-600">Skipped</div>
            </div>

            <!-- Average Time -->
            <div class="text-center">
              <div class="d-flex align-center justify-center mb-2">
                <v-icon color="primary" size="24" class="mr-2">
                  mdi-timer-outline
                </v-icon>
                <span class="text-h6 font-weight-bold text-primary">{{
                  averageTime
                }}</span>
              </div>
              <div class="text-body-2 text-grey-600">Avg Time</div>
            </div>
          </div>
        </div>

        <v-divider />

        <!-- Tasks Table -->
        <div class="pa-6">
          <h3 class="text-h6 font-weight-bold text-grey-800 mb-4">All Tasks</h3>

          <div class="tasks-table-container">
            <v-data-table
              :headers="[
                { title: 'Task Name', key: 'taskName', sortable: true },
                {
                  title: 'Status',
                  key: 'completed',
                  sortable: true,
                  width: '150px',
                },
                {
                  title: 'Time Taken',
                  key: 'taskTime',
                  sortable: true,
                  width: '120px',
                },
                {
                  title: 'Final Answer',
                  key: 'taskAnswer',
                  sortable: false,
                  width: '150px',
                },
                {
                  title: 'Observations',
                  key: 'taskObservations',
                  sortable: false,
                  width: '150px',
                },
              ]"
              :items="
                userSession?.tasks ? Object.values(userSession.tasks) : []
              "
              :items-per-page="10"
              class="elevation-0"
              hide-default-footer
            >
              <template #item.taskName="{ item }">
                <div class="font-weight-medium text-grey-800">
                  {{ item.taskName }}
                </div>
              </template>

              <template #item.completed="{ item }">
                <v-chip
                  :color="getStatusColor(item.completed)"
                  :prepend-icon="getStatusIcon(item.completed)"
                  size="small"
                  variant="tonal"
                >
                  {{ formatStatus(item.completed) }}
                </v-chip>
              </template>

              <template #item.taskTime="{ item }">
                <div class="font-weight-medium font-mono">
                  {{ formatDuration(item.taskTime) }}
                </div>
              </template>

              <template #item.taskAnswer="{ item }">
                <div
                  v-if="item.completed && item.taskAnswer"
                  class="final-answer"
                >
                  <v-chip
                    color="accent"
                    variant="tonal"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{ item.taskAnswer }}
                  </v-chip>
                </div>
                <div v-else class="text-grey-500 text-body-2">-</div>
              </template>

              <template #item.taskObservations="{ item }">
                <div
                  v-if="item.completed && item.taskObservations"
                  class="final-answer"
                >
                  <v-chip
                    color="accent"
                    variant="tonal"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{ item.taskObservations }}
                  </v-chip>
                </div>
                <div v-else class="text-grey-500 text-body-5">-</div>
              </template>
            </v-data-table>
          </div>
        </div>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions class="pa-6 pt-0 justify-center">
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          prepend-icon="mdi-check"
          class="px-8"
          @click="closeModal"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  userSession: Object,
})

const emit = defineEmits(['update:modelValue', 'close'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const closeModal = () => {
  emit('close')
}

const completedTasks = computed(() => {
  if (!props.userSession) return 0
  return Object.values(props.userSession.tasks || {}).filter(
    (task) => task.completed,
  ).length
})

const skippedTasks = computed(() => {
  if (!props.userSession) return 0
  return Object.values(props.userSession.tasks || {}).filter(
    (task) => !task.completed,
  ).length
})

const averageTime = computed(() => {
  if (!props.userSession) return '0s'
  const completed = Object.values(props.userSession.tasks || {}).filter(
    (task) => task.completed,
  )
  if (completed.length === 0) return '0s'

  const totalSeconds = completed.reduce((sum, task) => {
    const totalSeconds = Math.floor(task.taskTime / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return sum + (minutes * 60 + seconds)
  }, 0)

  const avgSeconds = Math.round(totalSeconds / completed.length)
  if (avgSeconds < 60) return `${avgSeconds}s`

  const minutes = Math.floor(avgSeconds / 60)
  const remainingSeconds = avgSeconds % 60
  return `${minutes}m ${remainingSeconds}s`
})

const getStatusColor = (status) => {
  switch (status) {
    case true:
      return 'success'
    case false:
      return 'grey'
    default:
      return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case true:
      return 'mdi-check-circle'
    case false:
      return 'mdi-pause-circle-outline'
    default:
      return 'mdi-help-circle-outline'
  }
}

const formatStatus = (status) => {
  switch (status) {
    case true:
      return 'Completed'
    case false:
      return 'Skipped'
    default:
      return status
  }
}

const formatDuration = (duration) => {
  const totalSeconds = Math.floor(duration / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (totalSeconds === 0) return '-'
  if (totalSeconds < 60) return `${totalSeconds}s`
  return `${minutes}m ${seconds}s`
}
</script>

<style scoped>
.task-details-modal {
  border-radius: 16px !important;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
}

.close-btn {
  flex-shrink: 0;
  margin-left: 16px;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.gap-8 {
  gap: 32px;
}

.tasks-table-container {
  max-height: 400px;
  overflow-y: auto;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
}

.final-answer {
  display: flex;
  align-items: center;
}

/* Data table customization */
:deep(.v-data-table) {
  background: transparent !important;
  border-radius: 8px !important;
  border: 1px solid #e5e7eb;
}

:deep(.v-data-table-header) {
  background: #f8fafc !important;
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: #374151 !important;
  border-bottom: 1px solid #e5e7eb !important;
}

:deep(.v-data-table__tr:hover) {
  background: #f8fafc !important;
}

:deep(.v-data-table__tr) {
  border-bottom: 1px solid #f1f5f9 !important;
}

/* Custom scrollbar */
.task-details-modal::-webkit-scrollbar,
.tasks-table-container::-webkit-scrollbar {
  width: 6px;
}

.task-details-modal::-webkit-scrollbar-track,
.tasks-table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.task-details-modal::-webkit-scrollbar-thumb,
.tasks-table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.task-details-modal::-webkit-scrollbar-thumb:hover,
.tasks-table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

:deep(.v-overlay--modal) {
  backdrop-filter: blur(4px);
}
</style>
