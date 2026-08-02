<template>
  <!-- The prompt the facilitator has surfaced as the active question. Shown to
       everyone so participants know what to respond to; the facilitator can
       retire it. Renders nothing until a prompt is asked. -->
  <v-card v-if="text" class="mb-4" color="primary" variant="tonal" border>
    <div class="d-flex align-center ga-3 pa-4">
      <v-icon color="primary" size="28">mdi-comment-question</v-icon>
      <div class="flex-grow-1">
        <div class="text-overline text-primary mb-1">
          {{ t('focusGroup.session.currentQuestion') }}
        </div>
        <div class="text-body-1 font-weight-medium">{{ text }}</div>
      </div>
      <v-btn
        v-if="canClear"
        size="small"
        variant="text"
        icon="mdi-close"
        :title="t('focusGroup.session.clearQuestion')"
        @click="emit('clear')"
      />
    </div>
  </v-card>
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
