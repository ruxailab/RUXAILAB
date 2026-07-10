<template>
  <div class="response-control">
    <div class="response-label-row">
      <span>{{ $t('HeuristicsTestView.answer.optionsAnalysis') }}</span>
      <small>{{ placeholder }}</small>
    </div>

    <div
      class="option-scale option-scale--custom"
      :style="{ '--option-count': sortedOptions.length }"
    >
      <button
        v-for="option in sortedOptions"
        :key="option.timestamp ?? option.value ?? option.text"
        type="button"
        :class="['option-card', { selected: selectedOption === option }]"
        :disabled="disabled"
        @click="$emit('change', option)"
      >
        <span class="option-number">{{ option.value }}</span>
        <span class="option-text">{{ option.text }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: '' },
  answer: { type: Object, default: null },
  disabled: { type: Boolean, default: false },
  options: { type: Array, required: true },
})

defineEmits(['change'])

const sortedOptions = computed(() =>
  [...props.options].sort((a, b) => {
    const aValue = Number(a.value)
    const bValue = Number(b.value)
    if (!Number.isNaN(aValue) && !Number.isNaN(bValue)) {
      return aValue - bValue
    }
    return String(a.value).localeCompare(String(b.value))
  }),
)

const selectedOptionData = computed(() => props.answer?.custom || null)

const selectedOption = computed(() =>
  sortedOptions.value.find((option) => {
    if (!selectedOptionData.value) return false
    if (selectedOptionData.value.timestamp) {
      return option.timestamp === selectedOptionData.value.timestamp
    }
    if (
      selectedOptionData.value.value !== null &&
      selectedOptionData.value.value !== undefined
    ) {
      return option.value === selectedOptionData.value.value
    }
    return option.text === selectedOptionData.value.text
  }),
)
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
  text-align: right;
}

.option-scale {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--option-count), minmax(0, 1fr));
  gap: 0.55rem;
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

@media (max-width: 760px) {
  .response-label-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }

  .response-label-row small {
    text-align: left;
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
