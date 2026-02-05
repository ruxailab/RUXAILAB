<template>
  <div class="answer-type-preview">
    <!-- No Answer Preview -->
    <div v-if="taskType === 'no-answer'" class="preview-content">
      <div class="preview-mockup">
        <div class="mockup-message">
          <v-icon color="success" class="mr-2"> mdi-check-circle </v-icon>
          <span class="text-body-2">{{
            $t('CreateTask.previews.noAnswer.message')
          }}</span>
        </div>
      </div>
    </div>

    <!-- Text Area Preview -->
    <div v-else-if="taskType === 'text-area'" class="preview-content">
      <div class="preview-mockup">
        <v-textarea
          readonly
          :placeholder="$t('CreateTask.previews.textArea.placeholder')"
          variant="outlined"
          rows="3"
          class="preview-textarea"
        />
        <div class="mockup-actions">
          <v-btn color="primary" size="small" disabled>
            {{ $t('CreateTask.previews.textArea.submitButton') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Post-Test Questions Preview -->
    <div v-else-if="taskType === 'post-test'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.previews.postTest.title') }}
        </div>
        <div class="question-item mb-3">
          <div class="text-body-2 mb-2">
            {{ $t('CreateTask.previews.postTest.q1') }}
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
            {{ $t('CreateTask.previews.postTest.q2') }}
          </div>
          <v-text-field
            readonly
            :placeholder="
              $t('CreateTask.previews.postTest.feedbackPlaceholder')
            "
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
            {{ $t('CreateTask.previews.postForm.title') }}
          </div>
          <div class="text-body-2 text-grey-darken-1 mb-3">
            {{ $t('CreateTask.previews.postForm.notice') }}
          </div>
          <v-btn color="info" variant="outlined" size="small" disabled>
            {{ $t('CreateTask.previews.postForm.button') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- NASA-TLX Preview -->
    <div v-else-if="taskType === 'nasa-tlx'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.previews.nasaTlx.title') }}
        </div>
        <div class="nasa-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{
              $t('CreateTask.previews.nasaTlx.mental')
            }}</span>
            <span class="text-caption text-grey-darken-1">{{
              $t('CreateTask.previews.nasaTlx.range')
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
              $t('CreateTask.previews.nasaTlx.physical')
            }}</span>
            <span class="text-caption text-grey-darken-1">{{
              $t('CreateTask.previews.nasaTlx.range')
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
          {{ $t('CreateTask.previews.nasaTlx.moreDimensions') }}
        </div>
      </div>
    </div>

    <!-- SUS Preview -->
    <div v-else-if="taskType === 'sus'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.previews.sus.title') }}
        </div>
        <div class="sus-item mb-3">
          <div class="text-body-2 mb-2">
            {{ $t('CreateTask.previews.sus.q1') }}
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
            <span>{{ $t('CreateTask.previews.sus.disagree') }}</span>
            <span>{{ $t('CreateTask.previews.sus.agree') }}</span>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          {{ $t('CreateTask.previews.sus.moreStatements') }}
        </div>
      </div>
    </div>

    <!-- SART Preview -->
    <div v-else-if="taskType === 'sart'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.previews.sart.title') }}
        </div>
        <div class="sart-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{
              $t('CreateTask.previews.sart.instability')
            }}</span>
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
            <span>{{ $t('CreateTask.previews.sart.stable') }}</span>
            <span>{{ $t('CreateTask.previews.sart.unstable') }}</span>
          </div>
        </div>
        <div class="sart-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{
              $t('CreateTask.previews.sart.complexity')
            }}</span>
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
            <span>{{ $t('CreateTask.previews.sart.simple') }}</span>
            <span>{{ $t('CreateTask.previews.sart.complex') }}</span>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          {{ $t('CreateTask.previews.sart.moreDimensions') }}
        </div>
      </div>
    </div>

    <!-- TAM-1 Preview -->
    <div v-else-if="taskType === 'tam-1'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.previews.tam.tam1') }}
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          {{ $t('CreateTask.previews.tam.items2') }}
        </div>

        <!-- Dimension 1 -->
        <div class="tam-dimension mb-4">
          <div class="text-body-2 font-weight-600 mb-2">
            {{ $t('CreateTask.previews.tam.pu') }} (5 items)
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
            {{ $t('CreateTask.previews.tam.eu') }} (5 items)
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
          {{ $t('CreateTask.previews.tam.tam2') }}
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          {{ $t('CreateTask.previews.tam.items7') }}
        </div>

        <div class="tam-dimensions-grid">
          <div
            v-for="(dim, idx) in [
              $t('CreateTask.previews.tam.pu'),
              $t('CreateTask.previews.tam.eu'),
              $t('CreateTask.previews.tam.sn'),
              $t('CreateTask.previews.tam.image'),
              $t('CreateTask.previews.tam.jr'),
              $t('CreateTask.previews.tam.oq'),
              $t('CreateTask.previews.tam.rd'),
            ]"
            :key="idx"
            class="tam-dimension-badge"
          >
            <v-chip size="small" variant="outlined">{{ dim }}</v-chip>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 mt-3">
          {{ $t('CreateTask.previews.tam.likertNote', { count: 25 }) }}
        </div>
      </div>
    </div>

    <!-- TAM-3 Preview -->
    <div v-else-if="taskType === 'tam-3'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('CreateTask.previews.tam.tam3') }}
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          {{ $t('CreateTask.previews.tam.items13') }}
        </div>

        <div class="tam-dimensions-grid">
          <div
            v-for="(dim, idx) in [
              $t('CreateTask.previews.tam.pu'),
              $t('CreateTask.previews.tam.eu'),
              $t('CreateTask.previews.tam.sn'),
              $t('CreateTask.previews.tam.image'),
              $t('CreateTask.previews.tam.jr'),
              $t('CreateTask.previews.tam.oq'),
              $t('CreateTask.previews.tam.rd'),
              $t('CreateTask.previews.tam.se'),
              $t('CreateTask.previews.tam.ec'),
              $t('CreateTask.previews.tam.anxiety'),
              $t('CreateTask.previews.tam.play'),
              $t('CreateTask.previews.tam.enjoy'),
              $t('CreateTask.previews.tam.ou'),
            ]"
            :key="idx"
            class="tam-dimension-badge"
          >
            <v-chip size="small" variant="outlined">{{ dim }}</v-chip>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 mt-3">
          {{ $t('CreateTask.previews.tam.likertNote', { count: 39 }) }}
        </div>
      </div>
    </div>

    <!-- Default/Unknown Type -->
    <div v-else class="preview-content">
      <div class="preview-mockup">
        <div class="text-center text-grey-darken-1">
          <v-icon size="48" class="mb-2"> mdi-help-circle-outline </v-icon>
          <div class="text-body-2">
            {{ $t('CreateTask.previews.selectionPrompt') }}
          </div>
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
