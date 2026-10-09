<template>
  <div v-if="topics.length && participants.length >= 2" class="consensus-heatmap">
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
    <p class="text-caption text-medium-emphasis mt-2 mb-0">
      {{ $t('focusGroup.analytics.consensusSimilarityHint') }}
    </p>
  </div>
  <p v-else-if="participants.length === 1" class="text-medium-emphasis mb-0">
    {{ $t('focusGroup.analytics.consensusNeedsParticipants') }}
  </p>
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
  if (score == null) return t('focusGroup.analytics.consensusUnavailableHint')
  if (score === 0) {
    return `${formatScore(score)} ${t('focusGroup.analysis.consensusScore').toLowerCase()} — ${t('focusGroup.analytics.consensusZeroHint')}`
  }
  return `${formatScore(score)} ${t('focusGroup.analysis.consensusScore').toLowerCase()}`
}

// Similarity is lexical evidence, not agreement. Use a neutral surface for
// zero overlap and a restrained single-hue tint for increasing overlap.
function colorFor(score) {
  if (score == null || score === 0) return 'rgba(var(--v-theme-on-surface), 0.05)'
  const opacity = Math.min(0.2, 0.04 + Math.max(0, Math.min(1, score)) * 0.16)
  return `rgba(var(--v-theme-primary), ${opacity})`
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
