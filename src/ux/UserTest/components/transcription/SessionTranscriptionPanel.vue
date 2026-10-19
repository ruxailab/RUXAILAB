<template>
  <v-card
    variant="outlined"
    elevation="2"
    rounded="xl"
    class="pa-4 overflow-y-auto"
  >
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" md="auto">
        <h3 class="text-h5 font-weight-bold mb-1">Transcription</h3>
        <div class="text-body-2 text-grey">
          Spoken dialogue captured from the task audio
        </div>
      </v-col>
      <v-spacer />
      <v-col v-if="hasResults" cols="auto" class="d-flex align-center ga-1">
        <v-btn
          icon="mdi-delete-outline"
          color="error"
          variant="text"
          :disabled="isTranscribing || deleting"
          :loading="deleting"
          title="Delete transcription"
          @click="confirmOpen = true"
        />
        <v-btn
          variant="outlined"
          :disabled="isTranscribing || !canTranscribe || deleting"
          :loading="isTranscribing"
          @click="retranscribe()"
        >
          <span class="sr-only">Re-transcribe audio</span>
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-chip
          :color="statusChipColor"
          variant="flat"
          append-icon="mdi-text-box-outline"
        >
          {{ statusLabel }}
        </v-chip>
      </v-col>
    </v-row>

    <v-row
      v-if="isLoading && !hasResults"
      justify="center"
      align="center"
      class="my-12"
    >
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <div class="mt-3 text-body-1 font-weight-medium">
          Loading transcription...
        </div>
      </v-col>
    </v-row>

    <v-row
      v-else-if="!isTranscribing && !hasResults"
      justify="center"
      align="center"
      class="my-12"
    >
      <v-col cols="12" md="8" class="text-center">
        <v-icon size="64" color="grey-darken-1" class="mb-3">
          mdi-text-box-outline
        </v-icon>
        <div class="text-body-1 font-weight-medium mb-1">
          Ready to transcribe this session
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-6">
          Processing starts only when you click the button below. This may take
          1–2 minutes.
        </div>
        <v-select
          v-if="canTranscribe"
          v-model="selectedProvider"
          class="mb-4 text-left"
          label="Provider"
          :items="providers"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-robot-outline"
          hide-details
          :menu-props="{ maxHeight: 260 }"
        />
        <v-btn
          color="primary"
          size="large"
          :disabled="!canTranscribe || !selectedProvider"
          @click="transcribeSession()"
        >
          <v-icon start>mdi-play</v-icon>
          Start Transcription
        </v-btn>
        <div
          v-if="!canTranscribe"
          class="mt-3 text-body-2 text-grey-darken-1"
        >
          {{ unavailableMessage }}
        </div>
        <v-alert
          v-if="transcriptionError"
          type="error"
          variant="tonal"
          class="mt-4 text-left"
        >
          {{ transcriptionError }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="isTranscribing" justify="center" align="center" class="my-12">
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <div class="mt-3 text-body-1 font-weight-medium">
          Transcribing audio...
        </div>
        <div class="mt-1 text-body-2 text-grey-darken-1">
          This may take 1–2 minutes
        </div>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-if="transcriptionError" cols="12">
        <v-alert type="error" variant="tonal">
          {{ transcriptionError }}
        </v-alert>
      </v-col>

      <v-col
        v-for="metric in summaryMetrics"
        :key="metric.label"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="font-weight-medium text-grey-darken-1">
              {{ metric.label }}
            </span>
            <v-icon :color="metric.color">{{ metric.icon }}</v-icon>
          </div>
          <div class="text-h6 font-weight-bold">{{ metric.value }}</div>
          <v-progress-linear
            :model-value="metric.progress"
            :color="metric.color"
            height="6"
            class="mt-2"
            rounded
          />
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex align-center justify-space-between mb-3">
            <h4 class="text-subtitle-1 font-weight-medium">
              Transcript ({{ segments.length }})
            </h4>
            <div class="d-flex align-center ga-2 flex-wrap justify-end">
              <v-select
                v-model="selectedProvider"
                :items="providers"
                item-title="label"
                item-value="value"
                label="Provider"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="isTranscribing || !canTranscribe"
                style="min-width: 180px; max-width: 220px"
              />
              <v-select
                v-if="runs.length > 1"
                v-model="selectedRunId"
                :items="runOptions"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 180px"
              />
            </div>
          </div>

          <div class="text-caption text-medium-emphasis mb-3">
            {{ runMeta }}
          </div>

          <v-list
            v-if="segments.length"
            density="comfortable"
            class="pa-0"
          >
            <template v-for="(segment, index) in segments" :key="segment.id">
              <v-list-item class="px-0">
                <template #prepend>
                  <div class="text-center mr-3" style="min-width: 48px">
                    <v-icon :color="roleColor(segment.role)">
                      {{ roleIcon(segment.role) }}
                    </v-icon>
                    <div class="text-caption">
                      {{ roleLabel(segment.role) }}
                    </div>
                  </div>
                </template>
                <v-list-item-title class="text-wrap">
                  {{ segment.text || '—' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatTime(segment.start) }} – {{ formatTime(segment.end) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider v-if="index < segments.length - 1" />
            </template>
          </v-list>
          <div v-else class="text-body-2 text-grey-darken-1">
            No segments in this transcription.
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-card>

  <v-dialog v-model="confirmOpen" max-width="420">
    <v-card rounded="xl">
      <v-card-title class="text-h6">Delete transcription?</v-card-title>
      <v-card-text>
        This action can’t be undone. The run will be removed from this task.
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="confirmOpen = false">Cancel</v-btn>
        <v-btn color="error" :loading="deleting" @click="confirmDelete">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import TranscriptionController from '@/ai/transcriptions/TranscriptionController'
import {
  deleteTranscription,
  transcribeTask,
  watchTranscriptionJob,
} from '@/app/services/transcription/TranscriptionService'
import { formatTime } from '@/shared/utils/timeUtils'

const props = defineProps({
  answersDocId: { type: String, default: '' },
  userDocId: { type: String, default: '' },
  taskId: { type: [String, Number], default: null },
  studyId: { type: String, default: null },
  transcriptionDocId: { type: String, default: null },
  canTranscribe: { type: Boolean, default: false },
  unavailableMessage: {
    type: String,
    default: 'Audio recording or session identifiers are not available for this task.',
  },
})

const emit = defineEmits(['saved', 'deleted'])
const store = useStore()

const transcriptionController = new TranscriptionController()

const isLoading = ref(true)
const isTranscribing = ref(false)
const deleting = ref(false)
const confirmOpen = ref(false)
const transcriptionError = ref(null)
const runs = ref([])
const selectedRunId = ref(null)
const selectedProvider = ref('whisper')

const providers = [
  { label: 'Whisper (local)', value: 'whisper' },
  { label: 'OpenAI Whisper API', value: 'openai' },
]

const selectedModel = computed(() =>
  selectedProvider.value === 'openai' ? 'whisper-1' : 'medium',
)

const hasResults = computed(() => Boolean(selectedRun.value))

const selectedRun = computed(() => {
  if (!runs.value.length) return null
  return (
    runs.value.find((run) => run.id === selectedRunId.value) || runs.value[0]
  )
})

const statusLabel = computed(() => {
  if (isTranscribing.value) return 'Transcribing...'
  if (hasResults.value) return 'Transcription Complete'
  if (isLoading.value) return 'Loading...'
  return 'Waiting to start'
})

const statusChipColor = computed(() => {
  if (isTranscribing.value || isLoading.value) return 'grey'
  if (hasResults.value) return 'primary'
  return 'blue-grey'
})

const runOptions = computed(() =>
  runs.value.map((run, index) => ({
    value: run.id,
    label: `Transcription ${runs.value.length - index}`,
  })),
)

const segments = computed(() => segmentsFor(selectedRun.value))

const summaryMetrics = computed(() => {
  const run = selectedRun.value
  const items = segments.value
  const duration = items.reduce(
    (max, segment) => Math.max(max, Number(segment.end) || 0),
    0,
  )
  const speakers = new Set(items.map((segment) => segment.role)).size
  const language =
    run?.evaluator?.language || run?.moderator?.language || '—'

  return [
    {
      label: 'Segments',
      value: String(items.length),
      progress: Math.min(items.length * 10, 100),
      color: 'primary',
      icon: 'mdi-format-list-bulleted',
    },
    {
      label: 'Duration',
      value: formatTime(duration),
      progress: Math.min(duration, 100),
      color: 'amber',
      icon: 'mdi-timer-outline',
    },
    {
      label: 'Language',
      value: language,
      progress: language === '—' ? 0 : 100,
      color: 'blue-grey',
      icon: 'mdi-translate',
    },
    {
      label: 'Speakers',
      value: String(speakers),
      progress: speakers * 50,
      color: 'light-green-darken-2',
      icon: 'mdi-account-voice',
    },
  ]
})

const runMeta = computed(() => {
  const run = selectedRun.value
  if (!run) return ''
  return `${formatDate(run.updatedAt || run.createdAt)} · Provider: ${
    run.provider || '—'
  } · Model: ${run.model || '—'}`
})

watch(
  () => [props.answersDocId, props.userDocId, props.taskId],
  () => {
    fetchRuns()
  },
  { immediate: true },
)

async function fetchRuns() {
  if (!props.answersDocId || !props.userDocId || props.taskId == null) {
    runs.value = []
    isLoading.value = false
    return
  }

  isLoading.value = true
  transcriptionError.value = null
  try {
    const transcriptions =
      await transcriptionController.getByAnswersDocIdandUserDocIdandTaskId(
        props.answersDocId,
        props.userDocId,
        String(props.taskId),
      )
    runs.value = Array.isArray(transcriptions) ? transcriptions : []
    selectedRunId.value =
      props.transcriptionDocId &&
      runs.value.some((run) => run.id === props.transcriptionDocId)
        ? props.transcriptionDocId
        : runs.value[0]?.id || null
  } catch (err) {
    runs.value = []
    transcriptionError.value = errorMessage(err)
  } finally {
    isLoading.value = false
  }
}

let stopJobWatch = null

function stopWatchingJob() {
  if (stopJobWatch) {
    stopJobWatch()
    stopJobWatch = null
  }
}

onUnmounted(stopWatchingJob)

async function retranscribe() {
  if (!props.canTranscribe || !selectedProvider.value) return

  const transcriptionId = selectedRun.value?.id
  isTranscribing.value = true
  transcriptionError.value = null
  stopWatchingJob()

  try {
    if (transcriptionId) {
      await deleteTranscription({ transcriptionId })
      runs.value = runs.value.filter((run) => run.id !== transcriptionId)
      selectedRunId.value = runs.value[0]?.id || null
      await store.dispatch('getCurrentTestAnswerDoc')
    }
  } catch (err) {
    isTranscribing.value = false
    transcriptionError.value = errorMessage(err)
    return
  }

  await transcribeSession()
}

async function transcribeSession() {
  if (!props.canTranscribe || !selectedProvider.value) return

  isTranscribing.value = true
  transcriptionError.value = null
  stopWatchingJob()

  try {
    const queued = await transcribeTask({
      answersDocId: props.answersDocId,
      userDocId: props.userDocId,
      taskId: String(props.taskId),
      studyId: props.studyId || undefined,
      provider: selectedProvider.value,
      model: selectedModel.value,
    })

    stopJobWatch = watchTranscriptionJob(
      queued.jobDocId,
      async (job) => {
        if (!job || job.jobId !== queued.jobId) return
        if (job.status !== 'done' && job.status !== 'failed') return

        stopWatchingJob()
        isTranscribing.value = false

        if (job.status === 'failed') {
          transcriptionError.value = job.error || 'Transcription failed'
          return
        }

        await fetchRuns()
        if (job.transcriptionId) selectedRunId.value = job.transcriptionId
        emit('saved', { id: job.transcriptionId })
      },
      (err) => {
        stopWatchingJob()
        isTranscribing.value = false
        transcriptionError.value = errorMessage(err)
      },
    )
  } catch (err) {
    isTranscribing.value = false
    transcriptionError.value = errorMessage(err)
  }
}

async function confirmDelete() {
  if (!selectedRun.value) return
  deleting.value = true
  try {
    const result = await deleteTranscription({
      transcriptionId: selectedRun.value.id,
    })
    emit('deleted', result)
    confirmOpen.value = false
    await fetchRuns()
  } catch (err) {
    transcriptionError.value = errorMessage(err)
    confirmOpen.value = false
  } finally {
    deleting.value = false
  }
}

function segmentsFor(run) {
  if (!run) return []
  const evaluator = (run?.evaluator?.segments ?? []).map((segment, index) => ({
    id: `ev_${run.id}_${index}`,
    role: 'evaluator',
    start: Number(segment.start) || 0,
    end: Number(segment.end) || 0,
    text: segment.text || '',
  }))
  const moderator = (run?.moderator?.segments ?? []).map((segment, index) => ({
    id: `mod_${run.id}_${index}`,
    role: 'moderator',
    start: Number(segment.start) || 0,
    end: Number(segment.end) || 0,
    text: segment.text || '',
  }))
  return [...evaluator, ...moderator].sort((a, b) => a.start - b.start)
}

function roleLabel(role) {
  return role === 'moderator' ? 'Moderator' : 'Evaluator'
}

function roleIcon(role) {
  return role === 'moderator' ? 'mdi-account-tie' : 'mdi-account-voice'
}

function roleColor(role) {
  return role === 'moderator' ? 'primary' : 'amber-darken-2'
}

function errorMessage(err) {
  return (
    err?.message ||
    err?.details ||
    'Something went wrong while processing the transcription.'
  )
}

function formatDate(timestamp) {
  let date
  if (timestamp?.toDate) date = timestamp.toDate()
  else if (typeof timestamp?.seconds === 'number') {
    date = new Date(
      timestamp.seconds * 1000 +
        Math.floor((timestamp.nanoseconds || 0) / 1e6),
    )
  } else if (timestamp instanceof Date) date = timestamp
  else date = new Date(timestamp || Date.now())
  return date.toLocaleString()
}
</script>
