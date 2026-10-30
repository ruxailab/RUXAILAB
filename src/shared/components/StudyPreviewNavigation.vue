<template>
  <div class="study-preview-navigation-space">
    <nav
      class="study-preview-navigation"
      :aria-label="$t('studyPreview.navigation')"
    >
      <span class="text-body-2">{{ $t('studyPreview.skipHint') }}</span>
      <div class="d-flex ga-2">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-chevron-left"
          :disabled="disabled || !canPrevious"
          @click="$emit('previous')"
        >
          {{ $t('studyPreview.previous') }}
        </v-btn>
        <v-btn
          color="primary"
          append-icon="mdi-chevron-right"
          :disabled="disabled || !canNext"
          @click="$emit('next')"
        >
          {{ $t('studyPreview.next') }}
        </v-btn>
      </div>
    </nav>
  </div>
</template>

<script setup>
defineProps({
  canPrevious: { type: Boolean, default: false },
  canNext: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['previous', 'next'])
</script>

<style scoped>
.study-preview-navigation-space {
  height: calc(110px + env(safe-area-inset-bottom));
}

.study-preview-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2100;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 24px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.2);
}
</style>
