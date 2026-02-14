<template>
  <div class="storage-section">
    <!-- Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card elevation="0" border class="h-100">
          <v-card-text>
            <div class="text-overline mb-1">
              {{ t('storage.totalStorage') }}
            </div>
            <div class="text-h4 font-weight-bold">{{ totalFormatted }}</div>
            <div class="text-caption text-medium-emphasis mt-2">
              {{ t('storage.acrossFiles', { count: files.length }) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Files Table -->
    <v-card elevation="0" border>
      <v-card-title class="px-4 py-3 d-flex align-center">
        <span>{{ t('storage.mediaFiles') }}</span>
        <v-spacer />
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          :label="t('storage.searchByStudyOrDate')"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 300px"
        />
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="files"
        :search="search"
        :items-per-page-text="t('common.table.itemsPerPage')"
        hover
      >
        <!-- File Type Icon -->
        <template #[`item.type`]="{ item }">
          <v-avatar
            size="32"
            :color="getFileIcon(item.type).color"
            variant="tonal"
          >
            <v-icon size="18">{{ getFileIcon(item.type).icon }}</v-icon>
          </v-avatar>
        </template>

        <!-- Study Name (clickable for preview) -->
        <template #[`item.studyName`]="{ item }">
          <a
            href="#"
            class="text-decoration-none text-high-emphasis font-weight-medium"
            @click.prevent="openPreview(item)"
          >
            {{ item.studyName }}
          </a>
        </template>

        <!-- Size -->
        <template #[`item.size`]="{ item }">
          {{ formatBytes(item.size) }}
        </template>

        <!-- Actions -->
        <template #[`item.actions`]="{ item }">
          <v-btn
            icon
            variant="text"
            color="error"
            size="small"
            @click="confirmDelete(item)"
          >
            <v-icon>mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">{{
              t('storage.deleteFile')
            }}</v-tooltip>
          </v-btn>
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div v-if="search" class="pa-8 text-center text-medium-emphasis">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">
              mdi-magnify-remove-outline
            </v-icon>
            <div class="text-h6 mt-2">
              {{ t('common.table.noSearchResults') }}
            </div>
            <div class="text-body-2">
              {{ t('common.table.tryAdjustingSearch') }}
            </div>
          </div>
          <div v-else class="pa-8 text-center text-medium-emphasis">
            <v-icon size="48" color="grey-lighten-1" class="mb-2"
              >mdi-database-off</v-icon
            >
            <div class="text-body-1">{{ t('storage.noMediaFiles') }}</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card class="rounded-lg">
        <v-card-title class="bg-error text-white">
          <v-icon color="white" class="mr-2">mdi-alert</v-icon>
          {{ t('storage.confirmDeletion') }}
        </v-card-title>
        <v-card-text class="pt-4">
          {{
            t('storage.deleteConfirmMessage', {
              type: fileToDelete?.type,
              studyName: fileToDelete?.studyName,
            })
          }}
          <div class="text-caption text-medium-emphasis mt-2">
            {{ t('storage.actionCannotBeUndone') }}
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            class="rounded-lg"
            @click="deleteDialog = false"
            >{{ t('common.cancel') }}</v-btn
          >
          <v-btn color="error" class="rounded-lg" @click="executeDelete">{{
            t('buttons.delete')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Media Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="900">
      <v-card class="rounded-lg">
        <v-card-title class="bg-primary text-white d-flex align-center">
          <v-icon color="white" class="mr-2">{{
            getFileIcon(previewFile?.type).icon
          }}</v-icon>
          {{ previewFile?.studyName }} - {{ previewFile?.type }}
        </v-card-title>
        <v-card-text
          class="pa-4 bg-black d-flex justify-center align-center"
          style="min-height: 300px"
        >
          <video
            v-if="['video', 'webcam', 'screen'].includes(previewFile?.type)"
            :src="previewFile?.url"
            controls
            style="width: 100%; max-height: 600px"
          />
          <audio
            v-else-if="previewFile?.type === 'audio'"
            :src="previewFile?.url"
            controls
            style="width: 100%"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            class="rounded-lg"
            @click="previewDialog = false"
            >{{ t('buttons.close') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { formatDateLong } from '@/shared/utils/dateUtils'
import AnswerController from '@/shared/controllers/AnswerController'

const store = useStore()
const { t } = useI18n()
const search = ref('')
const answerController = new AnswerController()
const fetchedAnswers = ref({}) // Map<testId, answersList>

// Dialog State
const deleteDialog = ref(false)
const fileToDelete = ref(null)
const previewDialog = ref(false)
const previewFile = ref(null)

const headers = computed(() => [
  {
    title: t('storage.headers.type'),
    key: 'type',
    align: 'center',
    sortable: false,
    width: '60px',
  },
  { title: t('storage.headers.studyName'), key: 'studyName', align: 'start' },
  { title: t('storage.headers.date'), key: 'date', align: 'start' },
  { title: t('storage.headers.size'), key: 'size', align: 'end' },
  {
    title: t('storage.headers.actions'),
    key: 'actions',
    align: 'end',
    sortable: false,
  },
])

const tests = computed(() => store.getters.tests || [])

// Fetch answers for all tests
const fetchAllAnswers = async () => {
  for (const test of tests.value) {
    if (test.answersDocId && !fetchedAnswers.value[test.id]) {
      try {
        const answerDoc = await answerController.getAnswerById(
          test.answersDocId,
        )
        if (answerDoc && answerDoc.taskAnswers) {
          fetchedAnswers.value[test.id] = Object.values(answerDoc.taskAnswers)
        }
      } catch {
        // Error handling: Could not fetch answers for test
      }
    }
  }
}

// Watch for tests change to trigger fetch
watch(
  tests,
  () => {
    if (tests.value.length > 0) fetchAllAnswers()
  },
  { immediate: true },
)

// Flatten structure: Tests -> Answers (Fetched) -> Tasks -> Files
const files = computed(() => {
  const allFiles = []

  tests.value.forEach((test) => {
    // 1. Check embedded answers (if any)
    let answers = test.answers
      ? Array.isArray(test.answers)
        ? test.answers
        : Object.values(test.answers)
      : []

    // 2. Merge with fetched answers
    if (fetchedAnswers.value[test.id]) {
      answers = [...answers, ...fetchedAnswers.value[test.id]]
    }

    answers.forEach((answer) => {
      const tasks = answer.tasks
        ? Array.isArray(answer.tasks)
          ? answer.tasks
          : Object.values(answer.tasks)
        : []

      tasks.forEach((task) => {
        const date = formatDateLong(answer.date || test.creationDate, 'es') // Default to ES locale per usage

        // Common file properties
        const baseFile = {
          id: task.id || self.crypto.randomUUID(),
          studyName: test.testTitle,
          date: date,
        }

        // Check for Video
        if (task.videoRecordURL) {
          allFiles.push({
            ...baseFile,
            type: 'video',
            url: task.videoRecordURL,
            size: task.webcamSize || 50 * 1024 * 1024,
          })
        }
        // Check for Audio
        if (task.audioRecordURL) {
          allFiles.push({
            ...baseFile,
            type: 'audio',
            url: task.audioRecordURL,
            size: task.audioSize || 10 * 1024 * 1024,
          })
        }
        // Check for Screen Recording
        if (task.screenRecordURL) {
          allFiles.push({
            ...baseFile,
            type: 'screen',
            url: task.screenRecordURL,
            size: task.screenSize || 100 * 1024 * 1024,
          })
        }
        // Check for Webcam (Fix for missing icons)
        if (task.webcamRecordURL) {
          allFiles.push({
            ...baseFile,
            type: 'webcam',
            url: task.webcamRecordURL,
            size: task.webcamSize || 50 * 1024 * 1024,
          })
        }
      })
    })
  })

  return allFiles
})

const totalFormatted = computed(() => {
  const total = files.value.reduce((acc, file) => acc + file.size, 0)
  return formatBytes(total)
})

const getFileIcon = (type) => {
  switch (type) {
    case 'video':
      return { icon: 'mdi-video', color: 'primary' }
    case 'audio':
      return { icon: 'mdi-microphone', color: 'orange' }
    case 'screen':
      return { icon: 'mdi-monitor-screenshot', color: 'info' }
    case 'webcam':
      return { icon: 'mdi-webcam', color: 'success' }
    default:
      return { icon: 'mdi-file', color: 'grey' }
  }
}

// Utility for bytes
function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Dialog Actions
const confirmDelete = (item) => {
  fileToDelete.value = item
  deleteDialog.value = true
}

const executeDelete = () => {
  // Mock delete for now (backend coming in PR #2)
  // Delete file implementation pending backend
  deleteDialog.value = false
  fileToDelete.value = null
}

const openPreview = (item) => {
  previewFile.value = item
  previewDialog.value = true
}
</script>

<style scoped>
.storage-section {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
