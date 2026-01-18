<template>
  <div class="answer-type-preview">
    <!-- No Answer Preview -->
    <div
      v-if="taskType === 'no-answer'"
      class="preview-content"
    >
      <div class="preview-mockup">
        <div class="mockup-message">
          <v-icon
            color="success"
            class="mr-2"
          >
            mdi-check-circle
          </v-icon>
          <span class="text-body-2">Task completed! No additional feedback required.</span>
        </div>
      </div>
    </div>

    <!-- Text Area Preview -->
    <div
      v-else-if="taskType === 'text-area'"
      class="preview-content"
    >
      <div class="preview-mockup">
        <v-textarea
          readonly
          placeholder="Participants will provide their feedback here..."
          variant="outlined"
          rows="3"
          class="preview-textarea"
        />
        <div class="mockup-actions">
          <v-btn
            color="primary"
            size="small"
            disabled
          >
            Submit Feedback
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Post-Test Questions Preview -->
    <div
      v-else-if="taskType === 'post-test'"
      class="preview-content"
    >
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          Post-Task Questions
        </div>
        <div class="question-item mb-3">
          <div class="text-body-2 mb-2">
            1. How would you rate the difficulty of this task?
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
            2. Any additional comments?
          </div>
          <v-text-field
            readonly
            placeholder="Optional feedback..."
            variant="outlined"
            density="compact"
          />
        </div>
      </div>
    </div>

    <!-- External Form Preview -->
    <div
      v-else-if="taskType === 'post-form'"
      class="preview-content"
    >
      <div class="preview-mockup">
        <div class="external-form-notice">
          <v-icon
            color="info"
            size="32"
            class="mb-2"
          >
            mdi-open-in-new
          </v-icon>
          <div class="text-subtitle-2 mb-2">
            External Form
          </div>
          <div class="text-body-2 text-grey-darken-1 mb-3">
            Participants will be redirected to complete an external form after the task.
          </div>
          <v-btn
            color="info"
            variant="outlined"
            size="small"
            disabled
          >
            Open External Form
          </v-btn>
        </div>
      </div>
    </div>

    <!-- NASA-TLX Preview -->
    <div
      v-else-if="taskType === 'nasa-tlx'"
      class="preview-content"
    >
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          NASA Task Load Index
        </div>
        <div class="nasa-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">Mental Demand</span>
            <span class="text-caption text-grey-darken-1">Low - High</span>
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
            <span class="text-body-2">Physical Demand</span>
            <span class="text-caption text-grey-darken-1">Low - High</span>
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
          + 4 more dimensions
        </div>
      </div>
    </div>

    <!-- SUS Preview -->
    <div
      v-else-if="taskType === 'sus'"
      class="preview-content"
    >
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          System Usability Scale
        </div>
        <div class="sus-item mb-3">
          <div class="text-body-2 mb-2">
            1. I think that I would like to use this system frequently.
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
          <div class="d-flex justify-space-between text-caption text-grey-darken-1 mt-1">
            <span>Strongly Disagree</span>
            <span>Strongly Agree</span>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          + 9 more statements
        </div>
      </div>
    </div>

    <!-- SART Preview -->
    <div
      v-else-if="taskType === 'sart'"
      class="preview-content"
    >
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          Situation Awareness Rating Technique
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
            :ticks="[1,4,7]"
            tick-size="3"
          />
          <div class="d-flex justify-space-between text-caption text-grey-darken-1 mt-1">
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
            :ticks="[1,4,7]"
            tick-size="3"
          />
          <div class="d-flex justify-space-between text-caption text-grey-darken-1 mt-1">
            <span>Very Simple</span>
            <span>Very Complex</span>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          + 8 more SART dimensions
        </div>
      </div>
    </div>

    <!-- Default/Unknown Type -->
    <div
      v-else
      class="preview-content"
    >
      <div class="preview-mockup">
        <div class="text-center text-grey-darken-1">
          <v-icon
            size="48"
            class="mb-2"
          >
            mdi-help-circle-outline
          </v-icon>
          <div class="text-body-2">
            Select an answer type to see preview
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  taskType: {
    type: String,
    default: ''
  }
});

// Mock data for previews
const mockRating = ref(4);
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
