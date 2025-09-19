<template>
  <div class="pa-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 class="text-h6 m-0">Export Data</h3>
      <v-progress-circular v-if="loading" indeterminate size="20" />
    </div>

    <!-- Controls -->
    <v-row class="mb-4" dense>
      <v-col cols="12" md="6">
        <div class="text-caption text-medium-emphasis mb-1">Scope</div>
        <v-btn-toggle v-model="scope" mandatory density="comfortable">
          <v-btn value="latest">Latest run</v-btn>
          <v-btn value="all">All runs for this task</v-btn>
        </v-btn-toggle>
      </v-col>

      <v-col cols="12" md="6">
        <div class="text-caption text-medium-emphasis mb-1">Format</div>
        <v-btn-toggle v-model="format" mandatory density="comfortable">
          <v-btn value="csv">CSV</v-btn>
          <v-btn value="json">JSON</v-btn>
          <v-btn value="pdf" disabled>PDF (coming soon)</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- Info / empty states -->
    <v-alert
      v-if="!loading && runs.length === 0"
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-3"
    >
      No transcriptions yet for this task.
    </v-alert>

    <div v-else class="text-caption text-medium-emphasis mb-4">
      Loaded {{ runs.length }} run<span v-if="runs.length !== 1">s</span>.
      <span v-if="runs.length">
        Latest: {{ formatDate(runs[0]?.createdAt) }}</span
      >
    </div>

    <!-- Actions -->
    <div class="d-flex gap-2">
      <v-btn
        color="primary"
        :disabled="loading || runs.length === 0"
        @click="onExport"
      >
        Export
      </v-btn>

      <v-btn variant="text" :disabled="loading" @click="refetch">
        Refresh
      </v-btn>
    </div>

    <!-- (Optional) tiny peek -->
    <div v-if="runs.length && scope === 'latest'" class="mt-4 text-caption">
      <strong>Latest run:</strong>
      {{ runs[0]?.provider }} · {{ runs[0]?.model }} ·
      {{ formatDate(runs[0]?.createdAt) }}
    </div>
  </div>

  <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    :timeout="3500"
  >
    {{ snackbar.text }}
    <template #actions>
      <v-btn color="white" variant="text" @click="snackbar.visible = false"
        >Close</v-btn
      >
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import TranscriptionController from '@/ai/transcriptions/TranscriptionController'

/* ---------------------- Props ---------------------- */
const props = defineProps({
  answerDocId: { type: String, required: true },
  userDocId: { type: String, required: true },
  taskId: { type: [String, Number], required: true },
})

/* ---------------------- State ---------------------- */
const loading = ref(true)
const runs = ref([]) // sorted desc by createdAt
const scope = ref('latest') // 'latest' | 'all'
const format = ref('csv') // 'csv' | 'json'
const snackbar = ref({ visible: false, text: '', color: '' })

const controller = new TranscriptionController()

/* --------------------- Fetching -------------------- */
watch(
  () => [props.answerDocId, props.userDocId, props.taskId],
  () => refetch(),
  { immediate: true },
)

async function refetch() {
  if (!props.answerDocId || !props.userDocId || props.taskId == null) return
  loading.value = true
  try {
    const arr = await controller.getByAnswerDocIdandUserDocIdandTaskId(
      props.answerDocId,
      props.userDocId,
      String(props.taskId),
    )
    runs.value = Array.isArray(arr) ? arr : []
  } catch (e) {
    toast('Error loading transcriptions', 'red')
    console.error(e)
  } finally {
    loading.value = false
  }
}

/* --------------------- Exporting ------------------- */
function onExport() {
  if (!runs.value.length) return

  const sel = scope.value === 'latest' ? [runs.value[0]] : runs.value.slice()
  if (format.value === 'csv') {
    const rows = flattenRunsToRows(sel)
    const csv = rowsToCsv(rows)
    const fn =
      scope.value === 'latest'
        ? fileName(
            `transcription_latest_task-${props.taskId}_user-${props.userDocId}`,
            'csv',
          )
        : fileName(
            `transcriptions_task-${props.taskId}_user-${props.userDocId}`,
            'csv',
          )
    downloadBlob(csv, fn, 'text/csv;charset=utf-8')
    toast('CSV exported', 'green')
  } else if (format.value === 'json') {
    const sanitized = sel.map(cleanRunForJson)
    const payload = scope.value === 'latest' ? sanitized[0] : sanitized
    const fn =
      scope.value === 'latest'
        ? `transcription_latest_task-${props.taskId}_user-${props.userDocId}.json`
        : `transcriptions_task-${props.taskId}_user-${props.userDocId}.json`
    downloadBlob(JSON.stringify(payload, null, 2), fn, 'application/json')
    toast('JSON exported', 'green')
  }
}

/* ---------- Flatten to CSV rows (one row = segment) ---------- */
function flattenRunsToRows(selectedRuns) {
  const rows = []
  for (const run of selectedRuns) {
    const runId = run.id
    const createdIso = toIso(run.createdAt)
    const provider = run.provider || ''
    const model = run.model || ''

    const evLang = run?.evaluator?.language || ''
    const evSegs = Array.isArray(run?.evaluator?.segments)
      ? run.evaluator.segments
      : []
    for (const s of evSegs) {
      const start = num(s.start)
      const end = num(s.end)
      rows.push({
        answerDocId: props.answerDocId,
        userDocId: props.userDocId,
        taskId: String(props.taskId),
        runId,
        runCreatedAt: createdIso,
        provider,
        model,
        role: 'evaluator',
        language: evLang,
        start,
        end,
        duration: end - start,
        text: s.text || '',
      })
    }

    const modLang = run?.moderator?.language || ''
    const modSegs = Array.isArray(run?.moderator?.segments)
      ? run.moderator.segments
      : []
    for (const s of modSegs) {
      const start = num(s.start)
      const end = num(s.end)
      rows.push({
        answerDocId: props.answerDocId,
        userDocId: props.userDocId,
        taskId: String(props.taskId),
        runId,
        runCreatedAt: createdIso,
        provider,
        model,
        role: 'moderator',
        language: modLang,
        start,
        end,
        duration: end - start,
        text: s.text || '',
      })
    }
  }

  // sort: newest run first, then by start
  rows.sort((a, b) => {
    if (a.runCreatedAt === b.runCreatedAt) return a.start - b.start
    return a.runCreatedAt > b.runCreatedAt ? -1 : 1
  })
  return rows
}

/* --------------------- CSV utils ------------------- */
function rowsToCsv(rows) {
  const headers = [
    'answerDocId',
    'userDocId',
    'taskId',
    'runId',
    'runCreatedAt',
    'provider',
    'model',
    'role',
    'language',
    'start',
    'end',
    'duration',
    'text',
  ]
  const lines = [headers.join(',')]
  for (const r of rows) {
    const vals = headers.map((h) => csvEscape(r[h]))
    lines.push(vals.join(','))
  }
  return lines.join('\n')
}

function csvEscape(v) {
  if (v == null) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function cleanRunForJson(run) {
  return {
    id: run.id,
    answerDocId: run.answerDocId,
    userDocId: run.userDocId,
    taskId: String(run.taskId),
    provider: run.provider || '',
    model: run.model || '',
    createdAt: toDate(run.createdAt).toISOString(),
    evaluator: {
      language: run?.evaluator?.language || '',
      transcript: run?.evaluator?.transcript || '',
      segments: Array.isArray(run?.evaluator?.segments)
        ? run.evaluator.segments.map((s) => ({
            start: num(s.start),
            end: num(s.end),
            text: s.text || '',
          }))
        : [],
    },
    moderator: {
      language: run?.moderator?.language || '',
      transcript: run?.moderator?.transcript || '',
      segments: Array.isArray(run?.moderator?.segments)
        ? run.moderator.segments.map((s) => ({
            start: num(s.start),
            end: num(s.end),
            text: s.text || '',
          }))
        : [],
    },
  }
}

/* --------------------- Helpers --------------------- */
function fileName(base, ext) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
  return `${base}_${stamp}.${ext}`
}

function downloadBlob(data, name, type) {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function toIso(ts) {
  const d = toDate(ts)
  return d.toISOString()
}

function toDate(ts) {
  if (ts?.toDate) return ts.toDate() // Firestore Timestamp
  if (typeof ts?.seconds === 'number') {
    return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6))
  }
  if (ts instanceof Date) return ts
  return new Date(ts || Date.now())
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function formatDate(ts) {
  return toDate(ts).toLocaleString()
}

function toast(text, color) {
  snackbar.value = { visible: true, text, color }
}
</script>
