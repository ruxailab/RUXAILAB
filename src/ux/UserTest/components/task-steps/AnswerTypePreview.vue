<template>
  <div class="answer-type-preview">
    <!-- No Answer Preview -->
    <div v-if="taskType === 'no-answer'" class="preview-content">
      <div class="preview-mockup">
        <div class="mockup-message">
          <v-icon color="success" class="mr-2"> mdi-check-circle </v-icon>
          <span class="text-body-2">{{
            $t('CreateTask.answerTypePreview.taskCompleted')
          }}</span>
        </div>
      </div>
    </div>

    <!-- Text Area Preview -->
    <div v-else-if="taskType === 'text-area'" class="preview-content">
      <div class="preview-mockup">
        <v-textarea
          readonly
          :placeholder="
            $t('CreateTask.answerTypePreview.participantsFeedbackHere')
          "
          variant="outlined"
          rows="3"
          class="preview-textarea"
        />
        <div class="mockup-actions">
          <v-btn color="primary" size="small" disabled>
            {{ $t('CreateTask.answerTypePreview.submitFeedback') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Post-Test Questions Preview -->
    <div v-else-if="taskType === 'post-test'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.answerTypePreview.postTaskQuestions') }}
        </div>
        <div class="question-item mb-3">
          <div class="text-body-2 mb-2">
            {{ $t('CreateTask.answerTypePreview.rateTaskDifficulty') }}
          </div>
          <v-rating
            v-model="mockRating"
            readonly
            size="small"
            color="amber"
            class="mb-2"
          />
        </div>
        <div class="question-item">
          <div class="text-body-2 mb-2">
            {{ $t('CreateTask.answerTypePreview.additionalComments') }}
          </div>
          <v-text-field
            readonly
            :placeholder="$t('CreateTask.answerTypePreview.optionalFeedback')"
            variant="outlined"
            density="compact"
          />
        </div>
      </div>
    </div>

    <!-- External Form Preview -->
    <div v-else-if="taskType === 'post-form'" class="preview-content">
      <div class="preview-mockup">
        <div class="external-form-notice">
          <v-icon color="info" size="32" class="mb-2"> mdi-open-in-new </v-icon>
          <div class="text-subtitle-2 mb-2">
            {{ $t('CreateTask.answerTypePreview.externalFormTitle') }}
          </div>
          <div class="text-body-2 text-grey-darken-1 mb-3">
            {{ $t('CreateTask.answerTypePreview.externalFormDescription') }}
          </div>
          <v-btn color="info" variant="outlined" size="small" disabled>
            {{ $t('CreateTask.answerTypePreview.openExternalForm') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- NASA-TLX Preview -->
    <div v-else-if="taskType === 'nasa-tlx'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.answerTypePreview.nasaTlxTitle') }}
        </div>
        <div class="nasa-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{
              $t('CreateTask.answerTypePreview.mentalDemand')
            }}</span>
            <span class="text-caption text-grey-darken-1">{{
              $t('CreateTask.answerTypePreview.lowHigh')
            }}</span>
          </div>
          <v-slider
            readonly
            :model-value="50"
            color="primary"
            track-color="grey-lighten-2"
            thumb-size="12"
          />
        </div>
        <div class="nasa-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{
              $t('CreateTask.answerTypePreview.physicalDemand')
            }}</span>
            <span class="text-caption text-grey-darken-1">{{
              $t('CreateTask.answerTypePreview.lowHigh')
            }}</span>
          </div>
          <v-slider
            readonly
            :model-value="25"
            color="primary"
            track-color="grey-lighten-2"
            thumb-size="12"
          />
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          {{ $t('CreateTask.answerTypePreview.moreDimensions') }}
        </div>
      </div>
    </div>

    <!-- SUS Preview -->
    <div v-else-if="taskType === 'sus'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.answerTypePreview.susTitle') }}
        </div>
        <div class="sus-item mb-3">
          <div class="text-body-2 mb-2">
            {{ $t('CreateTask.answerTypePreview.susStatement1') }}
          </div>
          <v-radio-group
            readonly
            inline
            density="compact"
            class="sus-radio-group"
          >
            <v-radio
              v-for="n in 5"
              :key="n"
              :value="n"
              :label="`${n}`"
              density="compact"
            />
          </v-radio-group>
          <div
            class="d-flex justify-space-between text-caption text-grey-darken-1 mt-1"
          >
            <span>{{
              $t('CreateTask.answerTypePreview.stronglyDisagree')
            }}</span>
            <span>{{ $t('CreateTask.answerTypePreview.stronglyAgree') }}</span>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          {{ $t('CreateTask.answerTypePreview.moreStatements') }}
        </div>
      </div>
    </div>

    <!-- SART Preview -->
    <div v-else-if="taskType === 'sart'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.answerTypePreview.sartTitle') }}
        </div>
        <div class="sart-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">Instability of Situation</span>
            <span class="text-caption text-grey-darken-1">1 - 7</span>
          </div>
          <v-slider
            readonly
            :model-value="4"
            :min="1"
            :max="7"
            color="primary"
            track-color="grey-lighten-2"
            thumb-size="12"
            :ticks="[1, 4, 7]"
            tick-size="3"
          />
          <div
            class="d-flex justify-space-between text-caption text-grey-darken-1 mt-1"
          >
            <span>Very Stable</span>
            <span>Very Unstable</span>
          </div>
        </div>
        <div class="sart-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">Complexity of Situation</span>
            <span class="text-caption text-grey-darken-1">1 - 7</span>
          </div>
          <v-slider
            readonly
            :model-value="3"
            :min="1"
            :max="7"
            color="primary"
            track-color="grey-lighten-2"
            thumb-size="12"
            :ticks="[1, 4, 7]"
            tick-size="3"
          />
          <div
            class="d-flex justify-space-between text-caption text-grey-darken-1 mt-1"
          >
            <span>Very Simple</span>
            <span>Very Complex</span>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          + 8 more SART dimensions
        </div>
      </div>
    </div>

    <!-- TAM-1 Preview -->
    <div v-else-if="taskType === 'tam-1'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          TAM-1: Technology Acceptance Model (Basic)
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          10 items across 2 dimensions
        </div>

        <!-- Dimension 1 -->
        <div class="tam-dimension mb-4">
          <div class="text-body-2 font-weight-600 mb-2">
            Perceived Usefulness (5 items)
          </div>
          <div class="tam-item mb-2">
            <div class="text-body-2 mb-2">
              1. Using the system improves my job performance.
            </div>
            <v-radio-group
              readonly
              inline
              density="compact"
              class="tam-radio-group"
            >
              <v-radio
                v-for="n in 5"
                :key="`pu-${n}`"
                :value="n"
                :label="`${n}`"
                density="compact"
              />
            </v-radio-group>
          </div>
        </div>

        <!-- Dimension 2 -->
        <div class="tam-dimension">
          <div class="text-body-2 font-weight-600 mb-2">
            Perceived Ease of Use (5 items)
          </div>
          <div class="tam-item">
            <div class="text-body-2 mb-2">6. The system is easy to use.</div>
            <v-radio-group
              readonly
              inline
              density="compact"
              class="tam-radio-group"
            >
              <v-radio
                v-for="n in 5"
                :key="`eu-${n}`"
                :value="n"
                :label="`${n}`"
                density="compact"
              />
            </v-radio-group>
          </div>
        </div>
      </div>
    </div>

    <!-- TAM-2 Preview -->
    <div v-else-if="taskType === 'tam-2'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          TAM-2: Technology Acceptance Model (Extended)
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          25 items across 7 dimensions
        </div>

        <div class="tam-dimensions-grid">
          <div
            v-for="(dim, idx) in [
              'Perceived Usefulness',
              'Perceived Ease of Use',
              'Subjective Norm',
              'Image',
              'Job Relevance',
              'Output Quality',
              'Result Demonstrability',
            ]"
            :key="idx"
            class="tam-dimension-badge"
          >
            <v-chip size="small" variant="outlined">{{ dim }}</v-chip>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 mt-3">
          Participants rate 25 statements on a 5-point Likert scale (Strongly
          Disagree - Strongly Agree)
        </div>
      </div>
    </div>

    <!-- TAM-3 Preview -->
    <div v-else-if="taskType === 'tam-3'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          TAM-3: Technology Acceptance Model (Comprehensive)
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          39 items across 13 dimensions
        </div>

        <div class="tam-dimensions-grid">
          <div
            v-for="(dim, idx) in [
              'Perceived Usefulness',
              'Perceived Ease of Use',
              'Subjective Norm',
              'Image',
              'Job Relevance',
              'Output Quality',
              'Result Demonstrability',
              'Computer Self-Efficacy',
              'External Control',
              'Anxiety',
              'Playfulness',
              'Enjoyment',
              'Objective Usability',
            ]"
            :key="idx"
            class="tam-dimension-badge"
          >
            <v-chip size="small" variant="outlined">{{ dim }}</v-chip>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 mt-3">
          Comprehensive assessment with 39 statements across 13 dimensions on a
          5-point Likert scale
        </div>
      </div>
    </div>

    <!-- Default/Unknown Type -->
    <div v-else class="preview-content">
      <div class="preview-mockup">
        <div class="text-center text-grey-darken-1">
          <v-icon size="48" class="mb-2"> mdi-help-circle-outline </v-icon>
          <div class="text-body-2">Select an answer type to see preview</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  taskType: {
    type: String,
    default: '',
  },
})

// Mock data for previews
const mockRating = ref(4)
</script>

<style scoped>
.answer-type-preview {
  width: 100%;
}

.preview-content {
  min-height: 120px;
}

.preview-mockup {
  background: #fafafa;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 8px;
  padding: 16px;
}

.mockup-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.mockup-actions {
  text-align: right;
  margin-top: 12px;
}

.preview-textarea {
  pointer-events: none;
}

.question-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.question-item:last-child {
  border-bottom: none;
}

.external-form-notice {
  text-align: center;
  padding: 20px;
}

.nasa-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.sus-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.tam-dimension {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.tam-item {
  padding: 8px 0;
}

.tam-radio-group {
  margin: 8px 0 4px 0;
}

.tam-dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.tam-dimension-badge {
  display: flex;
  justify-content: center;
}

.sus-radio-group {
  margin: 8px 0 4px 0;
}

:deep(.sus-radio-group .v-selection-control-group) {
  justify-content: space-between;
}

/* Make form elements non-interactive in preview */
:deep(.preview-mockup .v-field--disabled) {
  opacity: 0.8;
}

:deep(.preview-mockup .v-slider) {
  pointer-events: none;
}

:deep(.preview-mockup .v-radio-group) {
  pointer-events: none;
}

.sart-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}
</style>
