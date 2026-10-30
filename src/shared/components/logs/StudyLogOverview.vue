<template>
  <section class="overview" aria-labelledby="log-overview-heading">
    <div class="overview-toolbar">
      <div>
        <h2 id="log-overview-heading">
          {{ $t('LogExplorer.overviewPanel.title') }}
        </h2>
        <p>{{ $t('LogExplorer.overviewPanel.description') }}</p>
      </div>
      <v-btn
        prepend-icon="mdi-refresh"
        variant="outlined"
        size="small"
        :loading="loading"
        @click="load"
      >
        {{ $t('LogExplorer.overviewPanel.refresh') }}
      </v-btn>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="secondary" />
    <p v-if="errorMessage" class="overview-error" role="alert">
      {{ errorMessage }}
    </p>

    <template v-if="overview">
      <ul
        class="kpi-grid"
        :aria-label="$t('LogExplorer.overviewPanel.logTotals')"
      >
        <li v-for="card in cards" :key="card.key">
          <component
            :is="card.filters ? 'button' : 'div'"
            :type="card.filters ? 'button' : undefined"
            class="kpi-card"
            :class="[
              `kpi-card--${card.tone}`,
              { 'kpi-card--link': card.filters },
            ]"
            :data-kpi="card.key"
            :aria-label="
              card.filters
                ? $t('LogExplorer.overviewPanel.showInExplorer', {
                    label: card.label,
                    value: formatCount(card.value),
                  })
                : undefined
            "
            @click="card.filters && $emit('filter', card.filters)"
          >
            <span class="kpi-card__label">
              <v-icon size="18" aria-hidden="true">{{ card.icon }}</v-icon>
              {{ card.label }}
            </span>
            <strong class="kpi-card__value">{{
              formatCount(card.value)
            }}</strong>
            <span class="kpi-card__hint">{{ card.hint }}</span>
          </component>
        </li>
      </ul>

      <section class="overview-panel" aria-labelledby="latest-events-heading">
        <div class="panel-heading">
          <h3 id="latest-events-heading">
            {{ $t('LogExplorer.overviewPanel.latestEvents') }}
          </h3>
          <button
            v-if="overview.latestEvents.length"
            type="button"
            class="panel-link"
            data-test="view-all-events"
            @click="$emit('filter', {})"
          >
            {{ $t('LogExplorer.overviewPanel.viewAll') }}
            <v-icon size="16" aria-hidden="true">mdi-arrow-right</v-icon>
          </button>
        </div>
        <ul v-if="overview.latestEvents.length" class="latest-list">
          <li v-for="event in overview.latestEvents" :key="event.rowKey">
            <button
              type="button"
              class="latest-row"
              :aria-label="latestLabel(event)"
              @click="$emit('select', event)"
            >
              <span
                class="latest-row__status"
                :class="`latest-row__status--${levelOf(event)}`"
                aria-hidden="true"
              >
                <v-icon v-if="levelOf(event) !== 'info'" size="16">
                  {{ LEVEL_ICONS[levelOf(event)] }}
                </v-icon>
              </span>
              <span class="latest-row__text">
                <strong>{{ eventPresentation(event).primary }}</strong>
                <small>{{ latestMeta(event) }}</small>
              </span>
              <span class="latest-row__time">
                <span>{{ formatClock(event.occurredAt) }}</span>
                <small>{{ formatDate(event.occurredAt) }}</small>
              </span>
            </button>
          </li>
        </ul>
        <p v-else class="overview-empty">
          {{ $t('LogExplorer.overviewPanel.noActivity') }}
        </p>
      </section>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { db } from '@/app/plugins/firebase'
import { getStudyLogOverview } from '@/shared/services/studyLogOverview'

const props = defineProps({
  studyId: { type: String, required: true },
  eventPresentation: { type: Function, required: true },
})
defineEmits(['filter', 'select'])
const { t } = useI18n()

const overview = ref(null)
const loading = ref(false)
const errorMessage = ref('')
let loadId = 0

const cards = computed(() => {
  const value = overview.value
  if (!value) return []
  return [
    {
      key: 'sessions',
      label: t('LogExplorer.overviewPanel.cards.sessions.label'),
      icon: 'mdi-account-multiple-outline',
      value: value.sessions,
      hint: t('LogExplorer.overviewPanel.cards.sessions.hint'),
      tone: 'neutral',
    },
    {
      key: 'submitted',
      label: t('LogExplorer.overviewPanel.cards.submitted.label'),
      icon: 'mdi-check-circle-outline',
      value: value.submittedSessions,
      hint: t('LogExplorer.overviewPanel.cards.submitted.hint'),
      tone: 'success',
      filters: { eventType: 'STUDY_SUBMITTED' },
    },
    {
      key: 'events',
      label: t('LogExplorer.overviewPanel.cards.events.label'),
      icon: 'mdi-format-list-bulleted',
      value: value.events,
      hint: t('LogExplorer.overviewPanel.cards.events.hint'),
      tone: 'neutral',
      filters: {},
    },
    {
      key: 'warnings',
      label: t('LogExplorer.overviewPanel.cards.warnings.label'),
      icon: 'mdi-alert-outline',
      value: value.warnings,
      hint: t('LogExplorer.overviewPanel.cards.warnings.hint'),
      tone: 'warning',
      filters: { level: 'warning' },
    },
    {
      key: 'errors',
      label: t('LogExplorer.overviewPanel.cards.errors.label'),
      icon: 'mdi-alert-circle-outline',
      value: value.errors,
      hint: t('LogExplorer.overviewPanel.cards.errors.hint'),
      tone: 'error',
      filters: { level: 'error' },
    },
  ]
})

const formatCount = (value) => Number(value || 0).toLocaleString()

const LEVEL_ICONS = Object.freeze({
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
})
const levelOf = (event) => (LEVEL_ICONS[event.level] ? event.level : 'info')
const toDate = (value) => value?.toDate?.() || (value ? new Date(value) : null)
const formatWith = (options) => (value) => {
  const date = toDate(value)
  return date ? new Intl.DateTimeFormat(undefined, options).format(date) : ''
}
const formatClock = formatWith({ timeStyle: 'short' })
const formatDate = formatWith({ dateStyle: 'medium' })
const latestMeta = (event) =>
  [event.participantLabel, props.eventPresentation(event).secondary]
    .filter(Boolean)
    .join(' · ')
const latestLabel = (event) =>
  [
    props.eventPresentation(event).primary,
    latestMeta(event),
    levelOf(event) === 'info'
      ? null
      : t('LogExplorer.overviewPanel.levelSuffix', { level: levelOf(event) }),
    `${formatDate(event.occurredAt)} ${formatClock(event.occurredAt)}`,
    t('LogExplorer.overviewPanel.openDetails'),
  ]
    .filter(Boolean)
    .join(', ')

const load = async () => {
  const id = ++loadId
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await getStudyLogOverview({ db, studyId: props.studyId })
    if (id === loadId) overview.value = result
  } catch {
    if (id === loadId) {
      errorMessage.value = t('LogExplorer.overviewPanel.loadError')
    }
  } finally {
    if (id === loadId) loading.value = false
  }
}

watch(
  () => props.studyId,
  () => {
    overview.value = null
    load()
  },
)
onMounted(load)
</script>

<style scoped>
.overview {
  border: 1px solid var(--logs-border, #d7dce7);
  border-radius: 8px;
  background: var(--logs-surface, #ffffff);
}
.overview-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
}
.overview-toolbar h2 {
  margin: 0;
  font-size: 1.05rem;
}
.overview-toolbar p {
  margin: 2px 0 0;
  color: var(--logs-muted, #657187);
  font-size: 0.82rem;
}
.overview-error {
  margin: 0 18px 12px;
  color: #a91e34;
  font-size: 0.88rem;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0 18px 16px;
  list-style: none;
}
.kpi-card {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--logs-border, #d7dce7);
  border-left-width: 4px;
  border-radius: 8px;
  background: var(--logs-soft, #f5f7fb);
  color: inherit;
  font: inherit;
  text-align: left;
}
.kpi-card--link {
  cursor: pointer;
}
.kpi-card--link:hover,
.kpi-card--link:focus-visible {
  border-color: var(--logs-navy, #00213f);
  outline: none;
}
.kpi-card--neutral {
  border-left-color: var(--logs-navy, #00213f);
}
.kpi-card--success {
  border-left-color: #1b6b3a;
}
.kpi-card--warning {
  border-left-color: #b86e00;
}
.kpi-card--error {
  border-left-color: #a91e34;
}
.kpi-card__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #3e4a5e;
  font-size: 0.82rem;
  font-weight: 700;
}
.kpi-card__value {
  font-size: 1.7rem;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.kpi-card__hint {
  color: var(--logs-muted, #657187);
  font-size: 0.76rem;
}
.overview-panel {
  min-width: 0;
  margin: 0 18px 18px;
  padding: 12px 6px 6px;
  border: 1px solid var(--logs-border, #d7dce7);
  border-radius: 8px;
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 6px;
}
.panel-heading h3 {
  margin: 0;
  font-size: 0.92rem;
}
.panel-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-radius: 4px;
  color: var(--logs-navy, #00213f);
  font-size: 0.8rem;
  font-weight: 600;
}
.panel-link:hover,
.panel-link:focus-visible {
  text-decoration: underline;
  outline: none;
}
.latest-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.latest-list li + li {
  border-top: 1px solid #eceff5;
}
.latest-row {
  display: grid;
  width: 100%;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 6px;
  color: inherit;
  font: inherit;
  font-size: 0.86rem;
  text-align: left;
}
.latest-row:hover,
.latest-row:focus-visible {
  background: var(--logs-soft, #f5f7fb);
  outline: none;
}
.latest-row:focus-visible {
  box-shadow: inset 0 0 0 2px var(--logs-navy, #00213f);
}
.latest-row__status {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
}
.latest-row__status--info::before {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b4bccb;
  content: '';
}
.latest-row__status--warning {
  background: #fff4dc;
  color: #8b5100;
}
.latest-row__status--error {
  background: #ffeaed;
  color: #a91e34;
}
.latest-row__text,
.latest-row__time {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.latest-row__text strong {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.latest-row__text small,
.latest-row__time small {
  color: var(--logs-muted, #657187);
  font-size: 0.76rem;
}
.latest-row__time {
  align-items: flex-end;
  color: #3e4a5e;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.overview-empty {
  margin: 0;
  color: var(--logs-muted, #657187);
  font-size: 0.86rem;
}
@media (max-width: 600px) {
  .overview-toolbar,
  .kpi-grid {
    padding-right: 12px;
    padding-left: 12px;
  }
  .overview-panel {
    margin-right: 12px;
    margin-left: 12px;
  }
  .latest-row {
    gap: 10px;
  }
}
</style>
