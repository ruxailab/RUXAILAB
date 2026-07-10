<template>
  <section class="answer-field answer-field--options">
    <header class="field-header">
      <div class="field-title">
        <span class="field-icon">
          <v-icon size="20">mdi-tune-variant</v-icon>
        </span>
        <div>
          <h3>{{ sectionTitle }}</h3>
        </div>
      </div>
    </header>

    <div class="field-body">
      <p class="field-help">
        {{ $t('HeuristicsTestView.answer.chooseBestOption') }}
      </p>

      <v-alert
        v-if="!hasConfiguredAnswerControl"
        type="warning"
        variant="tonal"
      >
        {{ $t('HeuristicsTestView.errors.noAnswerOptions') }}
      </v-alert>

      <div v-else-if="selectedAnswerMode === 'frequencySeverity'" class="response-grid">
        <ResponseControl
          :label="$t('HeuristicsTestView.answer.frequency')"
          metric="frequency"
          :answer="answer"
          :disabled="disabled"
          :options="frequencyOptions"
          @change="$emit('update-metric', 'frequency', $event)"
        />
        <ResponseControl
          :label="$t('HeuristicsTestView.answer.severity')"
          metric="severity"
          :answer="answer"
          :disabled="disabled"
          :options="severityOptions"
          @change="$emit('update-metric', 'severity', $event)"
        />
      </div>

      <ResponseControl
        v-else-if="selectedAnswerMode === 'frequency'"
        :label="$t('HeuristicsTestView.answer.frequency')"
        metric="frequency"
        :answer="answer"
        :disabled="disabled"
        :options="frequencyOptions"
        @change="$emit('update-metric', 'frequency', $event)"
      />

      <ResponseControl
        v-else-if="selectedAnswerMode === 'severity'"
        :label="$t('HeuristicsTestView.answer.severity')"
        metric="severity"
        :answer="answer"
        :disabled="disabled"
        :options="severityOptions"
        @change="$emit('update-metric', 'severity', $event)"
      />

      <CustomOptionsControl
        v-else
        :answer="answer"
        :disabled="disabled"
        :options="customOptions"
        :placeholder="$t('HeuristicsTestView.answer.chooseBestOption')"
        @change="$emit('update-custom-option', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomOptionsControl from '@/ux/Heuristic/components/steps/HeuristicCustomOptionsControl.vue'
import ResponseControl from '@/ux/Heuristic/components/steps/HeuristicResponseControl.vue'

const props = defineProps({
  selectedAnswerMode: { type: String, default: null },
  answerModeLabel: { type: String, default: '' },
  hasConfiguredAnswerControl: { type: Boolean, required: true },
  answer: { type: Object, default: null },
  disabled: { type: Boolean, default: false },
  frequencyOptions: { type: Array, required: true },
  severityOptions: { type: Array, required: true },
  customOptions: { type: Array, required: true },
})

defineEmits(['update-metric', 'update-custom-option'])

const { t } = useI18n()

const sectionTitle = computed(() => {
  if (props.selectedAnswerMode === 'frequency') {
    return t('HeuristicsTestView.answer.frequencyOccurrence')
  }
  if (props.selectedAnswerMode === 'severity') {
    return t('HeuristicsTestView.answer.severityRanking')
  }
  return t('HeuristicsTestView.answer.optionsAnalysis')
})
</script>

<style scoped>
.answer-field {
  position: relative;
  overflow: hidden;
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
  background: transparent;
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
  color: #00213f;
  background: #dfe8fb;
}

.field-title h3 {
  margin: 0;
  color: #151b2a;
  font-size: 1.05rem;
  font-weight: 800;
}

.field-body {
  padding: 0.25rem 0 0;
  background: #ffffff;
}

.field-help {
  margin: 0 0 1rem;
  color: #5b6470;
  font-size: 0.95rem;
  line-height: 1.45;
}

.response-grid {
  display: grid;
  gap: 1.35rem;
}
</style>
