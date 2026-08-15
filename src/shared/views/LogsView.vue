<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold">Activity logs</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Times are shown in {{ timezone }}.
        </p>
      </div>
      <div class="d-flex align-center ga-3">
        <span v-if="updatedAt" class="text-caption text-medium-emphasis">
          Updated {{ formatTime(updatedAt) }}
        </span>
        <v-btn
          prepend-icon="mdi-refresh"
          variant="outlined"
          :loading="loading"
          @click="refresh"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <v-alert type="warning" variant="tonal" class="mb-4">
      Activity delivery is asynchronous, may be delayed, and may be incomplete.
    </v-alert>

    <v-card variant="outlined" class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" lg="3">
            <v-autocomplete
              v-model="draft.participantLabel"
              :items="participantLabels"
              label="Participant"
              clearable
              hide-details="auto"
              @update:search="searchParticipants"
            />
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-select
              v-model="draft.eventType"
              :items="eventTypes"
              label="Event type"
              clearable
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-select
              v-model="draft.level"
              :items="levels"
              label="Level"
              clearable
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-select
              v-model="draft.source"
              :items="sources"
              label="Source"
              clearable
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-text-field
              v-model="draft.startDate"
              type="date"
              label="From date"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-text-field
              v-model="draft.endDate"
              type="date"
              label="Through date"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" lg="6" class="d-flex align-end ga-2">
            <v-btn color="primary" :loading="loading" @click="applyFilters">
              Apply filters
            </v-btn>
            <v-btn variant="text" :disabled="loading" @click="clearFilters">
              Clear
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-card variant="outlined">
      <v-progress-linear v-if="loading" indeterminate color="primary" />
      <template v-if="currentEvents.length">
        <div v-if="!smAndDown" class="table-scroll">
          <table class="log-table">
            <thead>
              <tr>
                <th>Occurrence</th>
                <th>Level</th>
                <th>Message</th>
                <th>Participant</th>
                <th>Layer</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(event, index) in currentEvents"
                :key="index"
                tabindex="0"
                class="log-row"
                @click="selectedEvent = event"
                @keyup.enter="selectedEvent = event"
                @keyup.space.prevent="selectedEvent = event"
              >
                <td>{{ formatDateTime(event.occurredAt) }}</td>
                <td><v-chip size="small">{{ event.level }}</v-chip></td>
                <td>
                  <div class="font-weight-medium">{{ event.message }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ event.eventType }}
                  </div>
                </td>
                <td>{{ event.participantLabel }}</td>
                <td><v-chip size="small" variant="tonal">{{ event.layer }}</v-chip></td>
              </tr>
            </tbody>
          </table>
        </div>

        <v-list v-else lines="three">
          <v-list-item
            v-for="(event, index) in currentEvents"
            :key="index"
            tabindex="0"
            @click="selectedEvent = event"
            @keyup.enter="selectedEvent = event"
            @keyup.space.prevent="selectedEvent = event"
          >
            <template #prepend>
              <v-icon>mdi-text-box-search-outline</v-icon>
            </template>
            <v-list-item-title>{{ event.message }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ event.level }} · {{ event.participantLabel }} ·
              {{ formatDateTime(event.occurredAt) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>

      <v-empty-state
        v-else-if="!loading && !errorMessage"
        icon="mdi-text-box-search-outline"
        title="No activity found"
        text="No events match the applied filters."
      />

      <v-divider />
      <v-card-actions class="flex-wrap ga-2">
        <v-select
          v-model="pageSize"
          :items="[10, 20, 50]"
          label="Rows"
          density="compact"
          hide-details
          style="max-width: 110px"
        />
        <v-spacer />
        <span class="text-body-2">{{ visibleRange }}</span>
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          aria-label="Previous page"
          :disabled="loading || pageIndex === 0"
          @click="previousPage"
        />
        <v-btn
          icon="mdi-chevron-right"
          variant="text"
          aria-label="Next page"
          :disabled="loading || !currentPage?.hasNextPage"
          @click="nextPage"
        />
      </v-card-actions>
    </v-card>

    <v-navigation-drawer
      :model-value="Boolean(selectedEvent)"
      location="right"
      temporary
      :width="smAndDown ? '100%' : 440"
      @update:model-value="(value) => !value && (selectedEvent = null)"
    >
      <template v-if="selectedEvent">
        <div class="d-flex align-start pa-4 ga-2">
          <div class="flex-grow-1">
            <div class="text-h6">{{ selectedEvent.message }}</div>
            <div class="d-flex flex-wrap ga-1 mt-2">
              <v-chip size="small">{{ selectedEvent.eventType }}</v-chip>
              <v-chip size="small">{{ selectedEvent.level }}</v-chip>
              <v-chip size="small">{{ selectedEvent.layer }}</v-chip>
              <v-chip size="small">{{ selectedEvent.source }}</v-chip>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            aria-label="Close details"
            @click="selectedEvent = null"
          />
        </div>
        <v-divider />
        <v-list>
          <v-list-item title="Participant" :subtitle="selectedEvent.participantLabel" />
          <v-list-item title="Occurred" :subtitle="formatDateTime(selectedEvent.occurredAt)" />
          <v-list-item title="Received" :subtitle="formatDateTime(selectedEvent.receivedAt)" />
          <v-list-item title="Delivery delay" :subtitle="deliveryDelay(selectedEvent)" />
          <v-list-item
            v-if="selectedEvent.timeQuality"
            title="Time quality"
            :subtitle="selectedEvent.timeQuality"
          />
          <v-list-item
            v-if="selectedEvent.actorRole"
            title="Actor role"
            :subtitle="selectedEvent.actorRole"
          />
        </v-list>
        <v-divider />
        <div class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-2">Event details</div>
          <dl v-if="detailEntries.length" class="detail-grid">
            <template v-for="([key, value]) in detailEntries" :key="key">
              <dt>{{ readableKey(key) }}</dt>
              <dd>{{ value }}</dd>
            </template>
          </dl>
          <p v-else class="text-body-2 text-medium-emphasis mb-0">
            No event-specific details.
          </p>
        </div>
      </template>
    </v-navigation-drawer>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { db } from '@/app/plugins/firebase'
import {
  getParticipantLabels,
  getStudyLogCount,
  getStudyLogPage,
  localDateRange,
} from '@/shared/services/studyLogQuery'

const props = defineProps({ id: { type: String, required: true } })
const { smAndDown } = useDisplay()
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time'
const eventTypes = [
  'STUDY_VIEW_OPENED',
  'ANSWER_EDITED',
  'CONSENT_ACCEPTED',
  'TASK_ATTEMPT_FINISHED',
  'STUDY_SUBMITTED',
]
const levels = ['info', 'warning', 'error']
const sources = ['study-client', 'logging-service']
const emptyFilters = () => ({
  participantLabel: null,
  eventType: null,
  level: null,
  source: null,
  startDate: '',
  endDate: '',
})
const draft = reactive(emptyFilters())
const appliedFilters = ref({})
const participantLabels = ref([])
const pages = ref([])
const pageIndex = ref(0)
const pageSize = ref(20)
const totalCount = ref(null)
const countCache = new Map()
const loading = ref(false)
const errorMessage = ref('')
const updatedAt = ref(null)
const selectedEvent = ref(null)
let participantTimer

const currentPage = computed(() => pages.value[pageIndex.value] || null)
const currentEvents = computed(() => currentPage.value?.events || [])
const visibleRange = computed(() => {
  if (!currentEvents.value.length) return totalCount.value === 0 ? '0 of 0' : '0 shown'
  const start = (currentPage.value.number - 1) * pageSize.value + 1
  const end = start + currentEvents.value.length - 1
  return totalCount.value === null
    ? `${start}–${end} shown`
    : `${start}–${end} of ${totalCount.value.toLocaleString()}`
})
const detailEntries = computed(() =>
  Object.entries(selectedEvent.value?.details || {}),
)

const filterKey = () =>
  JSON.stringify(appliedFilters.value, (_key, value) =>
    value instanceof Date ? value.toISOString() : value,
  )

const queryError = (error) =>
  error?.code === 'failed-precondition'
    ? 'This filter combination is unavailable because its Firestore index is not deployed.'
    : 'Activity logs could not be loaded. Check your access and try again.'

const replaceFirstPage = async ({ recount = false, forceCount = false } = {}) => {
  loading.value = true
  errorMessage.value = ''
  const countKey = filterKey()
  try {
    const pagePromise = getStudyLogPage({
      db,
      studyId: props.id,
      filters: appliedFilters.value,
      pageSize: pageSize.value,
    })
    const shouldCount = recount && (forceCount || !countCache.has(countKey))
    const countPromise = shouldCount
      ? getStudyLogCount({ db, studyId: props.id, filters: appliedFilters.value })
      : Promise.resolve(countCache.get(countKey) ?? totalCount.value)
    const [pageResult, countResult] = await Promise.allSettled([
      pagePromise,
      countPromise,
    ])
    if (pageResult.status === 'rejected') throw pageResult.reason
    pages.value = [{ ...pageResult.value, number: 1 }]
    pageIndex.value = 0
    if (countResult.status === 'fulfilled' && countResult.value !== undefined) {
      totalCount.value = countResult.value
      countCache.set(countKey, countResult.value)
    } else if (!countCache.has(countKey)) {
      totalCount.value = null
    }
    updatedAt.value = new Date()
  } catch (error) {
    errorMessage.value = queryError(error)
  } finally {
    loading.value = false
  }
}

const applyFilters = async () => {
  try {
    appliedFilters.value = {
      ...Object.fromEntries(
        ['participantLabel', 'eventType', 'level', 'source'].flatMap((key) =>
          draft[key] ? [[key, draft[key]]] : [],
        ),
      ),
      ...localDateRange(draft.startDate, draft.endDate),
    }
  } catch {
    errorMessage.value = 'The end date must not be before the start date.'
    return
  }
  await replaceFirstPage({ recount: true })
}

const clearFilters = async () => {
  Object.assign(draft, emptyFilters())
  appliedFilters.value = {}
  await replaceFirstPage({ recount: true })
}

const refresh = () => replaceFirstPage({ recount: true, forceCount: true })

const nextPage = async () => {
  if (pages.value[pageIndex.value + 1]) {
    pageIndex.value++
    return
  }
  if (!currentPage.value?.hasNextPage) return
  loading.value = true
  errorMessage.value = ''
  try {
    const next = await getStudyLogPage({
      db,
      studyId: props.id,
      filters: appliedFilters.value,
      pageSize: pageSize.value,
      after: currentPage.value.lastCursor,
    })
    pages.value.push({ ...next, number: currentPage.value.number + 1 })
    if (pages.value.length > 10) pages.value.shift()
    else pageIndex.value++
  } catch (error) {
    errorMessage.value = queryError(error)
  } finally {
    loading.value = false
  }
}

const previousPage = () => {
  if (pageIndex.value > 0) pageIndex.value--
}

const searchParticipants = (prefix) => {
  clearTimeout(participantTimer)
  participantTimer = setTimeout(async () => {
    try {
      participantLabels.value = await getParticipantLabels({
        db,
        studyId: props.id,
        prefix: prefix || '',
      })
    } catch {
      participantLabels.value = []
    }
  }, 250)
}

const toDate = (value) => value?.toDate?.() || (value ? new Date(value) : null)
const formatDateTime = (value) => {
  const date = toDate(value)
  return date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(date) : 'Unavailable'
}
const formatTime = (value) =>
  new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(value)
const deliveryDelay = (event) => {
  const occurred = toDate(event.occurredAt)
  const received = toDate(event.receivedAt)
  if (!occurred || !received) return 'Unavailable'
  return `${Math.max(0, received - occurred).toLocaleString()} ms`
}
const readableKey = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase())

watch(pageSize, () => replaceFirstPage())
onMounted(async () => {
  searchParticipants('')
  await replaceFirstPage({ recount: true })
})
onBeforeUnmount(() => clearTimeout(participantTimer))
</script>

<style scoped>
.table-scroll { overflow-x: auto; }
.log-table { width: 100%; border-collapse: collapse; }
.log-table th, .log-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid rgba(0, 0, 0, 0.12); }
.log-row { cursor: pointer; }
.log-row:hover, .log-row:focus-visible { background: rgba(var(--v-theme-primary), 0.06); outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -2px; }
.detail-grid { display: grid; grid-template-columns: minmax(120px, auto) 1fr; gap: 8px 16px; }
.detail-grid dt { font-weight: 600; }
.detail-grid dd { margin: 0; overflow-wrap: anywhere; }
</style>
