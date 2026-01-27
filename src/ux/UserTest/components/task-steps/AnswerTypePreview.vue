<template>
  <div class="answer-type-preview">
    <!-- No Answer Preview -->
    <div v-if="taskType === 'no-answer'" class="preview-content">
      <div class="preview-mockup">
        <div class="mockup-message">
          <v-icon color="success" class="mr-2"> mdi-check-circle </v-icon>
          <span class="text-body-2">{{
            $t('UserTestAnswerPreview.noAnswer.completed')
          }}</span>
        </div>
      </div>
    </div>

    <!-- Text Area Preview -->
    <div v-else-if="taskType === 'text-area'" class="preview-content">
      <div class="preview-mockup">
        <v-textarea
          readonly
          :placeholder="$t('UserTestAnswerPreview.textArea.placeholder')"
          variant="outlined"
          rows="3"
          class="preview-textarea"
        />
        <div class="mockup-actions">
          <v-btn color="primary" size="small" disabled>
            {{ $t('UserTestAnswerPreview.textArea.submit') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Post-Test Questions Preview -->
    <div v-else-if="taskType === 'post-test'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('UserTestAnswerPreview.postTest.title') }}
        </div>
        <div class="question-item mb-3">
          <div class="text-body-2 mb-2">
            {{ $t('UserTestAnswerPreview.postTest.q1') }}
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
            {{ $t('UserTestAnswerPreview.postTest.q2') }}
          </div>
          <v-text-field
            readonly
            :placeholder="$t('UserTestAnswerPreview.postTest.optional')"
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
            {{ $t('UserTestAnswerPreview.postForm.button') }}
          </div>
          <div class="text-body-2 text-grey-darken-1 mb-3">
            {{ $t('UserTestAnswerPreview.postForm.notice') }}
          </div>
          <v-btn color="info" variant="outlined" size="small" disabled>
            {{ $t('UserTestAnswerPreview.postForm.button') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- NASA-TLX Preview -->
    <div v-else-if="taskType === 'nasa-tlx'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('UserTestAnswerPreview.nasaTlx.title') }}
        </div>
        <div class="nasa-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{
              $t('UserTestAnswerPreview.nasaTlx.mental')
            }}</span>
            <span class="text-caption text-grey-darken-1">{{
              $t('UserTestAnswerPreview.nasaTlx.lowHigh')
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
              $t('UserTestAnswerPreview.nasaTlx.physical')
            }}</span>
            <span class="text-caption text-grey-darken-1">{{
              $t('UserTestAnswerPreview.nasaTlx.lowHigh')
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
          {{ $t('UserTestAnswerPreview.nasaTlx.more') }}
        </div>
      </div>
    </div>

    <!-- SUS Preview -->
    <div v-else-if="taskType === 'sus'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('UserTestAnswerPreview.sus.title') }}
        </div>
        <div class="sus-item mb-3">
          <div class="text-body-2 mb-2">
            {{ $t('UserTestAnswerPreview.sus.q1') }}
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
            <span>{{ $t('UserTestAnswerPreview.sus.disagree') }}</span>
            <span>{{ $t('UserTestAnswerPreview.sus.agree') }}</span>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          {{ $t('UserTestAnswerPreview.sus.more') }}
        </div>
      </div>
    </div>

    <!-- SART Preview -->
    <div v-else-if="taskType === 'sart'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('UserTestAnswerPreview.sart.title') }}
        </div>
        <div class="sart-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{
              $t('UserTestAnswerPreview.sart.instability')
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
            <span>{{ $t('UserTestAnswerPreview.sart.stable') }}</span>
            <span>{{ $t('UserTestAnswerPreview.sart.unstable') }}</span>
          </div>
        </div>
        <div class="sart-item mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{
              $t('UserTestAnswerPreview.sart.complexity')
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
            <span>{{ $t('UserTestAnswerPreview.sart.simple') }}</span>
            <span>{{ $t('UserTestAnswerPreview.sart.complex') }}</span>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 text-center">
          {{ $t('UserTestAnswerPreview.sart.more') }}
        </div>
      </div>
    </div>

    <!-- TAM-1 Preview -->
    <div v-else-if="taskType === 'tam-1'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('UserTestAnswerPreview.tam1.title') }}
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          {{ $t('UserTestAnswerPreview.tam1.items') }}
        </div>

        <!-- Dimension 1 -->
        <div class="tam-dimension mb-4">
          <div class="text-body-2 font-weight-600 mb-2">
            {{ $t('UserTestAnswerPreview.tam1.pu') }}
          </div>
          <div class="tam-item mb-2">
            <div class="text-body-2 mb-2">
              {{ $t('UserTestAnswerPreview.tam1.q1') }}
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
            {{ $t('UserTestAnswerPreview.tam1.peu') }}
          </div>
          <div class="tam-item">
            <div class="text-body-2 mb-2">
              {{ $t('UserTestAnswerPreview.tam1.q6') }}
            </div>
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
          {{ $t('UserTestAnswerPreview.tam2.title') }}
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          {{ $t('UserTestAnswerPreview.tam2.items') }}
        </div>

        <div class="tam-dimensions-grid">
          <div
            v-for="(dim, key) in {
              pu: 'pu',
              peu: 'peu',
              sn: 'sn',
              image: 'image',
              jr: 'jr',
              oq: 'oq',
              rd: 'rd',
            }"
            :key="key"
            class="tam-dimension-badge"
          >
            <v-chip size="small" variant="outlined">{{
              $t(`UserTestAnswerPreview.tam2.dimensions.${dim}`)
            }}</v-chip>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 mt-3">
          {{ $t('UserTestAnswerPreview.tam2.note') }}
        </div>
      </div>
    </div>

    <!-- TAM-3 Preview -->
    <div v-else-if="taskType === 'tam-3'" class="preview-content">
      <div class="preview-mockup">
        <div class="text-subtitle-2 mb-3">
          {{ $t('UserTestAnswerPreview.tam3.title') }}
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-3">
          {{ $t('UserTestAnswerPreview.tam3.items') }}
        </div>

        <div class="tam-dimensions-grid">
          <div
            v-for="(dim, key) in {
              pu: 'pu',
              peu: 'peu',
              sn: 'sn',
              image: 'image',
              jr: 'jr',
              oq: 'oq',
              rd: 'rd',
              ce: 'ce',
              ec: 'ec',
              anx: 'anx',
              play: 'play',
              enj: 'enj',
              ou: 'ou',
            }"
            :key="key"
            class="tam-dimension-badge"
          >
            <v-chip size="small" variant="outlined">{{
              $t(`UserTestAnswerPreview.tam3.dimensions.${dim}`)
            }}</v-chip>
          </div>
        </div>
        <div class="text-caption text-grey-darken-1 mt-3">
          {{ $t('UserTestAnswerPreview.tam3.note') }}
        </div>
      </div>
    </div>

    <!-- Default/Unknown Type -->
    <div v-else class="preview-content">
      <div class="preview-mockup">
        <div class="text-center text-grey-darken-1">
          <v-icon size="48" class="mb-2"> mdi-help-circle-outline </v-icon>
          <div class="text-body-2">
            {{ $t('UserTestAnswerPreview.default.selectType') }}
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
