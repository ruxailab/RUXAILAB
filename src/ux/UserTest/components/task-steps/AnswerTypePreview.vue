<template>
  <div class="answer-type-preview">
    <!-- No Answer Preview -->
    <div v-if="taskType === 'no-answer'" class="preview-content">
      <div class="preview-mockup">
        <div class="mockup-message">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          <span class="text-body-2">Task completed! No additional feedback required.</span>
        </div>
      </div>
    </div>

    <!-- Text Area Preview -->
    <div v-else-if="taskType === 'text-area'" class="preview-content">
      <div class="preview-mockup">
        <v-textarea
          readonly
          placeholder="Participants will provide their feedback here..."
          variant="outlined"
          rows="3"
          class="preview-textarea"
        />
        <div class="mockup-actions">
          <v-btn color="primary" size="small" disabled>Submit Feedback</v-btn>
        </div>
      </div>
    </div>

    <!-- Post-Test Questions Preview -->
    <div v-else-if="taskType === 'post-test'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">Post-Task Questions</div>
        <div class="question-item mb-3">
          <div class="text-body-2 mb-2">1. How would you rate the difficulty of this task?</div>
          <v-rating 
            v-model="mockRating" 
            readonly 
            size="small" 
            color="amber"
            class="mb-2"
          />
        </div>
        <div class="question-item">
          <div class="text-body-2 mb-2">2. Any additional comments?</div>
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
    <div v-else-if="taskType === 'post-form'" class="preview-content">
      <div class="preview-mockup">
        <div class="external-form-notice">
          <v-icon color="info" size="32" class="mb-2">mdi-open-in-new</v-icon>
          <div class="text-subtitle-2 mb-2">External Form</div>
          <div class="text-body-2 text-grey-darken-1 mb-3">
            Participants will be redirected to complete an external form after the task.
          </div>
          <v-btn color="info" variant="outlined" size="small" disabled>
            Open External Form
          </v-btn>
        </div>
      </div>
    </div>

    <!-- NASA-TLX Preview -->
    <div v-else-if="taskType === 'nasa-tlx'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">NASA Task Load Index</div>
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
        <div class="text-caption text-grey-darken-1 text-center">+ 4 more dimensions</div>
      </div>
    </div>

    <!-- SUS Preview -->
    <div v-else-if="taskType === 'sus'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">System Usability Scale</div>
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
        <div class="text-caption text-grey-darken-1 text-center">+ 9 more statements</div>
      </div>
    </div>

    <!-- Default/Unknown Type -->
    <div v-else class="preview-content">
      <div class="preview-mockup">
        <div class="text-center text-grey-darken-1">
          <v-icon size="48" class="mb-2">mdi-help-circle-outline</v-icon>
          <div class="text-body-2">Select an answer type to see preview</div>
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
  display: flex;
  justify-content: center;
}

.preview-content {
  width: 100%;
  max-width: 520px; /* prevents ultra-thin layout */
}

.preview-mockup {
  background: #fafafa;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 8px;
  padding: 16px;
  overflow-x: hidden;
}

/* ---- TEXT WRAPPING FIXES ---- */
.text-body-2,
.text-subtitle-2 {
  word-break: break-word;
  white-space: normal;
}

/* ---- QUESTION ITEMS ---- */
.question-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.question-item:last-child {
  border-bottom: none;
}

/* ---- RATING FIX ---- */
:deep(.v-rating) {
  max-width: 100%;
  flex-wrap: wrap;
}

/* ---- RADIO GROUP FIX ---- */
:deep(.sus-radio-group .v-selection-control-group) {
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px;
}

/* ---- NASA SLIDER FIX ---- */
:deep(.v-slider) {
  max-width: 100%;
}

/* ---- MOBILE OPTIMIZATION ---- */
@media (max-width: 520px) {
  .preview-content {
    max-width: 100%;
  }

  .preview-mockup {
    padding: 12px;
  }

  :deep(.v-rating) {
    transform: scale(0.9);
    transform-origin: left center;
  }

  :deep(.sus-radio-group) {
    font-size: 12px;
  }
}

/* ---- Make preview non-interactive ---- */
:deep(.preview-mockup .v-field--disabled),
:deep(.preview-mockup .v-slider),
:deep(.preview-mockup .v-radio-group) {
  pointer-events: none;
}
</style>