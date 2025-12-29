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
                v-if="run.id === latestTranscriptionId"
                size="x-small"
                color="success"
                text-color="white"
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
            {{ formatDate(run.createdAt) }} · Provider: {{ run.provider }} ·
            Model: {{ run.model }}
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
            :transcriptSegments="segmentsFor(run)"
          />
          <div v-else class="text-medium-emphasis text-caption">
            No segments in this run.
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- confirm -->
    <v-dialog v-model="confirmOpen" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Delete transcription?</v-card-title>
        <v-card-text>
          This action can’t be undone. The run will be removed from this task.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="confirmOpen = false">Cancel</v-btn>
          <v-btn
            color="error"
            :loading="deletingId === runToDelete?.id"
            @click="confirmDelete"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { watch, ref, computed } from 'vue'

import TranscriptionList from './TranscriptionList.vue'

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
  latestTranscriptionId: {
    type: String,
    required: false,
    default: null,
  },
})

const loading = ref(true)
const transcriptionsArray = ref([])

const confirmOpen = ref(false)
const runToDelete = ref(null)
const deletingId = ref(null)

const hasRuns = computed(
  () =>
    Array.isArray(transcriptionsArray.value) &&
    transcriptionsArray.value.length > 0,
)

// Controllers
import TranscriptionController from '@/ai/transcriptions/TranscriptionController'
const transcriptionController = new TranscriptionController()

import AnswerController from '@/shared/controllers/AnswerController'
const answerController = new AnswerController()
watch(
  () => [props.answersDocId, props.userDocId, props.taskId],
  async () => {
    await fetchSelectedTaskTranscriptions()
  },
  { immediate: true },
)

async function fetchSelectedTaskTranscriptions() {
  if (!props.answersDocId || !props.userDocId || !props.taskId) {
    loading.value = false // don't leave the spinner on if we early-return
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

    transcriptionsArray.value = Array.isArray(transcriptions)
      ? transcriptions
      : []
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
    transcriptionsArray.value = [] // ✅ fallback
  } finally {
    loading.value = false
  }
}

/** UI → click delete */
function askDelete(run) {
  runToDelete.value = run
  confirmOpen.value = true
}

/** Confirm → delete → refresh → update meta */
async function confirmDelete() {
  if (!runToDelete.value) return
  deletingId.value = runToDelete.value.id
  try {
    await transcriptionController.deleteById(runToDelete.value.id)

    // refetch to get the new list
    await fetchSelectedTaskTranscriptions()

    // TODO: ADD THIS LATER
    // // recompute meta from refreshed list
    // const newCount = transcriptionsArray.value.length
    // const newLatestId = transcriptionsArray.value[0]?.id ?? null // we already sort desc in controller

    // // update task meta on the Answer doc
    // await answerController.setTaskTranscriptionMeta({
    //   answersDocId: props.answersDocId,
    //   userDocId: props.userDocId,
    //   taskId: String(props.taskId),
    //   latestTranscriptionDocId: newLatestId,
    //   transcriptionsCount: newCount,
    // })
  } catch (e) {
    console.error('Failed to delete transcription:', e)
  } finally {
    confirmOpen.value = false
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
