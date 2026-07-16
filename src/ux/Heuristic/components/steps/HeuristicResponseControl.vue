<template>
  <div class="response-control">
    <div class="response-label-row">
      <span>{{ label }}</span>
      <small>{{ helperText }}</small>
    </div>

    <div :class="['option-scale', `option-scale--${metric}`]">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="[
          'option-card',
          `option-card--${metric}`,
          { selected: selectedValue === option.value },
        ]"
        :disabled="disabled"
        @click="$emit('change', option.value)"
      >
        <span class="option-number">{{ option.value }}</span>
        <span
          v-if="metric === 'severity'"
          class="severity-dot"
          :style="{ backgroundColor: severityColor(option.value) }"
        />
        <span class="option-text">{{ option.text }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  label: { type: String, required: true },
  metric: { type: String, required: true },
  answer: { type: Object, default: null },
  disabled: { type: Boolean, default: false },
  options: { type: Array, required: true },
})

defineEmits(['change'])

const { t } = useI18n()

const selectedValue = computed(() =>
  typeof props.answer?.[props.metric] === 'number'
    ? props.answer[props.metric]
    : null,
)

const helperText = computed(() =>
  props.metric === 'severity'
    ? t('HeuristicsTestView.answer.severityQuestion')
    : t('HeuristicsTestView.answer.frequencyQuestion'),
)

const severityColor = (value) =>
  ['#cbd5e1', '#f7d8a8', '#f9c74f', '#ff9f1c', '#ff4d67'][value] || '#00213f'
</script>

<style scoped>
.response-control {
  display: grid;
  gap: 0.8rem;
}

.response-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: #151b2a;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.88rem;
  font-weight: 800;
}

.response-label-row small {
  color: #5b6470;
  font-size: 0.78rem;
  font-weight: 500;
}

.option-scale {
  position: relative;
  display: grid;
  gap: 0.55rem;
}

.option-scale--frequency,
.option-scale--severity {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.option-scale::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0.45rem;
  left: 0.45rem;
  height: 1px;
  background: #dce3ed;
  transform: translateY(-50%);
}

.option-card {
  position: relative;
  z-index: 1;
  display: grid;
  min-height: 78px;
  align-content: center;
  justify-items: center;
  gap: 0.28rem;
  padding: 0.85rem 0.65rem;
  border: 1px solid #dce3ed;
  border-radius: 6px;
  color: #3e4856;
  background: #fff;
  cursor: pointer;
  font: inherit;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    color 0.18s ease,
    background-color 0.18s ease;
}

.option-card:hover:not(:disabled) {
  border-color: #00213f;
  box-shadow: 0 8px 20px rgba(0, 33, 63, 0.08);
}

.option-card:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.option-card.selected {
  border-color: #00213f;
  color: #00213f;
  background: #f8fbff;
  box-shadow:
    inset 0 0 0 1px #00213f,
    0 10px 22px rgba(0, 33, 63, 0.1);
}

.option-card--severity.selected {
  border-color: #ff9f1c;
  color: #d97706;
  box-shadow:
    inset 0 0 0 1px #ff9f1c,
    0 10px 22px rgba(255, 159, 28, 0.12);
}

.option-number {
  color: #151b2a;
  font-size: 1.28rem;
  font-weight: 800;
  line-height: 1;
}

.option-text {
  overflow-wrap: anywhere;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.78rem;
  font-weight: 600;
  text-align: center;
}

.severity-dot {
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 999px;
}

@media (max-width: 760px) {
  .response-label-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }

  .option-scale {
    display: flex;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }

  .option-card {
    min-width: 105px;
  }
}
</style>
