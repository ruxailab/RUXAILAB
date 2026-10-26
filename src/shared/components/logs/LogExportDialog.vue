<template>
  <v-btn
    prepend-icon="mdi-download-outline"
    variant="outlined"
    size="small"
    data-test="open-export"
    @click="open = true"
  >
    Export
  </v-btn>

  <v-dialog v-model="open" max-width="460" :persistent="running">
    <v-card>
      <v-card-title>Export logs</v-card-title>
      <v-card-text>
        <p class="export-note">
          Files contain participant labels such as P-001, never names, emails or
          account IDs.
        </p>

        <v-radio-group
          v-if="filterCount"
          v-model="scope"
          label="Events"
          density="compact"
          :disabled="running"
          hide-details
        >
          <v-radio
            :label="`Current filters (${filterCount} active)`"
            value="filtered"
          />
          <v-radio label="Whole study" value="study" />
        </v-radio-group>
        <p v-else class="export-scope">All events in this study</p>

        <v-radio-group
          v-model="format"
          label="Format"
          density="compact"
          inline
          :disabled="running"
          hide-details
        >
          <v-radio label="CSV" value="csv" />
          <v-radio label="JSON" value="json" />
        </v-radio-group>

        <div v-if="running" class="export-progress" role="status">
          <v-progress-linear
            :model-value="progressPercent"
            :indeterminate="progressPercent === null"
            color="secondary"
          />
          <span>{{ progressText }}</span>
        </div>
        <p v-if="errorMessage" class="export-error" role="alert">
          {{ errorMessage }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="running" @click="open = false">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          data-test="start-export"
          :loading="running"
          :disabled="running"
          @click="startExport"
        >
          Download
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { downloadBlob, exportStudyLogs } from '@/shared/services/studyLogExport'

const props = defineProps({
  studyId: { type: String, required: true },
  filters: { type: Object, default: () => ({}) },
  filterCount: { type: Number, default: 0 },
})

const open = ref(false)
const scope = ref('filtered')
const format = ref('csv')
const running = ref(false)
const progress = ref({ exported: 0, total: null })
const errorMessage = ref('')

const progressPercent = computed(() =>
  progress.value.total
    ? Math.min(100, (progress.value.exported / progress.value.total) * 100)
    : null,
)
const progressText = computed(() => {
  const exported = progress.value.exported.toLocaleString()
  return progress.value.total === null
    ? `Preparing export… ${exported} events`
    : `Exporting ${exported} of ${progress.value.total.toLocaleString()} events`
})

const exportError = (error) => {
  const code = String(error?.code || '').replace(/^functions\//, '')
  if (code === 'permission-denied' || code === 'unauthenticated') {
    return 'You do not have permission to export these logs.'
  }
  if (code === 'failed-precondition') {
    return 'This filter combination is unavailable because its Firestore index is not deployed.'
  }
  return 'The export could not be completed. Try again.'
}

const startExport = async () => {
  running.value = true
  errorMessage.value = ''
  progress.value = { exported: 0, total: null }
  try {
    const { blob, filename } = await exportStudyLogs({
      studyId: props.studyId,
      format: format.value,
      filters:
        props.filterCount && scope.value === 'filtered' ? props.filters : {},
      onProgress: (value) => {
        progress.value = value
      },
    })
    downloadBlob(blob, filename)
    open.value = false
  } catch (error) {
    errorMessage.value = exportError(error)
  } finally {
    running.value = false
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    errorMessage.value = ''
    scope.value = 'filtered'
  }
})
</script>

<style scoped>
.export-note,
.export-scope {
  margin: 0 0 12px;
  color: var(--logs-muted, #657187);
  font-size: 0.86rem;
}
.export-scope {
  color: inherit;
}
.export-progress {
  display: grid;
  gap: 6px;
  margin-top: 14px;
  font-size: 0.84rem;
}
.export-error {
  margin: 12px 0 0;
  color: #a91e34;
  font-size: 0.86rem;
}
</style>
