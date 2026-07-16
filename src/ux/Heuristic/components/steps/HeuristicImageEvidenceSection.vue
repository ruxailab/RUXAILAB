<template>
  <section class="answer-field answer-field--images">
    <header class="field-header">
      <div class="field-title">
        <span class="field-icon">
          <v-icon size="20">mdi-image-multiple-outline</v-icon>
        </span>
        <div>
          <h3>{{ $t('HeuristicsTestView.answer.imageEvidence') }}</h3>
        </div>
      </div>
      <v-icon color="primary" size="24">mdi-image-plus-outline</v-icon>
    </header>

    <div class="field-body">
      <AddCommentBtn
        class="image-field"
        :heuris-index="heurisIndex"
        :question-index="questionIndex"
        :answer-heu="answerHeu"
        :disable="disabled"
        open-by-default
        :show-comments="false"
        @update-image="
          (imageUrl, sourceHeurisIndex, sourceQuestionIndex) =>
            $emit(
              'update-image',
              imageUrl,
              sourceHeurisIndex,
              sourceQuestionIndex,
            )
        "
        @add-image="
          (imageUrl, metadata, sourceHeurisIndex, sourceQuestionIndex) =>
            $emit(
              'add-image',
              imageUrl,
              metadata,
              sourceHeurisIndex,
              sourceQuestionIndex,
            )
        "
        @remove-image="
          (imageId, sourceHeurisIndex, sourceQuestionIndex) =>
            $emit(
              'remove-image',
              imageId,
              sourceHeurisIndex,
              sourceQuestionIndex,
            )
        "
      >
        <template #answer>
          <p class="field-help">
            {{ $t('HeuristicsTestView.answer.imagePrompt') }}
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
})

defineEmits(['update-image', 'add-image', 'remove-image'])
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
  color: #0f766e;
  background: rgba(15, 118, 110, 0.12);
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
</style>
