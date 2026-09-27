<template>
  <div v-if="topics.length && participants.length" class="consensus-heatmap">
    <table class="consensus-heatmap__table">
      <thead>
        <tr>
          <th class="consensus-heatmap__corner"></th>
          <th v-for="participant in participants" :key="participant.id">
            {{ participant.name || $t('focusGroup.session.anonymous') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="topic in topics" :key="topic.id">
          <th class="consensus-heatmap__row-label">
            {{ topic.title || $t('focusGroup.modules.untitledTopic') }}
          </th>
          <td
            v-for="participant in participants"
            :key="participant.id"
            :style="{ background: colorFor(scoreFor(topic.id, participant.id)) }"
            :title="cellTitle(topic.id, participant.id)"
          >
            <span class="consensus-heatmap__value">
              {{ formatScore(scoreFor(topic.id, participant.id)) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="text-medium-emphasis mb-0">
    {{ $t('focusGroup.analytics.noAnalysisYet') }}
  </p>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  topics: { type: Array, default: () => [] }, // [{ id, title }]
  participants: { type: Array, default: () => [] }, // [{ id, name }]
  // { [topicId]: { [participantId]: 0-1 } } — consensus.alignment per topic
  matrix: { type: Object, default: () => ({}) },
})

function scoreFor(topicId, participantId) {
  return props.matrix[topicId]?.[participantId] ?? null
}

function formatScore(score) {
  return score == null ? '—' : `${Math.round(score * 100)}%`
}

function cellTitle(topicId, participantId) {
  const score = scoreFor(topicId, participantId)
  return score == null
    ? t('focusGroup.analytics.noAnalysisYet')
    : `${formatScore(score)} ${t('focusGroup.analysis.consensusScore').toLowerCase()}`
}

// Red (low alignment) through amber to green (high alignment), fading to a
// neutral gray when there's no score yet for that cell.
function colorFor(score) {
  if (score == null) return 'rgba(var(--v-theme-on-surface), 0.05)'
  const hue = Math.max(0, Math.min(120, score * 120))
  return `hsla(${hue}, 65%, 50%, 0.28)`
}
</script>

<style scoped>
.consensus-heatmap {
  overflow-x: auto;
}

.consensus-heatmap__table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.82rem;
}

.consensus-heatmap__table th,
.consensus-heatmap__table td {
  padding: 8px 10px;
  text-align: center;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  white-space: nowrap;
}

.consensus-heatmap__row-label,
.consensus-heatmap__table thead th {
  text-align: left;
  font-weight: 600;
}

.consensus-heatmap__corner {
  background: transparent;
  border: none;
}

.consensus-heatmap__value {
  font-weight: 600;
}
</style>
