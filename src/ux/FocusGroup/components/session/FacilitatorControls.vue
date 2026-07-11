<template>
  <v-card color="primary" variant="tonal">
    <v-card-text class="d-flex flex-wrap align-center ga-3">
      <div class="flex-grow-1">
        <p class="text-overline mb-0">
          {{ t('focusGroup.session.facilitatorControls') }}
        </p>
        <p class="text-body-2 mb-0">
          <template v-if="status === 'idle'">
            {{ t('focusGroup.session.notStarted') }}
          </template>
          <template v-else-if="status === 'ended'">
            {{ t('focusGroup.session.sessionEnded') }}
          </template>
          <template v-else>
            {{ t('focusGroup.session.topicProgress', {
              current: currentIndex + 1,
              total,
            }) }}
          </template>
        </p>
      </div>

      <template v-if="status === 'idle'">
        <v-btn
          color="primary"
          prepend-icon="mdi-play"
          :disabled="total === 0"
          @click="$emit('start')"
        >
          {{ t('focusGroup.session.startSession') }}
        </v-btn>
      </template>

      <template v-else-if="status === 'live'">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-chevron-left"
          :disabled="currentIndex <= 0"
          @click="$emit('prev')"
        >
          {{ t('focusGroup.session.previous') }}
        </v-btn>
        <v-btn
          v-if="currentIndex < total - 1"
          color="primary"
          append-icon="mdi-chevron-right"
          @click="$emit('next')"
        >
          {{ t('focusGroup.session.next') }}
        </v-btn>
        <v-btn
          color="secondary"
          prepend-icon="mdi-stop"
          @click="$emit('end')"
        >
          {{ t('focusGroup.session.endSession') }}
        </v-btn>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  status: { type: String, default: 'idle' },
  currentIndex: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

defineEmits(['start', 'prev', 'next', 'end'])
</script>
