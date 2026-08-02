<template>
  <!-- The prompt the facilitator has surfaced as the active question. Shown to
       everyone so participants know what to respond to; the facilitator can
       retire it. Accent-highlighted to tie it to the "Ask" action. Renders
       nothing until a prompt is asked. -->
  <div v-if="text" class="current-question">
    <div class="current-question__label">
      <v-icon size="15" color="accent">mdi-message-question-outline</v-icon>
      {{ t('focusGroup.session.currentQuestion') }}
    </div>
    <div class="current-question__row">
      <p class="current-question__text">{{ text }}</p>
      <v-btn
        v-if="canClear"
        size="small"
        variant="text"
        icon="mdi-close"
        :title="t('focusGroup.session.clearQuestion')"
        @click="emit('clear')"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  // The active question text; empty hides the banner.
  text: { type: String, default: '' },
  // Facilitator gets a control to retire the question.
  canClear: { type: Boolean, default: false },
})

const emit = defineEmits(['clear'])
</script>

<style scoped>
.current-question {
  flex: 0 0 auto;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-accent), 0.08);
  border: 1px solid rgba(var(--v-theme-accent), 0.22);
  border-left: 4px solid rgb(var(--v-theme-accent));
}

.current-question__label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-accent));
}

.current-question__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.current-question__text {
  flex: 1 1 auto;
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.4;
  color: rgb(var(--v-theme-on-surface));
}
</style>
