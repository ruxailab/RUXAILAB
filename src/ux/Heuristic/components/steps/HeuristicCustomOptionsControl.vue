<template>
  <div class="response-control">
    <div class="response-label-row">
      <div class="response-label">
        <span>{{ $t('HeuristicsTestView.answer.optionsAnalysis') }}</span>
        <v-btn
          v-if="optionsWithDescriptions.length"
          icon="mdi-information-outline"
          size="x-small"
          variant="text"
          color="primary"
          title="View response descriptions"
          aria-label="View response descriptions"
          @click="showDescriptions = true"
        />
      </div>
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
        <span class="option-action">{{ option.text }}</span>
      </button>
    </div>

    <v-dialog v-model="showDescriptions" max-width="620">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2">
          <v-icon color="primary">mdi-information-outline</v-icon>
          Response descriptions
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-list class="pa-0" lines="three">
            <v-list-item
              v-for="option in optionsWithDescriptions"
              :key="option.timestamp ?? option.value ?? option.text"
            >
              <v-list-item-title class="font-weight-bold">
                {{ option.text }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-wrap mt-1">
                {{ option.description }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDescriptions = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: '' },
  answer: { type: Object, default: null },
  disabled: { type: Boolean, default: false },
  options: { type: Array, required: true },
})

defineEmits(['change'])

const showDescriptions = ref(false)

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

const optionsWithDescriptions = computed(() =>
  sortedOptions.value.filter((option) => option.description?.trim()),
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

.response-label {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
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

.option-action {
  overflow-wrap: anywhere;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.35;
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
