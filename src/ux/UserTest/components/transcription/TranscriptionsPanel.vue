<template>
  <div class="pa-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 class="text-h6 m-0"></h3>
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="20"
        class="ml-2"
      />
    </div>

    <!-- Empty state -->
    <v-alert
      v-if="deleteError"
      type="error"
      variant="tonal"
      density="comfortable"
      class="mb-4"
    >
      {{ deleteError }}
    </v-alert>

    <v-alert
      v-if="!loading && !hasRuns"
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-4"
    >
      No transcriptions yet for this task.
    </v-alert>

    <!-- Runs list -->
    <v-expansion-panels v-else variant="accordion">
      <v-expansion-panel
        v-for="(run, i) in transcriptionsArray"
        :key="run?.id || i"
      >
        <v-expansion-panel-title>
          <div class="w-100 d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <span class="font-weight-medium"
                >Transcription {{ transcriptionsArray.length - i }}</span
              >
              <v-chip
                v-if="run.id === transcriptionDocId"
                size="x-small"
                color="success"
                >Latest</v-chip
              >
            </div>

            <!-- actions -->
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-delete"
                color="error"
                :loading="deletingId === run.id"
                variant="text"
                size="small"
                @click.stop="askDelete(run)"
              />
            </div>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <!-- meta -->
          <div class="text-caption text-medium-emphasis mb-3">
            {{ formatDate(run.updatedAt || run.createdAt) }} · Provider:
            {{ run.provider }} · Model: {{ run.model }}
          </div>

          <!-- languages -->
          <div class="text-caption text-medium-emphasis mb-3">
            Evaluator: {{ run?.evaluator?.language ?? '—' }} · Moderator:
            {{ run?.moderator?.language ?? '—' }}
          </div>

          <!-- <pre>{{ JSON.stringify(run, null, 2) }}</pre> -->

          <!-- full transcription list for this run -->
          <TranscriptionList
            v-if="segmentsFor(run).length"
            :transcript-segments="segmentsFor(run)"
          />
          <div v-else class="text-medium-emphasis text-caption">
            No segments in this run.
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- confirm -->
    <ConfirmDialog
      v-model:show="confirmOpen"
      title="Delete transcription?"
      message="This action can’t be undone. The run will be removed from this task."
      confirm-text="Delete"
      cancel-text="Cancel"
      confirm-color="error"
      confirm-icon="mdi-delete"
      icon="mdi-delete-outline"
      icon-color="error"
      type="error"
      :loading="deletingId === runToDelete?.id"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { watch, ref, computed, nextTick } from 'vue'

import TranscriptionList from './TranscriptionList.vue'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'

// JS props (no types)
const props = defineProps({
  answersDocId: {
    type: String,
    required: true,
  },
  userDocId: {
    type: String,
    required: true,
  },
  taskId: {
    type: String,
    required: true,
  },
  transcriptionDocId: {
    type: String,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['deleted'])

const loading = ref(true)
const transcriptionsArray = ref([])

const confirmOpen = ref(false)
const runToDelete = ref(null)
const deletingId = ref(null)
const deleteError = ref(null)
let fetchGeneration = 0

const hasRuns = computed(
  () =>
    Array.isArray(transcriptionsArray.value) &&
    transcriptionsArray.value.length > 0,
)

// Controllers
import TranscriptionController from '@/ai/transcriptions/TranscriptionController'
import { deleteTranscription } from '@/app/services/transcription/TranscriptionService'

const transcriptionController = new TranscriptionController()

watch(
  () => [props.answersDocId, props.userDocId, props.taskId],
  async () => {
    await fetchSelectedTaskTranscriptions()
  },
  { immediate: true },
)

async function fetchSelectedTaskTranscriptions() {
  const generation = ++fetchGeneration

  if (!props.answersDocId || !props.userDocId || !props.taskId) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const transcriptions =
      await transcriptionController.getByAnswersDocIdandUserDocIdandTaskId(
        props.answersDocId,
        props.userDocId,
        props.taskId,
      )

    if (generation !== fetchGeneration) return
    transcriptionsArray.value = Array.isArray(transcriptions)
      ? transcriptions
      : []
    deleteError.value = null
  } catch (err) {
    if (generation !== fetchGeneration) return
    transcriptionsArray.value = []
    deleteError.value =
      err?.message || 'Failed to load transcriptions for this task.'
  } finally {
    if (generation === fetchGeneration) loading.value = false
  }
}

/** UI → click delete */
async function askDelete(run) {
  runToDelete.value = run
  confirmOpen.value = false
  await nextTick()
  confirmOpen.value = true
}

/** Confirm → delete via Cloud Function → refresh list */
async function confirmDelete() {
  const transcriptionId = runToDelete.value?.id
  if (!transcriptionId) return
  deletingId.value = transcriptionId
  try {
    const result = await deleteTranscription({
      transcriptionId,
    })
    fetchGeneration += 1
    transcriptionsArray.value = transcriptionsArray.value.filter(
      (run) => run.id !== transcriptionId,
    )
    emit('deleted', result)
    confirmOpen.value = false
    await fetchSelectedTaskTranscriptions()
  } catch (err) {
    deleteError.value =
      err?.message || 'Failed to delete the transcription.'
  } finally {
    if (confirmOpen.value) confirmOpen.value = false
    deletingId.value = null
    runToDelete.value = null
  }
}

/** Merge evaluator + moderator segments and sort by start */
function segmentsFor(run) {
  const ev = (run?.evaluator?.segments ?? []).map((s, i) => ({
    id: `ev_${run.id}_${i}`,
    role: 'evaluator',
    start: Number(s.start) || 0,
    end: Number(s.end) || 0,
    text: s.text || '',
  }))
  const mod = (run?.moderator?.segments ?? []).map((s, i) => ({
    id: `mod_${run.id}_${i}`,
    role: 'moderator',
    start: Number(s.start) || 0,
    end: Number(s.end) || 0,
    text: s.text || '',
  }))
  return [...ev, ...mod].sort((a, b) => a.start - b.start)
}

/** Format Firestore Timestamp / {seconds,nanos} / Date / ISO */
function formatDate(ts) {
  let d
  if (ts?.toDate) d = ts.toDate()
  else if (typeof ts?.seconds === 'number')
    d = new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6))
  else if (ts instanceof Date) d = ts
  else d = new Date(ts || Date.now())
  return d.toLocaleString()
}
</script>
