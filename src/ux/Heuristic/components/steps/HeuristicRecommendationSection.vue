<template>
  <section class="recommendation-field">
    <header class="field-header">
      <div class="field-title">
        <span class="field-icon">
          <v-icon size="20">mdi-lightbulb-on-outline</v-icon>
        </span>
        <h3>{{ $t('HeuristicsTestView.answer.recommendations') }}</h3>
      </div>
    </header>

    <div class="field-body">
      <p class="field-help mb-4">
        {{ $t('HeuristicsTestView.answer.recommendationPrompt') }}
      </p>
      <v-textarea
        class="recommendation-input"
        :model-value="recommendation"
        :data-study-field-ref="dataStudyFieldRef"
        :disabled="disabled"
        :placeholder="$t('HeuristicsTestView.answer.recommendationPlaceholder')"
        variant="solo"
        density="comfortable"
        rows="4"
        auto-grow
        hide-details
        @update:model-value="$emit('update-recommendation', $event)"
      />
    </div>
  </section>
</template>

<script setup>
defineProps({
  recommendation: { type: String, default: '' },
  dataStudyFieldRef: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update-recommendation'])
</script>

<style scoped>
.recommendation-field {
  min-height: 100%;
  padding: 1rem;
  border: 1px solid rgba(0, 33, 63, 0.22);
  border-radius: 4px;
  background: #fff;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0 0 0.65rem;
}

.field-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.field-icon {
  display: inline-flex;
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #a16207;
  background: rgba(255, 179, 0, 0.16);
}

.field-title h3 {
  margin: 0;
  color: #151b2a;
  font-size: 1.05rem;
  font-weight: 800;
}

.field-body {
  padding-top: 0.25rem;
}

.field-help {
  margin: 0 0 0.65rem;
  color: #5b6470;
  font-size: 0.95rem;
  line-height: 1.45;
}

.recommendation-input :deep(.v-field) {
  border: 1px solid rgba(0, 33, 63, 0.14);
  border-radius: 8px;
  background: #fff !important;
  box-shadow: none;
}

.recommendation-input :deep(.v-field--focused) {
  border-color: #00213f;
  box-shadow: 0 0 0 3px rgba(0, 33, 63, 0.08);
}

.recommendation-input :deep(.v-field__input) {
  min-height: 136px;
  padding-top: 1rem;
  font-size: 1rem;
  line-height: 1.55;
}

.recommendation-input :deep(.v-label) {
  display: none;
}
</style>
