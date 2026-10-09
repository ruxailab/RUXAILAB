<template>
  <div v-if="topics.length && participants.length" class="chat-coverage">
    <div
      v-for="topic in topics"
      :key="topic.id"
      class="chat-coverage__row"
    >
      <div class="chat-coverage__topic">
        {{ topic.title || $t('focusGroup.modules.untitledTopic') }}
      </div>
      <div class="chat-coverage__details">
        <span class="chat-coverage__count">
          {{ $t('focusGroup.analytics.chatCoverageCount', {
            responded: coverageFor(topic.id).responded.length,
            total: participants.length,
          }) }}
        </span>
        <span v-if="coverageFor(topic.id).missing.length" class="chat-coverage__missing">
          {{ $t('focusGroup.analytics.chatCoverageMissing', {
            names: coverageFor(topic.id).missing.map(({ name }) => name).join(', '),
          }) }}
        </span>
        <span v-else class="chat-coverage__complete">
          {{ $t('focusGroup.analytics.chatCoverageAllResponded') }}
        </span>
      </div>
      <v-progress-linear
        :model-value="coveragePercent(topic.id)"
        color="primary"
        bg-color="grey-lighten-2"
        rounded
        height="7"
        :aria-label="coverageLabel(topic.id)"
      />
    </div>
  </div>
  <p v-else class="text-medium-emphasis mb-0">
    {{ $t('focusGroup.analytics.noTopicParticipation') }}
  </p>
</template>

<script setup>
const props = defineProps({
  topics: { type: Array, default: () => [] },
  participants: { type: Array, default: () => [] },
  // { [topicId]: { [participantId]: chatMessageCount } }
  matrix: { type: Object, default: () => ({}) },
})

function coverageFor(topicId) {
  const counts = props.matrix[topicId] ?? {}
  return {
    responded: props.participants.filter(({ id }) => counts[id] > 0),
    missing: props.participants.filter(({ id }) => counts[id] === 0),
  }
}

function coveragePercent(topicId) {
  return (coverageFor(topicId).responded.length / props.participants.length) * 100
}

function coverageLabel(topicId) {
  const { responded } = coverageFor(topicId)
  return `${responded.length} of ${props.participants.length} participants have a recorded chat response`
}
</script>

<style scoped>
.chat-coverage {
  display: grid;
  gap: 18px;
}

.chat-coverage__row {
  display: grid;
  gap: 6px;
}

.chat-coverage__topic {
  font-weight: 600;
}

.chat-coverage__details {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  font-size: 0.875rem;
}

.chat-coverage__count {
  font-weight: 600;
}

.chat-coverage__missing {
  color: rgb(var(--v-theme-error));
}

.chat-coverage__complete {
  color: rgb(var(--v-theme-success));
}
</style>
