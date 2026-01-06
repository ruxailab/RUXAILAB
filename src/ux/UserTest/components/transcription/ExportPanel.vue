<template>
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

  <v-skeleton-loader
    v-else-if="loading"
    type="heading, text, actions"
    class="mt-2"
  />

  <v-card v-else class="export-surface">
    <v-toolbar
      density="compact"
      color="transparent"
      class="export-toolbar mb-3"
    >
      <v-toolbar-title class="text-h6 d-flex align-center gap-2">
        <v-icon size="18">mdi-tray-arrow-down</v-icon>
        Export Data
      </v-toolbar-title>

      <v-spacer />

      <!-- tiny meta chips -->
      <div v-if="!loading && runs.length" class="flex gap-2 align-center mr-2">
        <v-chip size="x-small" variant="flat" color="blue-grey-lighten-4">
          {{ runs.length }} runs
        </v-chip>
        <v-chip
          v-if="runs[0]"
          size="x-small"
          variant="flat"
          color="blue-grey-lighten-4"
        >
          {{ runs[0].provider }} / {{ runs[0].model }}
        </v-chip>
        <v-chip
          v-if="runs[0]"
          size="x-small"
          variant="flat"
          color="blue-grey-lighten-4"
        >
          {{ formatDate(runs[0].createdAt) }}
        </v-chip>
      </div>

      <!-- refresh icon -->
      <v-tooltip text="Refresh">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-refresh"
            variant="text"
            :disabled="loading"
            @click="refetch"
          />
        </template>
      </v-tooltip>

      <v-progress-circular
        v-if="loading"
        indeterminate
        size="18"
        class="ml-2"
      />
    </v-toolbar>

    <!-- Controls -->
    <v-row class="mb-4" dense>
      <v-col cols="12" md="6">
        <!-- Scope -->
        <span class="sr-only" id="scopeLabel">Scope</span>
        <v-btn-toggle
          aria-labelledby="scopeLabel"
          v-model="scope"
          mandatory
          density="comfortable"
          class="toggle--responsive seg"
          rounded="xl"
          variant="tonal"
          color="orange-darken-2"
          :disabled="!runs.length"
        >
          <v-btn value="latest" prepend-icon="mdi-history">Latest run</v-btn>
          <v-btn value="all" prepend-icon="mdi-format-list-bulleted"
            >All runs for this task</v-btn
          >
        </v-btn-toggle>
      </v-col>

      <v-col cols="12" md="6">
        <!-- Format -->
        <span class="sr-only" id="formatLabel">Format</span>
        <v-btn-toggle
          aria-labelledby="formatLabel"
          v-model="format"
          mandatory
          density="comfortable"
          class="toggle--responsive seg"
          rounded="xl"
          variant="tonal"
          color="orange-darken-2"
          :disabled="!runs.length"
        >
          <v-btn value="csv" prepend-icon="mdi-file-delimited-outline"
            >CSV</v-btn
          >
          <v-btn value="json" prepend-icon="mdi-code-json">JSON</v-btn>
          <v-btn value="pdf" prepend-icon="mdi-file-pdf-box">PDF</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <v-card-actions class="export-actions">
      <div v-if="runs.length" class="text-caption text-medium-emphasis mr-4">
        {{ selectionSummary }} • {{ runs.length }} run{{
          runs.length === 1 ? '' : 's'
        }}
      </div>

      <v-btn
      variant="elevated"
        color="orange"
        class="text-white"
        :disabled="loading || runs.length === 0"
        :prepend-icon="formatIcon"
        @click="onExport"
      >
        {{ exportLabel }}
      </v-btn>
    </v-card-actions>
  </v-card>

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

  <!-- PDF Preview + Editor -->
  <v-dialog v-model="showPreview" max-width="1000">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-subtitle-1">PDF Preview</span>
        <div class="d-flex gap-2">
          <v-btn variant="text" @click="showPreview = false">Close</v-btn>
          <v-btn color="primary" @click="downloadPdf">Download PDF</v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <v-row>
          <!-- Editor side -->
          <v-col cols="12" md="5">
            <v-text-field
              v-model="pdfTitle"
              label="Report Title"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />
            <v-row class="mb-2">
              <v-col cols="6">
                <v-text-field
                  v-model="pdfMeta.date"
                  label="Date"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="pdfMeta.moderator"
                  label="Moderator"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
            <v-text-field
              v-model="pdfMeta.user"
              label="User"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <div class="text-caption text-medium-emphasis mb-1">
              Executive Summary (rich text)
            </div>
            <QuillEditor
              v-model:content="pdfSummaryHtml"
              contentType="html"
              theme="snow"
              style="height: 220px"
            />
          </v-col>

          <!-- Live preview side -->
          <v-col cols="12" md="7">
            <div class="pdf-preview">
              <h2 class="m-0">{{ pdfTitle }}</h2>
              <div class="mt-1 text-caption">
                <strong>Date:</strong> {{ pdfMeta.date }} &nbsp;|&nbsp;
                <strong>Moderator:</strong>
                {{ pdfMeta.moderator || '-' }} &nbsp;|&nbsp;
                <strong>User:</strong> {{ pdfMeta.user || '-' }}
              </div>

              <div class="mt-4" v-html="pdfSummaryHtml"></div>

              <div v-for="(run, i) in previewRuns" :key="run.id" class="mt-6">
                <h3 class="text-subtitle-2 m-0">
                  Run {{ i + 1 }} · {{ run.provider }}/{{ run.model }} ·
                  {{ formatDate(run.createdAt) }}
                </h3>
                <table class="seg-table mt-2">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Text</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in buildPreviewRows(run)" :key="row.key">
                      <td>{{ row.role }}</td>
                      <td>{{ row.start }}</td>
                      <td>{{ row.end }}</td>
                      <td>{{ row.text }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.export-surface {
  display: flex;
  flex-direction: column;
}
.export-actions {
  justify-content:flex-end;
  gap: 8px;
}
@media (max-width: 960px) {
  .export-actions {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .export-actions .v-btn {
    width: 100%;
  }
}

.toggle--responsive {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.toggle--responsive .v-btn {
  flex: 1 1 220px;
  min-width: 0;
}

.actions .v-btn {
  min-width: 140px;
}
@media (max-width: 960px) {
  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .actions .v-btn {
    width: 100%;
  }
}

/* PDF dialog: prevent overflow on small screens */
.scroll-panel {
  max-height: 60vh;
  overflow: auto;
}

/* Tables: allow horizontal scroll on mobile */
.scroll-x {
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.scroll-x table {
  width: 100%;
}

.pdf-preview {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px 30px;
}
.seg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.seg-table th,
.seg-table td {
  border: 1px solid #e6e6e6;
  padding: 6px 8px;
  vertical-align: top;
}
.seg-table thead th {
  background: #fff7ea;
}
.sr-only {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

<script setup>
import { ref, watch, computed } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { QuillEditor } from '@vueup/vue-quill'

import TranscriptionController from '@/ai/transcriptions/TranscriptionController'

/* ---------------------- Props ---------------------- */
const props = defineProps({
  answersDocId: { type: String, required: true },
  userDocId: { type: String, required: true },
  taskId: { type: [String, Number], required: true },
})

/* ---------------------- State ---------------------- */
const loading = ref(true)
const runs = ref([]) // sorted desc by createdAt
const scope = ref('latest') // 'latest' | 'all'
const format = ref('csv') // 'csv' | 'json'
const snackbar = ref({ visible: false, text: '', color: '' })
/* --------- PDF Preview + Editor state --------- */
const showPreview = ref(false)
const previewRuns = ref([])

const pdfTitle = ref('Session PDF Report')
const pdfMeta = ref({
  date: new Date().toISOString().slice(0, 10),
  moderator: '',
  user: '',
})
const pdfSummaryHtml = ref('<p>Add an executive summary here…</p>')

const controller = new TranscriptionController()

const formatIcon = computed(
  () =>
    ({
      csv: 'mdi-file-delimited-outline',
      json: 'mdi-code-json',
      pdf: 'mdi-file-pdf-box',
    }[format.value]),
)

const exportLabel = computed(() =>
  format.value === 'pdf'
    ? 'Preview & Export PDF'
    : `Export ${format.value.toUpperCase()}`,
)

const selectionSummary = computed(() => {
  const selScope = scope.value === 'latest' ? 'Latest run' : 'All runs'
  const selFormat = format.value.toUpperCase()
  return `${selScope} • ${selFormat}`
})

/* --------------------- Fetching -------------------- */
watch(
  () => [props.answersDocId, props.userDocId, props.taskId],
  () => refetch(),
  { immediate: true },
)

async function refetch() {
  if (!props.answersDocId || !props.userDocId || props.taskId == null) return
  loading.value = true
  try {
    const arr = await controller.getByAnswersDocIdandUserDocIdandTaskId(
      props.answersDocId,
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
  } else if (format.value === 'pdf') {
    // 🔶 Open preview with editor, then user hits Download
    previewRuns.value = sel
    showPreview.value = true
    // toast('PDF export coming soon', 'orange')
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
        answersDocId: props.answersDocId,
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
        answersDocId: props.answersDocId,
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
    'answersDocId',
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
    answersDocId: run.answersDocId,
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

/* Build simple rows for the HTML table preview */
function buildPreviewRows(run) {
  const rows = []
  const ev = (run?.evaluator?.segments || []).map((s, idx) => ({
    key: `e-${idx}`,
    role: 'evaluator',
    startSec: Number(s.start) || 0,
    endSec: Number(s.end) || 0,
    start: formatClock(s.start),
    end: formatClock(s.end),
    text: s.text || '',
  }))
  const mod = (run?.moderator?.segments || []).map((s, idx) => ({
    key: `m-${idx}`,
    role: 'moderator',
    startSec: Number(s.start) || 0,
    endSec: Number(s.end) || 0,
    start: formatClock(s.start),
    end: formatClock(s.end),
    text: s.text || '',
  }))
  return [...ev, ...mod].sort((a, b) => a.startSec - b.startSec)
}

/* ---------- Make + download PDF (jsPDF + autoTable) ---------- */
async function downloadPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  // === Logo (load once) ===
  const logo = await loadLogo('/brand/logo_full.png', 10) // target height = 10pt

  // THEME
  const M = 48 // margin
  const PAGE_W = doc.internal.pageSize.getWidth()
  const PAGE_H = doc.internal.pageSize.getHeight()
  const CONTENT_W = PAGE_W - M * 2
  const COLORS = {
    text: [34, 34, 34],
    sub: [120, 120, 120],
    line: [255, 163, 38], // orange accent
    tableHead: [255, 163, 38], // orange head
    zebra: [246, 246, 246], // striped rows
    cardBg: [255, 247, 234], // summary card bg
    border: [230, 230, 230],
  }

  let y = M

  // ===== HEADER =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('Session PDF Report', PAGE_W / 2, y, { align: 'center' })
  y += 24

  // Meta row
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.sub)
  doc.setFontSize(11)
  doc.text(`Date: ${pdfMeta.value.date || '-'}`, M, y)
  doc.text(`Moderator: ${pdfMeta.value.moderator || '-'}`, M + 220, y)
  doc.text(`User: ${pdfMeta.value.user || '-'}`, M + 420, y)
  y += 16

  // Thin separator line
  // drawRule(doc, M, y, PAGE_W - M, y, COLORS.border, 0.6)
  y += 12
  doc.setTextColor(...COLORS.text)

  // ===== EXECUTIVE SUMMARY (padded card) =====
  const summaryPlain = stripHtml(pdfSummaryHtml.value || '')
  if (summaryPlain.trim()) {
    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Executive Summary', M, y)
    y += 8

    // Card box
    const cardPad = 10
    const summaryLines = doc.splitTextToSize(
      summaryPlain,
      CONTENT_W - cardPad * 2,
    )
    const cardH = summaryLines.length * 13 + cardPad * 2

    ensurePageSpace(cardH + 12)
    drawFilledRect(doc, M, y, CONTENT_W, cardH, COLORS.cardBg, COLORS.border)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(summaryLines, M + cardPad, y + cardPad + 10)
    y += cardH + 16
  }

  // ===== TASKS (runs) =====
  const sel = previewRuns.value // selected runs from your preview dialog
  sel.forEach((run, idx) => {
    // Section header title + line
    ensurePageSpace(48)
    y += 14
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    const when = formatDate(run.createdAt)
    doc.text(
      `Task (${idx + 1})  •  ${run.provider}/${run.model}  •  ${when}`,
      M,
      y,
    )

    ensurePageSpace(32)

    // Table body (sorted by start time)
    const rows = [
      ...(Array.isArray(run?.evaluator?.segments)
        ? run.evaluator.segments.map((s) => ({
            role: 'evaluator',
            start: formatClock(s.start),
            end: formatClock(s.end),
            text: s.text || '',
            startSec: Number(s.start) || 0,
          }))
        : []),
      ...(Array.isArray(run?.moderator?.segments)
        ? run.moderator.segments.map((s) => ({
            role: 'moderator',
            start: formatClock(s.start),
            end: formatClock(s.end),
            text: s.text || '',
            startSec: Number(s.start) || 0,
          }))
        : []),
    ].sort((a, b) => a.startSec - b.startSec)

    autoTable(doc, {
      startY: y + 6,
      head: [['Role', 'Start', 'End', 'Text']],
      body: rows.map((r) => [r.role, r.start, r.end, r.text]),
      styles: { fontSize: 10, cellPadding: 6, valign: 'top' },
      headStyles: { fillColor: COLORS.tableHead, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: COLORS.zebra },
      columnStyles: {
        0: { cellWidth: 90 }, // Role
        1: { cellWidth: 60 }, // Start
        2: { cellWidth: 60 }, // End
        3: { cellWidth: 'auto' }, // Text
      },
      margin: { left: M, right: M },
      theme: 'grid',
    })

    y = doc.lastAutoTable.finalY + 18
  })

  // ===== FOOTER (page numbers + hairline) =====
  addPageNumbers(doc, M, COLORS, logo)

  const fn =
    scope.value === 'latest'
      ? fileName(
          `transcription_latest_task-${props.taskId}_user-${props.userDocId}`,
          'pdf',
        )
      : fileName(
          `transcriptions_task-${props.taskId}_user-${props.userDocId}`,
          'pdf',
        )

  doc.save(fn)
  toast('PDF downloaded', 'green')
  showPreview.value = false

  // --- Helpers (closure uses outer vars) ---
  function ensurePageSpace(h) {
    if (y + h > PAGE_H - M) {
      doc.addPage()
      y = M
    }
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

function stripHtml(html) {
  const el = document.createElement('div')
  el.innerHTML = html || ''
  return (el.textContent || el.innerText || '').replace(/\u00A0/g, ' ')
}

function pad2(n) {
  return String(Math.floor(n)).padStart(2, '0')
}

function formatClock(sec) {
  const s = Number(sec) || 0
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${pad2(m)}:${pad2(r)}`
}

function drawRule(doc, x1, y1, x2, y2, rgb = [200, 200, 200], w = 0.6) {
  doc.setDrawColor(...rgb)
  doc.setLineWidth(w)
  doc.line(x1, y1, x2, y2)
}

function drawFilledRect(doc, x, y, w, h, fillRgb, borderRgb) {
  doc.setFillColor(...fillRgb)
  doc.setDrawColor(...borderRgb)
  doc.setLineWidth(0.6)
  doc.rect(x, y, w, h, 'FD')
}

function addPageNumbers(doc, M, COLORS, logo) {
  const pageCount = doc.getNumberOfPages()
  const footerH = 30
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()

    // hairline
    drawRule(doc, M, H - footerH, W - M, H - footerH, COLORS.border, 0.6)

    // logo on the left (centered vertically in footer)
    if (logo?.dataUrl) {
      const y = H - footerH + (footerH - logo.h) / 2
      doc.addImage(logo.dataUrl, 'PNG', M, y, logo.w, logo.h)
    }

    // page number on the right
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(`Page ${i} of ${pageCount}`, W - M, H - 12, { align: 'right' })
  }
}

async function loadImageAsDataURL(url) {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    // pick correct encoder
    const isPng = (blob.type || '').includes('png')
    const isJpg =
      (blob.type || '').includes('jpeg') || (blob.type || '').includes('jpg')
    if (!isPng && !isJpg) {
      console.warn('Logo is not PNG/JPEG. Content-Type:', blob.type)
    }
    const reader = new FileReader()
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    return dataUrl // e.g. "data:image/png;base64,...."
  } catch (e) {
    console.error('Failed to load logo for PDF:', e)
    return null
  }
}

async function loadLogo(url, targetH = 16) {
  const dataUrl = await loadImageAsDataURL(url)
  if (!dataUrl) return null
  const { w, h } = await getImageSize(dataUrl)
  const ratio = w / h || 1
  return { dataUrl, w: targetH * ratio, h: targetH }
}

function getImageSize(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = dataUrl
  })
}
</script>
