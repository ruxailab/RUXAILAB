<template>
  <section class="timeline" aria-labelledby="timeline-heading">
    <header class="timeline-header">
      <h3 id="timeline-heading">{{ timeline.participantLabel }}</h3>
      <span class="timeline-status" :class="`timeline-status--${statusKind}`">
        {{ statusText }}
      </span>
      <span v-if="activeSpan" class="timeline-span">
        {{ activeSpan }} from first to last activity
      </span>
    </header>

    <ol class="timeline-steps">
      <li
        v-for="step in timeline.steps"
        :key="step.key"
        class="timeline-step"
        :class="`timeline-step--${step.status}`"
      >
        <button
          type="button"
          class="timeline-step__summary"
          :aria-expanded="expanded.has(step.key)"
          @click="toggle(step.key)"
        >
          <v-icon class="timeline-step__icon" size="20">
            {{ statusIcon(step.status) }}
          </v-icon>
          <span class="timeline-step__text">
            <strong>{{ stepTitle(step) }}</strong>
            <span v-if="stepDetails(step).length" class="timeline-step__meta">
              {{ stepDetails(step).join(' · ') }}
            </span>
          </span>
          <span class="timeline-step__time">
            {{ formatClock(step.startedAt) }}
            <small v-if="stepSpan(step)">{{ stepSpan(step) }}</small>
          </span>
          <v-icon size="18">
            {{ expanded.has(step.key) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
        </button>

        <ul v-if="expanded.has(step.key)" class="timeline-events">
          <li v-for="event in step.events" :key="event.rowKey">
            <button
              type="button"
              class="timeline-event"
              :class="`timeline-event--${event.level || 'info'}`"
              @click="$emit('select', event)"
            >
              <span class="timeline-event__time">
                {{ formatClock(event.occurredAt) }}
              </span>
              <span>
                {{ eventPresentation(event).primary }}
                <small v-if="eventPresentation(event).secondary">
                  {{ eventPresentation(event).secondary }}
                </small>
              </span>
            </button>
          </li>
        </ul>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  timeline: { type: Object, required: true },
  eventPresentation: { type: Function, required: true },
  formatClock: { type: Function, required: true },
  formatDateTime: { type: Function, required: true },
  taskTypeLabel: { type: Function, default: () => null },
  mediaTypeLabel: { type: Function, default: (type) => type },
})
defineEmits(['select'])

const expanded = reactive(new Set())
const toggle = (key) =>
  expanded.has(key) ? expanded.delete(key) : expanded.add(key)

const formatSpan = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds < 1000) return null
  const seconds = Math.round(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes >= 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
  return minutes ? `${minutes} min ${seconds % 60} s` : `${seconds} s`
}

const statusKind = computed(() =>
  props.timeline.submittedAt ? 'submitted' : 'open',
)
// Logs are evidence of activity, not proof of abandonment, so an unsubmitted
// participant is only "in progress".
const statusText = computed(() =>
  props.timeline.submittedAt
    ? `Submitted ${props.formatDateTime(props.timeline.submittedAt)}`
    : `In progress · last activity ${props.formatDateTime(props.timeline.lastActivityAt)}`,
)
const activeSpan = computed(() =>
  formatSpan(props.timeline.lastActivityAt - props.timeline.firstActivityAt),
)

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`
const stepTitle = (step) => {
  const titles = {
    session: 'Study opened',
    consent: 'Consent accepted',
    preTest: 'Pre-test',
    postTest: 'Post-test',
    submitted: 'Study submitted',
    other: 'Other activity',
  }
  if (step.kind === 'task') {
    const type = props.taskTypeLabel(step.summary.taskType)
    return `Task ${step.index + 1}${type ? ` · ${type}` : ''}`
  }
  if (step.kind === 'heuristic') return `Heuristic ${step.index + 1}`
  return titles[step.kind]
}

const OUTCOMES = {
  completed: 'Completed',
  not_completed: 'Could not finish',
}
const RECORDING_MARKS = {
  completed: 'saved',
  failed: 'failed',
  permission_denied: 'not allowed',
  cancelled: 'cancelled',
}
const stepDetails = (step) => {
  const summary = step.summary
  if (step.kind === 'session' && summary.opens > 1)
    return [`Opened ${summary.opens} times`]
  if (step.kind === 'preTest' || step.kind === 'postTest')
    return summary.questions
      ? [`${plural(summary.questions, 'question')} answered`]
      : []
  if (step.kind === 'heuristic')
    return [`${plural(summary.questions, 'question')} updated`]
  if (step.kind !== 'task') return []
  return [
    OUTCOMES[summary.outcome] || 'In progress',
    formatSpan(summary.durationMs) &&
      `task time ${formatSpan(summary.durationMs)}`,
    summary.questionnaireUpdates &&
      plural(summary.questionnaireUpdates, 'questionnaire update'),
    ...Object.entries(summary.recordings).map(
      ([type, outcome]) =>
        `${props.mediaTypeLabel(type)} ${RECORDING_MARKS[outcome] || outcome}`,
    ),
  ].filter(Boolean)
}
const stepSpan = (step) => formatSpan(step.endedAt - step.startedAt)
const statusIcon = (status) =>
  ({
    done: 'mdi-check-circle',
    problem: 'mdi-alert-circle',
    open: 'mdi-progress-clock',
  })[status]
</script>

<style scoped>
.timeline {
  padding: 16px 20px 20px;
}
.timeline-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 16px;
  margin-bottom: 16px;
}
.timeline-header h3 {
  margin: 0;
  font-size: 1.15rem;
}
.timeline-status {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}
.timeline-status--submitted {
  background: #e7f6ec;
  color: #1b6b3a;
}
.timeline-status--open {
  background: #fff4e0;
  color: #8a5300;
}
.timeline-span {
  color: var(--logs-muted, #657187);
  font-size: 0.85rem;
}
.timeline-steps,
.timeline-events {
  margin: 0;
  padding: 0;
  list-style: none;
}
.timeline-step {
  border: 1px solid var(--logs-border, #d7dce7);
  border-radius: 12px;
  margin-bottom: 8px;
  background: var(--logs-surface, #fff);
}
.timeline-step__summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
}
.timeline-step--done .timeline-step__icon {
  color: #1f8a4c;
}
.timeline-step--problem .timeline-step__icon {
  color: #c77700;
}
.timeline-step--open .timeline-step__icon {
  color: var(--logs-muted, #657187);
}
.timeline-step__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.timeline-step__meta,
.timeline-step__time small,
.timeline-event small {
  color: var(--logs-muted, #657187);
  font-size: 0.85rem;
}
.timeline-step__time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-variant-numeric: tabular-nums;
}
.timeline-events {
  border-top: 1px solid var(--logs-border, #d7dce7);
  padding: 6px 14px 10px 46px;
}
.timeline-event {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  padding: 6px 0;
  text-align: left;
}
.timeline-event small {
  display: block;
}
.timeline-event--warning,
.timeline-event--error {
  color: #8a5300;
}
.timeline-event__time {
  font-variant-numeric: tabular-nums;
  color: var(--logs-muted, #657187);
}
.timeline-step__summary:focus-visible,
.timeline-event:focus-visible {
  outline: 2px solid var(--logs-navy, #00213f);
  outline-offset: -2px;
  border-radius: 12px;
}
@media (max-width: 600px) {
  .timeline {
    padding: 12px;
  }
  .timeline-step__summary {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }
  .timeline-step__time {
    display: none;
  }
  .timeline-events {
    padding-left: 14px;
  }
}
</style>
