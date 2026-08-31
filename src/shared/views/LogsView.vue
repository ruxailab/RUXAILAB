<template>
  <v-container fluid class="logs-page">
    <div class="logs-shell">
      <header class="study-context">
        <div class="study-context__icon" aria-hidden="true">
          <v-icon size="30">mdi-text-box-search-outline</v-icon>
        </div>
        <div class="study-context__copy">
          <div class="study-context__eyebrow">Log explorer</div>
          <h1>{{ studyTitle }}</h1>
          <p>Study activity and delivery trace</p>
          <div class="study-context__chips">
            <span class="context-chip">
              <v-icon size="15">{{ studyTypeIcon }}</v-icon>
              {{ studyTypeLabel }}
            </span>
            <span v-if="totalCount !== null" class="context-chip">
              <v-icon size="15">mdi-format-list-bulleted</v-icon>
              {{ totalCount.toLocaleString() }}
              {{ totalCount === 1 ? 'event' : 'events' }}
            </span>
          </div>
        </div>
        <div class="study-context__time">
          <v-icon size="18">mdi-clock-outline</v-icon>
          <span>Times shown in {{ timezone }}</span>
        </div>
      </header>

      <div class="delivery-notice" role="status">
        <v-icon size="20" aria-hidden="true">mdi-information-outline</v-icon>
        <span>
          Activity delivery is asynchronous and may be delayed or incomplete.
        </span>
      </div>

      <section class="filter-surface" aria-labelledby="log-filter-heading">
        <div class="surface-heading">
          <h2 id="log-filter-heading">Filters</h2>
          <span v-if="activeFilterCount" class="filter-count">
            {{ activeFilterCount }} active
          </span>
          <v-btn
            class="mobile-filter-toggle"
            variant="text"
            size="small"
            :prepend-icon="
              filtersExpanded ? 'mdi-chevron-up' : 'mdi-tune-variant'
            "
            :aria-expanded="filtersExpanded"
            @click="filtersExpanded = !filtersExpanded"
          >
            {{ filtersExpanded ? 'Hide' : 'Show' }}
          </v-btn>
        </div>

        <div v-show="filtersExpanded" class="filter-layout">
          <fieldset class="filter-group filter-group--primary">
            <legend>Activity</legend>
            <div class="primary-filter-grid">
              <v-autocomplete
                v-model="draft.participantLabel"
                :items="participantLabels"
                label="Participant"
                prepend-inner-icon="mdi-account-outline"
                clearable
                density="compact"
                variant="outlined"
                hide-details="auto"
                @update:search="searchParticipants"
              />
              <v-select
                v-model="draft.eventType"
                :items="eventTypes"
                item-title="title"
                item-value="value"
                label="Event type"
                prepend-inner-icon="mdi-shape-outline"
                clearable
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <v-select
                v-model="draft.level"
                :items="levels"
                label="Level"
                prepend-inner-icon="mdi-alert-circle-outline"
                clearable
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <v-select
                v-model="draft.source"
                :items="sources"
                item-title="title"
                item-value="value"
                label="Source"
                prepend-inner-icon="mdi-source-branch"
                clearable
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </div>
          </fieldset>

          <div class="filter-lower-row">
            <fieldset class="filter-group filter-group--dates">
              <legend>Date range</legend>
              <div class="date-filter-grid">
                <v-text-field
                  v-model="draft.startDate"
                  type="date"
                  label="From date"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
                <v-text-field
                  v-model="draft.endDate"
                  type="date"
                  label="Through date"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </div>
            </fieldset>

            <div class="filter-actions">
              <v-btn
                color="primary"
                prepend-icon="mdi-filter-outline"
                :loading="loading"
                @click="applyFilters"
              >
                Apply filters
              </v-btn>
              <v-btn
                variant="text"
                :disabled="loading || !hasDraftFilters"
                @click="clearFilters"
              >
                Clear
              </v-btn>
            </div>
          </div>
        </div>
      </section>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
        class="logs-error"
      >
        {{ errorMessage }}
      </v-alert>

      <section class="events-surface" aria-labelledby="log-events-heading">
        <div class="events-toolbar">
          <div class="events-title-row">
            <h2 id="log-events-heading">Recorded activity</h2>
            <span class="range-label">{{ visibleRange }}</span>
          </div>
          <div class="refresh-area">
            <span v-if="updatedAt" class="updated-at">
              Updated {{ formatTime(updatedAt) }}
            </span>
            <v-btn
              prepend-icon="mdi-refresh"
              variant="outlined"
              size="small"
              :loading="loading"
              @click="refresh"
            >
              Refresh
            </v-btn>
          </div>
        </div>

        <v-progress-linear v-if="loading" indeterminate color="secondary" />

        <template v-if="currentEvents.length">
          <div v-if="!smAndDown" class="table-scroll">
            <table class="log-table">
              <colgroup>
                <col class="occurrence-column" />
                <col class="participant-column" />
                <col class="event-column" />
                <col class="level-column" />
                <col class="source-column" />
                <col class="layer-column" />
                <col class="open-column" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Occurrence</th>
                  <th scope="col">Participant</th>
                  <th scope="col">Event</th>
                  <th scope="col">Level</th>
                  <th scope="col" class="source-column">Source</th>
                  <th scope="col" class="layer-column">Layer</th>
                  <th scope="col"><span class="sr-only">Open details</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(event, index) in currentEvents"
                  :key="event.eventId || index"
                  tabindex="0"
                  role="button"
                  class="log-row"
                  :class="`log-row--${event.level || 'info'}`"
                  :aria-label="`View details for ${event.message}, participant ${event.participantLabel}, ${formatDateTime(event.occurredAt)}`"
                  @click="selectedEvent = event"
                  @keyup.enter="selectedEvent = event"
                  @keyup.space.prevent="selectedEvent = event"
                >
                  <td class="occurrence-cell">
                    <span>{{ formatDate(event.occurredAt) }}</span>
                    <strong>{{ formatClock(event.occurredAt) }}</strong>
                  </td>
                  <td>
                    <span
                      class="participant-token"
                      :class="participantTone(event.participantLabel)"
                    >
                      <span
                        class="participant-token__anchor"
                        aria-hidden="true"
                      >
                        {{ participantNumber(event.participantLabel) }}
                      </span>
                      <span class="participant-token__label">
                        {{ event.participantLabel }}
                      </span>
                    </span>
                  </td>
                  <td class="message-cell">
                    <div>{{ event.message }}</div>
                    <span>{{ formatEventType(event.eventType) }}</span>
                  </td>
                  <td>
                    <span
                      class="level-indicator"
                      :class="`level-indicator--${event.level || 'info'}`"
                    >
                      <v-icon size="14">{{ levelIcon(event.level) }}</v-icon>
                      {{ event.level }}
                    </span>
                  </td>
                  <td class="source-cell source-column">
                    {{ formatIdentifier(event.source) || 'Unavailable' }}
                  </td>
                  <td class="layer-column">
                    <span class="layer-label">{{ event.layer }}</span>
                  </td>
                  <td class="open-cell">
                    <v-icon size="19">mdi-chevron-right</v-icon>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="mobile-event-list">
            <button
              v-for="(event, index) in currentEvents"
              :key="event.eventId || index"
              type="button"
              class="mobile-event"
              :class="`mobile-event--${event.level || 'info'}`"
              @click="selectedEvent = event"
            >
              <span class="mobile-event__topline">
                <span
                  class="participant-token"
                  :class="participantTone(event.participantLabel)"
                >
                  <span class="participant-token__anchor" aria-hidden="true">
                    {{ participantNumber(event.participantLabel) }}
                  </span>
                  <span class="participant-token__label">
                    {{ event.participantLabel }}
                  </span>
                </span>
                <span>{{ formatDateTime(event.occurredAt) }}</span>
              </span>
              <strong>{{ event.message }}</strong>
              <span class="mobile-event__meta">
                <span>{{ formatEventType(event.eventType) }}</span>
                <span
                  class="level-indicator"
                  :class="`level-indicator--${event.level || 'info'}`"
                >
                  <v-icon size="14">{{ levelIcon(event.level) }}</v-icon>
                  {{ event.level }}
                </span>
              </span>
              <span class="mobile-event__context">
                {{ formatIdentifier(event.source) || 'Unavailable' }} ·
                {{ event.layer }}
              </span>
            </button>
          </div>
        </template>

        <div v-else-if="!loading && !errorMessage" class="empty-logs">
          <div class="empty-logs__icon">
            <v-icon size="34">mdi-text-box-search-outline</v-icon>
          </div>
          <h3>No activity found</h3>
          <p>No events match the applied filters.</p>
        </div>

        <div class="pagination-bar">
          <v-select
            v-model="pageSize"
            :items="[10, 20, 50]"
            label="Rows"
            density="compact"
            variant="outlined"
            hide-details
            class="rows-select"
          />
          <span>{{ visibleRange }}</span>
          <div class="pagination-actions">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              size="small"
              aria-label="Previous page"
              :disabled="loading || pageIndex === 0"
              @click="previousPage"
            />
            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              size="small"
              aria-label="Next page"
              :disabled="loading || !currentPage?.hasNextPage"
              @click="nextPage"
            />
          </div>
        </div>
      </section>
    </div>

    <v-navigation-drawer
      :model-value="Boolean(selectedEvent)"
      location="right"
      temporary
      :width="smAndDown ? '100%' : 460"
      class="event-drawer"
      @update:model-value="(value) => !value && (selectedEvent = null)"
    >
      <template v-if="selectedEvent">
        <div class="drawer-heading">
          <div class="drawer-heading__icon">
            <v-icon size="22">{{ levelIcon(selectedEvent.level) }}</v-icon>
          </div>
          <div class="drawer-heading__copy">
            <div class="surface-kicker">Event details</div>
            <h2>{{ selectedEvent.message }}</h2>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            aria-label="Close details"
            @click="selectedEvent = null"
          />
        </div>

        <div class="drawer-badges">
          <span
            class="level-badge"
            :class="`level-badge--${selectedEvent.level || 'info'}`"
            >{{ selectedEvent.level }}</span
          >
          <span class="layer-badge">{{ selectedEvent.layer }}</span>
          <span class="drawer-source">
            {{ formatIdentifier(selectedEvent.source) }}
          </span>
        </div>

        <dl class="event-summary">
          <div>
            <dt>Participant</dt>
            <dd>
              <span
                class="participant-token"
                :class="participantTone(selectedEvent.participantLabel)"
              >
                <span class="participant-token__anchor" aria-hidden="true">
                  {{ participantNumber(selectedEvent.participantLabel) }}
                </span>
                <span class="participant-token__label">
                  {{ selectedEvent.participantLabel }}
                </span>
              </span>
            </dd>
          </div>
          <div>
            <dt>Event type</dt>
            <dd>{{ formatEventType(selectedEvent.eventType) }}</dd>
          </div>
          <div>
            <dt>Occurred</dt>
            <dd>{{ formatDateTime(selectedEvent.occurredAt) }}</dd>
          </div>
          <div>
            <dt>Received</dt>
            <dd>{{ formatDateTime(selectedEvent.receivedAt) }}</dd>
          </div>
          <div>
            <dt>Delivery delay</dt>
            <dd>{{ deliveryDelay(selectedEvent) }}</dd>
          </div>
          <div v-if="selectedEvent.timeQuality">
            <dt>Time quality</dt>
            <dd>{{ selectedEvent.timeQuality }}</dd>
          </div>
          <div v-if="selectedEvent.actorRole">
            <dt>Actor role</dt>
            <dd>{{ selectedEvent.actorRole }}</dd>
          </div>
        </dl>

        <section
          class="drawer-details"
          aria-labelledby="event-specific-heading"
        >
          <h3 id="event-specific-heading">Event-specific data</h3>
          <p v-if="selectedEvent.eventType === 'ANSWER_EDITED'">
            Counts summarize browser input activity; response text is never
            logged. Active input span runs from the first to the last input
            event, not the total time spent on the question.
          </p>
          <dl v-if="detailEntries.length" class="detail-grid">
            <template v-for="[key, value] in detailEntries" :key="key">
              <dt>{{ detailLabel(key) }}</dt>
              <dd>{{ formatDetailValue(key, value) }}</dd>
            </template>
          </dl>
          <p v-else>No event-specific details.</p>
        </section>
      </template>
    </v-navigation-drawer>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import { db } from '@/app/plugins/firebase'
import {
  getParticipantLabels,
  getStudyLogCount,
  getStudyLogPage,
  localDateRange,
} from '@/shared/services/studyLogQuery'

const props = defineProps({ id: { type: String, required: true } })
const store = useStore()
const { smAndDown, xs } = useDisplay()
const timezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time'
const formatIdentifier = (value = '') =>
  value
    .toLowerCase()
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
const filterOptions = (values) =>
  values.map((value) => ({ title: formatIdentifier(value), value }))
const participantSequence = (label = '') => /\d+/.exec(label)?.[0]
const participantNumber = (label) => {
  const sequence = participantSequence(label)
  return sequence ? String(Number(sequence)).padStart(2, '0') : '--'
}
const participantTone = (label) => {
  const sequence = participantSequence(label)
  const seed = sequence
    ? Number(sequence)
    : [...String(label)].reduce(
        (total, character) => total + character.charCodeAt(0),
        0,
      )
  return `participant-token--tone-${seed % 6}`
}
const eventTypes = filterOptions([
  'STUDY_VIEW_OPENED',
  'ANSWER_EDITED',
  'CONSENT_ACCEPTED',
  'TASK_ATTEMPT_FINISHED',
  'STUDY_SUBMITTED',
])
const levels = ['info', 'warning', 'error']
const sources = filterOptions(['study-client', 'logging-service'])
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
const filtersExpanded = ref(true)
let participantTimer

const study = computed(() => store.getters.test || {})
const studyTitle = computed(
  () => study.value.testTitle || study.value.title || 'Study activity',
)
const studyTypeLabel = computed(() => {
  if (study.value.testType === 'HEURISTIC') return 'Heuristic evaluation'
  if (study.value.subType === 'USER_MODERATED') return 'Moderated user test'
  if (study.value.testType === 'USER') return 'Unmoderated user test'
  return 'Research study'
})
const studyTypeIcon = computed(() =>
  study.value.testType === 'HEURISTIC'
    ? 'mdi-clipboard-search-outline'
    : 'mdi-account-check-outline',
)
const hasDraftFilters = computed(() => Object.values(draft).some(Boolean))
const activeFilterCount = computed(
  () =>
    Object.keys(appliedFilters.value).filter((key) => key !== 'endBefore')
      .length,
)
const currentPage = computed(() => pages.value[pageIndex.value] || null)
const currentEvents = computed(() => currentPage.value?.events || [])
const visibleRange = computed(() => {
  if (!currentEvents.value.length)
    return totalCount.value === 0 ? '0 of 0' : '0 shown'
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

const replaceFirstPage = async ({
  recount = false,
  forceCount = false,
} = {}) => {
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
      ? getStudyLogCount({
          db,
          studyId: props.id,
          filters: appliedFilters.value,
        })
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
    } else {
      totalCount.value = null
      if (shouldCount) countCache.delete(countKey)
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
  return date
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date)
    : 'Unavailable'
}
const formatDate = (value) => {
  const date = toDate(value)
  return date
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
    : 'Unavailable'
}
const formatClock = (value) => {
  const date = toDate(value)
  return date
    ? new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' }).format(date)
    : ''
}
const formatTime = (value) =>
  new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(value)
const formatEventType = formatIdentifier
const levelIcon = (level) =>
  ({
    warning: 'mdi-alert-outline',
    error: 'mdi-alert-circle-outline',
    info: 'mdi-information-outline',
  })[level] || 'mdi-information-outline'
const formatDuration = (milliseconds) => {
  const value = Number(milliseconds)
  if (!Number.isFinite(value)) return 'Unavailable'
  if (value < 1000) return `${value.toLocaleString()} ms`
  return `${(value / 1000).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} s`
}
const deliveryDelay = (event) => {
  const occurred = toDate(event.occurredAt)
  const received = toDate(event.receivedAt)
  if (!occurred || !received) return 'Unavailable'
  return formatDuration(Math.max(0, received - occurred))
}
const DETAIL_LABELS = Object.freeze({
  fieldRef: 'Field',
  editSpanMs: 'Active input span',
  editOperations: 'Input changes',
  pasteOperations: 'Paste actions',
  initialLength: 'Starting length',
  resultingLength: 'Final length',
})
const detailLabel = (key) =>
  DETAIL_LABELS[key] ||
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase())
const pluralized = (value, unit) =>
  `${Number(value).toLocaleString()} ${unit}${Number(value) === 1 ? '' : 's'}`
const formatFieldRef = (value) => {
  const heuristic = /^heuristic:(\d+):question:(\d+):(answer|comment)$/.exec(
    value,
  )
  if (heuristic) {
    return `Heuristic ${Number(heuristic[1]) + 1} · Question ${Number(heuristic[2]) + 1} · ${formatIdentifier(heuristic[3])} field`
  }

  const studyField = /^(preTest|postTest|task):(\d+):(answer|comment)$/.exec(
    value,
  )
  if (!studyField) return value
  const scope = {
    preTest: 'Pre-test question',
    postTest: 'Post-test question',
    task: 'Task',
  }[studyField[1]]
  return `${scope} ${Number(studyField[2]) + 1} · ${formatIdentifier(studyField[3])} field`
}
const formatDetailValue = (key, value) => {
  if (key === 'fieldRef') return formatFieldRef(value)
  if (key === 'editSpanMs') return formatDuration(value)
  if (key === 'editOperations') return pluralized(value, 'input event')
  if (key === 'pasteOperations') return pluralized(value, 'paste event')
  if (key === 'initialLength' || key === 'resultingLength') {
    return pluralized(value, 'character')
  }
  return value
}

watch(pageSize, () => replaceFirstPage())
onMounted(async () => {
  if (xs?.value) filtersExpanded.value = false
  searchParticipants('')
  await replaceFirstPage({ recount: true })
})
onBeforeUnmount(() => clearTimeout(participantTimer))
</script>

<style scoped>
.logs-page {
  --logs-navy: #00213f;
  --logs-coral: #ff425a;
  --logs-surface: #ffffff;
  --logs-soft: #f5f7fb;
  --logs-border: #d7dce7;
  --logs-muted: #657187;
  min-height: 100%;
  padding: 20px clamp(16px, 2.5vw, 40px) 40px;
  color: #172033;
}
.logs-shell {
  width: 100%;
  max-width: 1560px;
  margin: 0 auto;
}
.study-context {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  min-height: 132px;
  padding: 20px 24px;
  border-radius: 8px;
  background: linear-gradient(112deg, #00213f 0%, #40263c 56%, #ff425a 140%);
  color: #ffffff;
  box-shadow: 0 10px 26px rgba(0, 33, 63, 0.14);
}
.study-context__icon,
.drawer-heading__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.14);
}
.study-context__copy {
  min-width: 0;
}
.study-context__eyebrow,
.surface-kicker {
  margin-bottom: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}
.study-context__eyebrow {
  color: rgba(255, 255, 255, 0.72);
}
.study-context h1 {
  overflow-wrap: anywhere;
  margin: 0;
  font-size: clamp(1.55rem, 2vw, 2rem);
  line-height: 1.18;
}
.study-context p {
  margin: 3px 0 10px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.88rem;
}
.study-context__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.context-chip {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 600;
}
.study-context__time {
  display: flex;
  max-width: 240px;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.8rem;
  text-align: right;
}
.delivery-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  margin: 12px 0;
  padding: 8px 12px;
  border-left: 3px solid var(--logs-coral);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.66);
  color: #4b5568;
  font-size: 0.84rem;
}
.delivery-notice .v-icon {
  color: var(--logs-navy);
}
.filter-surface,
.events-surface {
  border: 1px solid var(--logs-border);
  border-radius: 8px;
  background: var(--logs-surface);
}
.filter-surface {
  margin-bottom: 12px;
  padding: 14px 18px 16px;
}
.surface-heading,
.events-toolbar,
.events-title-row,
.refresh-area,
.pagination-bar,
.pagination-actions {
  display: flex;
  align-items: center;
}
.surface-heading,
.events-toolbar {
  justify-content: space-between;
}
.surface-kicker {
  color: var(--logs-muted);
}
.surface-heading h2,
.events-toolbar h2,
.drawer-heading h2 {
  margin: 0;
  color: var(--logs-navy);
  font-size: 1.02rem;
  line-height: 1.3;
}
.filter-count,
.range-label {
  color: var(--logs-muted);
  font-size: 0.78rem;
  font-weight: 600;
}
.filter-count {
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(255, 66, 90, 0.1);
  color: #b41f37;
}
.mobile-filter-toggle {
  display: none;
}
.filter-layout {
  display: grid;
  gap: 10px;
  margin-top: 8px;
}
.filter-group {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.filter-group legend {
  margin-bottom: 5px;
  color: var(--logs-muted);
  font-size: 0.69rem;
  font-weight: 700;
  text-transform: uppercase;
}
.primary-filter-grid,
.date-filter-grid,
.filter-lower-row {
  display: grid;
  gap: 10px;
}
.primary-filter-grid {
  grid-template-columns: repeat(4, minmax(150px, 1fr));
}
.filter-lower-row {
  grid-template-columns: minmax(360px, 1fr) auto;
  align-items: end;
}
.date-filter-grid {
  grid-template-columns: repeat(2, minmax(170px, 240px));
}
.filter-layout :deep(.v-field) {
  border-radius: 6px;
  background: var(--logs-soft);
}
.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
}
.filter-actions .v-btn {
  min-height: 40px;
}
.logs-error {
  margin-bottom: 14px;
  border-radius: 6px;
}
.events-surface {
  overflow: hidden;
}
.events-toolbar {
  min-height: 60px;
  padding: 11px 18px;
}
.events-title-row {
  gap: 10px;
}
.refresh-area {
  gap: 12px;
}
.updated-at {
  color: var(--logs-muted);
  font-size: 0.78rem;
}
.table-scroll {
  overflow-x: auto;
  border-top: 1px solid var(--logs-border);
}
.log-table {
  width: 100%;
  min-width: 960px;
  table-layout: fixed;
  border-collapse: collapse;
}
.occurrence-column {
  width: 126px;
}
.participant-column {
  width: 150px;
}
.level-column {
  width: 96px;
}
.source-column {
  width: 142px;
}
.layer-column {
  width: 132px;
}
.open-column {
  width: 44px;
}
.log-table th {
  padding: 9px 14px;
  background: var(--logs-soft);
  color: var(--logs-muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  text-align: left;
  text-transform: uppercase;
}
.log-table td {
  padding: 10px 14px;
  border-top: 1px solid #e8ebf1;
  color: #344054;
  font-size: 0.84rem;
  vertical-align: middle;
}
.log-row {
  position: relative;
  cursor: pointer;
  transition: background-color 140ms ease;
}
.log-row td:first-child {
  border-left: 3px solid #65809a;
}
.log-row--warning td:first-child {
  border-left-color: #d97706;
}
.log-row--error td:first-child {
  border-left-color: var(--logs-coral);
}
.log-row:hover,
.log-row:focus-visible {
  outline: 0;
  background: #f8fafc;
  box-shadow: inset 0 0 0 2px rgba(0, 33, 63, 0.32);
}
.occurrence-cell span,
.occurrence-cell strong {
  display: block;
  white-space: nowrap;
}
.occurrence-cell span {
  color: var(--logs-muted);
  font-size: 0.75rem;
}
.occurrence-cell strong {
  color: var(--logs-navy);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}
.message-cell {
  min-width: 0;
}
.message-cell div {
  color: #172033;
  font-size: 0.84rem;
  font-weight: 650;
  line-height: 1.3;
}
.message-cell span {
  display: block;
  margin-top: 3px;
  color: var(--logs-muted);
  font-size: 0.73rem;
}
.level-badge,
.layer-badge,
.drawer-source {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
}
.level-badge {
  padding: 5px 7px;
  background: #e8f2fb;
  color: #155b8e;
  text-transform: uppercase;
}
.level-badge--warning {
  background: #fff4dc;
  color: #9a5a00;
}
.level-badge--error {
  background: #ffeaed;
  color: #b41f37;
}
.layer-badge,
.drawer-source {
  padding: 5px 7px;
  background: #eef0f5;
  color: #4b5568;
}
.participant-token {
  --participant-accent: #315d7f;
  --participant-border: #bfd0dd;
  --participant-tint: #eaf2f7;
  display: inline-flex;
  height: 30px;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--participant-border);
  border-radius: 5px;
  background: var(--participant-tint);
  color: #263248;
  line-height: 1;
  white-space: nowrap;
}
.participant-token__anchor,
.participant-token__label {
  display: inline-flex;
  align-items: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
}
.participant-token__anchor {
  min-width: 31px;
  justify-content: center;
  background: var(--participant-accent);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
}
.participant-token__label {
  padding: 0 9px 0 8px;
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.015em;
}
.participant-token--tone-0 {
  --participant-accent: #315d7f;
  --participant-border: #bfd0dd;
  --participant-tint: #eaf2f7;
}
.participant-token--tone-1 {
  --participant-accent: #68516f;
  --participant-border: #d7c8db;
  --participant-tint: #f2edf3;
}
.participant-token--tone-2 {
  --participant-accent: #32665f;
  --participant-border: #bed8d2;
  --participant-tint: #e8f3f0;
}
.participant-token--tone-3 {
  --participant-accent: #76583c;
  --participant-border: #ddcdbb;
  --participant-tint: #f5efe8;
}
.participant-token--tone-4 {
  --participant-accent: #495f78;
  --participant-border: #c7d1dc;
  --participant-tint: #edf1f5;
}
.participant-token--tone-5 {
  --participant-accent: #59643d;
  --participant-border: #d1d7bd;
  --participant-tint: #f0f2e8;
}
.level-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #536176;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}
.level-indicator--warning,
.level-indicator--error {
  padding: 5px 7px;
  border-radius: 4px;
}
.level-indicator--warning {
  background: #fff4dc;
  color: #8b5100;
}
.level-indicator--error {
  background: #ffeaed;
  color: #a91e34;
}
.layer-label {
  color: #536176;
  font-size: 0.72rem;
  font-weight: 600;
}
.source-cell {
  color: #536176;
  font-size: 0.76rem !important;
  white-space: nowrap;
}
.open-cell {
  width: 40px;
  color: var(--logs-muted) !important;
  text-align: right !important;
}
.open-cell .v-icon {
  border-radius: 50%;
  transition:
    color 140ms ease,
    background-color 140ms ease,
    transform 140ms ease;
}
.log-row:hover .open-cell .v-icon,
.log-row:focus-visible .open-cell .v-icon {
  background: #e7edf3;
  color: var(--logs-navy);
  transform: translateX(2px);
}
.mobile-event-list {
  border-top: 1px solid var(--logs-border);
}
.mobile-event {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 7px;
  padding: 16px;
  border: 0;
  border-bottom: 1px solid #e8ebf1;
  border-left: 3px solid #65809a;
  background: #ffffff;
  color: #172033;
  font: inherit;
  text-align: left;
}
.mobile-event--warning {
  border-left-color: #d97706;
}
.mobile-event--error {
  border-left-color: var(--logs-coral);
}
.mobile-event:focus-visible {
  outline: 2px solid var(--logs-navy);
  outline-offset: -2px;
}
.mobile-event__topline,
.mobile-event__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--logs-muted);
  font-size: 0.72rem;
}
.mobile-event__context {
  color: var(--logs-muted);
  font-size: 0.7rem;
}
.empty-logs {
  display: grid;
  min-height: 164px;
  place-items: center;
  align-content: center;
  padding: 24px;
  border-top: 1px solid var(--logs-border);
  text-align: center;
}
.empty-logs__icon {
  display: grid;
  width: 50px;
  height: 50px;
  margin-bottom: 9px;
  place-items: center;
  border-radius: 8px;
  background: #eef1f6;
  color: var(--logs-muted);
}
.empty-logs h3 {
  margin: 0 0 4px;
  color: var(--logs-navy);
  font-size: 1rem;
}
.empty-logs p {
  margin: 0;
  color: var(--logs-muted);
  font-size: 0.84rem;
}
.pagination-bar {
  min-height: 56px;
  justify-content: flex-end;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid var(--logs-border);
  color: var(--logs-muted);
  font-size: 0.78rem;
}
.rows-select {
  max-width: 104px;
  margin-right: auto;
}
.pagination-actions {
  gap: 2px;
}
.event-drawer {
  border-left: 1px solid var(--logs-border);
}
.drawer-heading {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  padding: 22px 20px 16px;
  background: var(--logs-navy);
  color: #ffffff;
}
.drawer-heading__icon {
  width: 44px;
  height: 44px;
}
.drawer-heading .surface-kicker,
.drawer-heading h2 {
  color: #ffffff;
}
.drawer-heading h2 {
  overflow-wrap: anywhere;
}
.drawer-heading .v-btn {
  color: #ffffff;
}
.drawer-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--logs-border);
}
.event-summary {
  margin: 0;
  padding: 6px 20px;
}
.event-summary > div {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid #e8ebf1;
}
.event-summary dt,
.detail-grid dt {
  color: var(--logs-muted);
  font-size: 0.76rem;
  font-weight: 600;
}
.event-summary dd,
.detail-grid dd {
  overflow-wrap: anywhere;
  margin: 0;
  color: #263248;
  font-size: 0.82rem;
}
.drawer-details {
  padding: 20px;
}
.drawer-details h3 {
  margin: 0 0 14px;
  color: var(--logs-navy);
  font-size: 0.95rem;
}
.drawer-details > p {
  margin: 0 0 18px;
  color: var(--logs-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}
.detail-grid {
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: 10px 16px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (min-width: 960px) and (max-width: 1279px) {
  .log-table {
    min-width: 760px;
  }
  .source-column,
  .layer-column {
    display: none;
  }
}
@media (max-width: 959px) {
  .logs-page {
    padding: 16px 14px 32px;
  }
  .study-context {
    grid-template-columns: auto minmax(0, 1fr);
    min-height: auto;
    padding: 20px;
  }
  .study-context__time {
    grid-column: 2;
    max-width: none;
    text-align: left;
  }
  .primary-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .filter-lower-row {
    grid-template-columns: 1fr;
  }
  .date-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 599px) {
  .logs-page {
    padding: 12px 10px 28px;
  }
  .study-context {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 18px;
  }
  .study-context__icon {
    width: 44px;
    height: 44px;
  }
  .study-context__time {
    grid-column: 1;
  }
  .filter-surface {
    padding: 13px 12px;
  }
  .surface-heading {
    min-height: 38px;
  }
  .surface-heading h2 {
    margin-right: auto;
  }
  .mobile-filter-toggle {
    display: inline-flex;
  }
  .filter-actions,
  .filter-actions .v-btn {
    width: 100%;
  }
  .filter-actions {
    align-items: stretch;
    flex-direction: column;
  }
  .primary-filter-grid,
  .date-filter-grid {
    grid-template-columns: 1fr;
  }
  .events-toolbar {
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }
  .refresh-area {
    width: 100%;
    justify-content: space-between;
  }
  .pagination-bar {
    flex-wrap: wrap;
    gap: 8px;
  }
  .rows-select {
    flex: 0 0 96px;
  }
  .event-summary > div,
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 3px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .log-row,
  .open-cell .v-icon {
    transition: none;
  }
}
</style>
