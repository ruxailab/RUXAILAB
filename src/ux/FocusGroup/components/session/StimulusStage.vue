<template>
  <!-- The stimulus the facilitator is currently presenting. Fills the stage,
       taking priority over the video call / discussion so everyone looks at
       the same thing. Renders nothing until one is presented. -->
  <div v-if="stimulus" class="stimulus-stage">
    <div class="stimulus-stage__bar">
      <span class="stimulus-stage__label">
        <v-icon size="15" color="accent">mdi-monitor-share</v-icon>
        {{ t('focusGroup.session.presentingStimulus') }}
        <strong>{{ stimulus.name }}</strong>
      </span>
      <v-btn
        v-if="canClear"
        size="small"
        variant="tonal"
        prepend-icon="mdi-close"
        class="text-none"
        @click="emit('clear')"
      >
        {{ t('focusGroup.session.stopPresenting') }}
      </v-btn>
    </div>

    <div class="stimulus-stage__body">
      <v-img
        v-if="stimulus.type === 'image'"
        :src="stimulus.url"
        class="stimulus-stage__media"
      />
      <video
        v-else-if="stimulus.type === 'video'"
        :src="stimulus.url"
        class="stimulus-stage__media"
        controls
      />
      <a
        v-else
        :href="stimulus.url"
        target="_blank"
        rel="noopener"
        class="stimulus-stage__link"
      >
        <v-icon size="32" class="mb-2">mdi-open-in-new</v-icon>
        <span>{{ t('focusGroup.session.openStimulusLink') }}</span>
        <span class="stimulus-stage__url">{{ stimulus.url }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  // The resolved stimulus being presented; null renders nothing.
  stimulus: { type: Object, default: null },
  // Facilitator gets a control to stop presenting.
  canClear: { type: Boolean, default: false },
})

const emit = defineEmits(['clear'])
</script>

<style scoped>
.stimulus-stage {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.stimulus-stage__bar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(var(--v-theme-accent), 0.08);
  border-bottom: 1px solid rgba(var(--v-theme-accent), 0.22);
}

.stimulus-stage__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: rgb(var(--v-theme-on-surface));
}

.stimulus-stage__body {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.stimulus-stage__media {
  max-width: 100%;
  max-height: 100%;
}

.stimulus-stage__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  color: rgb(var(--v-theme-primary));
  text-align: center;
}

.stimulus-stage__url {
  margin-top: 4px;
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  word-break: break-all;
}
</style>
