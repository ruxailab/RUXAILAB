<template>
  <v-card class="stimulus-panel" variant="flat" rounded="lg">
    <p v-if="orderedStimuli.length === 0" class="stimulus-panel__empty">
      {{ t('focusGroup.session.noStimuli') }}
    </p>

    <div v-else class="stimulus-panel__list">
      <div
        v-for="stimulus in orderedStimuli"
        :key="stimulus.id"
        class="stimulus-row"
        :class="{ 'stimulus-row--active': stimulus.id === presentedStimulusId }"
      >
        <v-icon size="18" class="stimulus-row__icon">
          {{ typeIcon(stimulus.type) }}
        </v-icon>
        <span class="stimulus-row__text">{{ stimulus.name }}</span>

        <v-chip
          v-if="stimulus.id === presentedStimulusId"
          size="small"
          color="success"
          variant="flat"
          prepend-icon="mdi-check"
        >
          {{ t('focusGroup.session.presenting') }}
        </v-chip>
        <v-btn
          v-if="stimulus.id === presentedStimulusId"
          size="small"
          variant="text"
          @click="emit('clear')"
        >
          {{ t('focusGroup.session.stopPresenting') }}
        </v-btn>
        <v-btn
          v-else
          size="small"
          color="accent"
          variant="flat"
          prepend-icon="mdi-monitor-share"
          @click="emit('present', stimulus.id)"
        >
          {{ t('focusGroup.session.present') }}
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  stimuli: { type: Array, default: () => [] },
  // Stimuli tagged to the current topic are surfaced first.
  currentTopicId: { type: String, default: null },
  presentedStimulusId: { type: String, default: null },
})

const emit = defineEmits(['present', 'clear'])

const orderedStimuli = computed(() => {
  const list = Array.isArray(props.stimuli) ? props.stimuli : []
  const forTopic = list.filter((item) => item.topicId === props.currentTopicId)
  const rest = list.filter((item) => item.topicId !== props.currentTopicId)
  return [...forTopic, ...rest]
})

const typeIcon = (type) => {
  if (type === 'video') return 'mdi-video-outline'
  if (type === 'url') return 'mdi-link-variant'
  return 'mdi-image-outline'
}
</script>

<style scoped>
.stimulus-panel {
  padding: 4px;
}

.stimulus-panel__empty {
  margin: 0;
  padding: 8px 4px;
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.stimulus-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stimulus-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid transparent;
}

.stimulus-row--active {
  background: rgba(var(--v-theme-success), 0.08);
  border-color: rgba(var(--v-theme-success), 0.3);
}

.stimulus-row__icon {
  flex: 0 0 auto;
  color: rgb(var(--v-theme-accent));
}

.stimulus-row__text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  font-size: 0.9rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
