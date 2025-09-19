<template>
  <div class="pa-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 class="text-h6 m-0">
      </h3>
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="20"
        class="ml-2"
      />
    </div>

    <!-- Empty state -->
    <v-alert
      v-if="!loading && transcriptionsArray.length === 0"
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-4"
    >
      No transcriptions yet for this task.
    </v-alert>

    <!-- Runs list -->
    <v-expansion-panels v-else variant="accordion">
      <v-expansion-panel v-for="(run, i) in transcriptionsArray" :key="run.id">
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

          <v-row> </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { watch, ref } from 'vue'

import TranscriptionList from './TranscriptionList.vue'

// JS props (no types)
const props = defineProps({
  answerDocId: {
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

// Controllers
import TranscriptionController from '@/ai/transcriptions/TranscriptionController'
const transcriptionController = new TranscriptionController()

watch(
  () => [props.answerDocId, props.userDocId, props.taskId],
  async () => {
    await fetchSelectedTaskTranscriptions()
  },
  { immediate: true },
)

async function fetchSelectedTaskTranscriptions() {
  if (!props.answerDocId || !props.userDocId || !props.taskId) return

  loading.value = true
  try {
    const transcriptions =
      await transcriptionController.getByAnswerDocIdandUserDocIdandTaskId(
        props.answerDocId,
        props.userDocId,
        props.taskId,
      )

    console.log('Fetched transcriptions:', transcriptions)
    transcriptionsArray.value = transcriptions
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
  } finally {
    loading.value = false
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
