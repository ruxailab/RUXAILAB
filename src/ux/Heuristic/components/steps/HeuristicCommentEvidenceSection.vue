<template>
  <section class="answer-field answer-field--comments">
    <header class="field-header">
      <div class="field-title">
        <span class="field-icon">
          <v-icon size="20">mdi-comment-text-outline</v-icon>
        </span>
        <div>
          <h3>{{ $t('HeuristicsTestView.answer.commentEvidence') }}</h3>
        </div>
      </div>
      <v-btn
        :color="recording ? 'error' : 'primary'"
        variant="tonal"
        size="small"
        :prepend-icon="recording ? 'mdi-stop' : 'mdi-microphone'"
        :disabled="disabled || (!speechRecognitionSupported && !recording)"
        @click="$emit('toggle-recording')"
      >
        {{
          recording
            ? $t('HeuristicsTestView.answer.stopRecording')
            : $t('HeuristicsTestView.answer.recordAudio')
        }}
      </v-btn>
    </header>

    <div class="field-body">
      <v-alert
        v-if="!speechRecognitionSupported"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        {{ $t('HeuristicsTestView.answer.speechUnsupported') }}
      </v-alert>

      <v-alert
        v-if="recording && liveTranscript"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        {{ liveTranscript }}
      </v-alert>

      <AddCommentBtn
        class="comment-field"
        :heuris-index="heurisIndex"
        :question-index="questionIndex"
        :answer-heu="answerHeu"
        :disable="disabled"
        open-by-default
        :show-images="false"
        :comment-label="$t('HeuristicsTestView.answer.commentLabel')"
        :comment-placeholder="
          $t('HeuristicsTestView.answer.commentPlaceholder')
        "
        @update-comment="
          (comment, sourceHeurisIndex, sourceQuestionIndex) =>
            $emit(
              'update-comment',
              comment,
              sourceHeurisIndex,
              sourceQuestionIndex,
            )
        "
        @add-comment="
          (comment, sourceHeurisIndex, sourceQuestionIndex) =>
            $emit(
              'add-comment',
              comment,
              sourceHeurisIndex,
              sourceQuestionIndex,
            )
        "
        @update-comment-by-id="
          (commentId, text, sourceHeurisIndex, sourceQuestionIndex) =>
            $emit(
              'update-comment-by-id',
              commentId,
              text,
              sourceHeurisIndex,
              sourceQuestionIndex,
            )
        "
        @remove-comment="
          (commentId, sourceHeurisIndex, sourceQuestionIndex) =>
            $emit(
              'remove-comment',
              commentId,
              sourceHeurisIndex,
              sourceQuestionIndex,
            )
        "
      >
        <template #answer>
          <p class="field-help">
            {{ $t('HeuristicsTestView.answer.commentPrompt') }}
          </p>
        </template>
      </AddCommentBtn>
    </div>
  </section>
</template>

<script setup>
import AddCommentBtn from '@/ux/Heuristic/components/AddCommentBtn.vue'

defineProps({
  heurisIndex: { type: Number, required: true },
  questionIndex: { type: Number, required: true },
  answerHeu: { type: Object, default: null },
  disabled: { type: Boolean, default: false },
  recording: { type: Boolean, default: false },
  liveTranscript: { type: String, default: '' },
  speechRecognitionSupported: { type: Boolean, default: false },
})

defineEmits([
  'toggle-recording',
  'update-comment',
  'add-comment',
  'update-comment-by-id',
  'remove-comment',
])
</script>

<style scoped>
.answer-field {
  position: relative;
  overflow: hidden;
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
  color: #9f1239;
  background: rgba(255, 77, 103, 0.12);
}

.field-title h3 {
  margin: 0;
  color: #151b2a;
  font-size: 1.05rem;
  font-weight: 800;
}

.field-body {
  display: block;
  padding: 0.25rem 0 0;
  background: #ffffff;
}

.field-body :deep(.v-row) {
  margin: 0;
}

.field-body :deep(.v-col) {
  padding-right: 0;
  padding-left: 0;
}

.field-help {
  margin: 0 0 1rem;
  color: #5b6470;
  font-size: 0.95rem;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .field-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
