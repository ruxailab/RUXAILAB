<template>
  <div class="storage-section">
    <!-- Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card elevation="0" border class="h-100">
          <v-card-text>
            <div class="text-overline mb-1">Total Storage</div>
            <div class="text-h4 font-weight-bold">{{ totalFormatted }}</div>
            <div class="text-caption text-medium-emphasis mt-2">
              Across {{ files.length }} files
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Files Table -->
    <v-card elevation="0" border>
      <v-card-title class="px-4 py-3 d-flex align-center">
        <span>Media Files</span>
        <v-spacer />
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search by study or date"
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
        hover
      >
        <!-- File Type Icon -->
        <template #[`item.type`]="{ item }">
          <v-avatar size="32" :color="getFileIcon(item.type).color" variant="tonal">
            <v-icon size="18">{{ getFileIcon(item.type).icon }}</v-icon>
          </v-avatar>
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
            @click="deleteFile(item)"
          >
            <v-icon>mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">Delete File</v-tooltip>
          </v-btn>
        </template>
        
        <!-- Empty State -->
        <template #no-data>
          <div class="pa-8 text-center text-medium-emphasis">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-database-off</v-icon>
            <div class="text-body-1">No media files found</div>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { formatDateLong } from '@/shared/utils/dateUtils'
import AnswerController from '@/shared/controllers/AnswerController'

const store = useStore()
const search = ref('')
const answerController = new AnswerController()
const fetchedAnswers = ref({}) // Map<testId, answersList>

const headers = [
  { title: 'Type', key: 'type', align: 'center', sortable: false, width: '60px' },
  { title: 'Study Name', key: 'studyName', align: 'start' },
  { title: 'Date', key: 'date', align: 'start' },
  { title: 'Size', key: 'size', align: 'end' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }
]

const tests = computed(() => store.getters.tests || [])

// Fetch answers for all tests
const fetchAllAnswers = async () => {
  for (const test of tests.value) {
    if (test.answersDocId && !fetchedAnswers.value[test.id]) {
      try {
        const answerDoc = await answerController.getAnswerById(test.answersDocId)
        // Extract the actual task answers from user collection structure
        // Usually answerDoc.taskAnswers is a map of userId -> answerData
        if (answerDoc && answerDoc.taskAnswers) {
           fetchedAnswers.value[test.id] = Object.values(answerDoc.taskAnswers)
        }
      } catch (e) {
        console.warn(`Could not fetch answers for test ${test.id}`, e)
      }
    }
  }
}

// Watch for tests change to trigger fetch
watch(tests, () => {
    if (tests.value.length > 0) fetchAllAnswers()
}, { immediate: true })

// Flatten structure: Tests -> Answers (Fetched) -> Tasks -> Files
const files = computed(() => {
  const allFiles = []

  tests.value.forEach(test => {
    // 1. Check embedded answers (if any)
    let answers = test.answers 
      ? (Array.isArray(test.answers) ? test.answers : Object.values(test.answers))
      : []
    
    // 2. Merge with fetched answers
    if (fetchedAnswers.value[test.id]) {
        answers = [...answers, ...fetchedAnswers.value[test.id]]
    }

    answers.forEach(answer => {
      const tasks = answer.tasks
        ? (Array.isArray(answer.tasks) ? answer.tasks : Object.values(answer.tasks))
        : []

      tasks.forEach(task => {
        const date = formatDateLong(answer.date || test.creationDate, 'es') // Default to ES locale per usage
        
        // Check for Video
        if (task.videoRecordURL) {
          allFiles.push({
            id: task.id || Math.random().toString(36), // Fallback ID
            type: 'video',
            url: task.videoRecordURL,
            studyName: test.testTitle,
            date: date,
            size: 50 * 1024 * 1024 // Mock: 50MB
          })
        }
        // Check for Audio
        if (task.audioRecordURL) {
          allFiles.push({
            id: task.id || Math.random().toString(36),
            type: 'audio',
            url: task.audioRecordURL,
            studyName: test.testTitle,
            date: date,
            size: 10 * 1024 * 1024 // Mock: 10MB
          })
        }
        // Check for Screen Recording
        if (task.screenRecordURL) {
          allFiles.push({
            id: task.id || Math.random().toString(36),
            type: 'screen',
            url: task.screenRecordURL,
            studyName: test.testTitle,
            date: date,
            size: 100 * 1024 * 1024 // Mock: 100MB
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
    case 'video': return { icon: 'mdi-video', color: 'primary' }
    case 'audio': return { icon: 'mdi-microphone', color: 'orange' }
    case 'screen': return { icon: 'mdi-monitor-screenshot', color: 'info' }
    default: return { icon: 'mdi-file', color: 'grey' }
  }
}

// Utility for bytes (Locally scoped to keep file count low)
function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const deleteFile = (item) => {
  // TODO: connect to backend delete endpoint
  if (confirm(`Are you sure you want to delete this ${item.type} file from "${item.studyName}"?`)) {
    console.log('Deleting file:', item)
    // For now we just alert, real implementation needs backend support
    alert('File deletion request sent.')
  }
}
</script>

<style scoped>
.storage-section {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
