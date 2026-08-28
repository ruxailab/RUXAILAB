<template>
  <ShowInfo hide-col class="heuristic-answer-panel">
    <template #content>
      <div class="heuristic-answer-workspace">
        <header v-if="currentQuestion" class="answer-header">
          <div class="answer-heading">
            <h1>
              {{
                heuristic?.title || $t('HeuristicsTestView.unknownHeuristic')
              }}
            </h1>
          </div>
        </header>

        <v-divider v-if="currentQuestion" />

        <div v-if="currentQuestion" class="answer-question-card">
          <aside class="question-side-menu">
            <div class="side-menu-heading">
              <strong>{{ $t('HeuristicsTestView.answer.questions') }}</strong>
            </div>

            <nav class="question-rail" aria-label="Question navigation">
              <button
                v-for="(question, index) in questions"
                :key="question.id ?? index"
                type="button"
                :class="[
                  'question-rail-item',
                  {
                    active: index === currentQuestionIndex,
                    complete: isQuestionAnswered(index),
                  },
                ]"
                @click="goToQuestion(index)"
              >
                <span class="rail-index">{{ index + 1 }}</span>
                <span class="rail-copy">
                  <span class="rail-title">
                    {{
                      question.title || $t('HeuristicsTestView.unknownQuestion')
                    }}
                  </span>
                  <span class="rail-status">
                    {{
                      isQuestionAnswered(index)
                        ? $t('HeuristicsTestView.answer.answered')
                        : $t('HeuristicsTestView.answer.pending')
                    }}
                  </span>
                </span>
                <v-icon size="18">
                  {{
                    isQuestionAnswered(index)
                      ? 'mdi-check-circle'
                      : 'mdi-circle-outline'
                  }}
                </v-icon>
              </button>
            </nav>
          </aside>

          <div class="answer-content">
            <section class="question-description-box">
              <div class="description-title">
                <v-icon size="20">mdi-clipboard-text-outline</v-icon>
                <strong>{{
                  $t('HeuristicsTestView.answer.questionTitle')
                }}</strong>
                <HelpBtn :question="currentQuestion" />
              </div>
              <p>
                {{
                  questionDescription(currentQuestion) ||
                  currentQuestion.title ||
                  $t('HeuristicsTestView.unknownQuestion')
                }}
              </p>
            </section>

            <div class="answer-blocks">
              <HeuristicOptionsAnalysisSection
                :data-study-field-ref="`heuristic:${canonicalHeuristicIndex}:question:${currentQuestionIndex}:answer`"
                :selected-answer-mode="selectedAnswerMode"
                :answer-mode-label="answerModeLabel(selectedAnswerMode)"
                :has-configured-answer-control="hasConfiguredAnswerControl"
                :answer="
                  answerForQuestion(currentQuestionIndex)?.heuristicAnswer
                "
                :disabled="currentUserTestAnswer?.submitted"
                :frequency-options="frequencyOptions"
                :severity-options="severityOptions"
                :custom-options="customOptions"
                @update-metric="
                  (metric, value) =>
                    updateMetricAnswer(currentQuestionIndex, metric, value)
                "
                @update-custom-option="
                  (value) =>
                    updateCustomOptionAnswer(currentQuestionIndex, value)
                "
              />

              <HeuristicCommentEvidenceSection
                :key="`comments-${currentQuestionIndex}`"
                :data-study-field-ref="`heuristic:${canonicalHeuristicIndex}:question:${currentQuestionIndex}:comment`"
                :heuris-index="heurisIndex"
                :question-index="currentQuestionIndex"
                :answer-heu="answerForQuestion(currentQuestionIndex)"
                :disabled="currentUserTestAnswer?.submitted"
                :recording="recordingQuestionIndex === currentQuestionIndex"
                :live-transcript="liveTranscript"
                :speech-recognition-supported="speechRecognitionSupported"
                @toggle-recording="toggleSpeechRecording(currentQuestionIndex)"
                @update-comment="
                  (comment, sourceHeurisIndex, sourceQuestionIndex) =>
                    $emit(
                      'update-comment',
                      sourceHeurisIndex ?? heurisIndex,
                      sourceQuestionIndex ?? currentQuestionIndex,
                      comment,
                    )
                "
                @add-comment="
                  (comment, sourceHeurisIndex, sourceQuestionIndex) =>
                    $emit(
                      'add-comment',
                      sourceHeurisIndex ?? heurisIndex,
                      sourceQuestionIndex ?? currentQuestionIndex,
                      comment,
                    )
                "
                @update-comment-by-id="
                  (commentId, text, sourceHeurisIndex, sourceQuestionIndex) =>
                    $emit(
                      'update-comment-by-id',
                      sourceHeurisIndex ?? heurisIndex,
                      sourceQuestionIndex ?? currentQuestionIndex,
                      commentId,
                      text,
                    )
                "
                @remove-comment="
                  (commentId, sourceHeurisIndex, sourceQuestionIndex) =>
                    $emit(
                      'remove-comment',
                      sourceHeurisIndex ?? heurisIndex,
                      sourceQuestionIndex ?? currentQuestionIndex,
                      commentId,
                    )
                "
              />

              <HeuristicImageEvidenceSection
                :key="`images-${currentQuestionIndex}`"
                :heuris-index="heurisIndex"
                :question-index="currentQuestionIndex"
                :answer-heu="answerForQuestion(currentQuestionIndex)"
                :disabled="currentUserTestAnswer?.submitted"
                @update-image="
                  (imageUrl, sourceHeurisIndex, sourceQuestionIndex) =>
                    $emit(
                      'update-image',
                      sourceHeurisIndex ?? heurisIndex,
                      sourceQuestionIndex ?? currentQuestionIndex,
                      imageUrl,
                    )
                "
                @add-image="
                  (
                    imageUrl,
                    metadata,
                    sourceHeurisIndex,
                    sourceQuestionIndex,
                  ) =>
                    $emit(
                      'add-image',
                      sourceHeurisIndex ?? heurisIndex,
                      sourceQuestionIndex ?? currentQuestionIndex,
                      imageUrl,
                      metadata,
                    )
                "
                @remove-image="
                  (imageId, sourceHeurisIndex, sourceQuestionIndex) =>
                    $emit(
                      'remove-image',
                      sourceHeurisIndex ?? heurisIndex,
                      sourceQuestionIndex ?? currentQuestionIndex,
                      imageId,
                    )
                "
              />
            </div>

            <nav
              class="heuristic-bottom-menu"
              aria-label="Heuristic navigation"
            >
              <v-btn
                variant="outlined"
                color="primary"
                prepend-icon="mdi-chevron-left"
                class="heuristic-nav-command"
                :disabled="isFirstHeuristic"
                @click="goToHeuristic(heurisIndex - 1)"
              >
                {{ $t('HeuristicsTestView.answer.previousHeuristic') }}
              </v-btn>

              <v-btn
                variant="outlined"
                color="primary"
                append-icon="mdi-chevron-right"
                class="heuristic-nav-command"
                :disabled="isLastHeuristic"
                @click="goToHeuristic(heurisIndex + 1)"
              >
                {{ $t('HeuristicsTestView.answer.nextHeuristic') }}
              </v-btn>

              <v-btn
                variant="flat"
                color="primary"
                :prepend-icon="
                  isEvaluationComplete ? 'mdi-send' : 'mdi-view-grid'
                "
                class="heuristic-list-command"
                @click="handleBottomPrimaryAction"
              >
                {{
                  isEvaluationComplete
                    ? $t('HeuristicsTestView.flow.finishEvaluation')
                    : $t('HeuristicsTestView.answer.backToHeuristicList')
                }}
              </v-btn>
            </nav>
          </div>
        </div>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import HelpBtn from '@/ux/Heuristic/components/QuestionHelpBtn.vue'
import HeuristicCommentEvidenceSection from '@/ux/Heuristic/components/steps/HeuristicCommentEvidenceSection.vue'
import HeuristicImageEvidenceSection from '@/ux/Heuristic/components/steps/HeuristicImageEvidenceSection.vue'
import HeuristicOptionsAnalysisSection from '@/ux/Heuristic/components/steps/HeuristicOptionsAnalysisSection.vue'

const props = defineProps({
  heuristic: { type: Object, default: null },
  heuristics: { type: Array, default: () => [] },
  heurisIndex: { type: Number, required: true },
  currentUserTestAnswer: { type: Object, required: true },
  test: { type: Object, required: true },
})

const { t } = useI18n()

const emit = defineEmits([
  'back',
  'update-answer',
  'update-comment',
  'update-image',
  'add-comment',
  'update-comment-by-id',
  'remove-comment',
  'add-image',
  'remove-image',
  'select-heuristic',
  'finish-evaluation',
])

const recordingQuestionIndex = ref(null)
const liveTranscript = ref('')
const finalTranscript = ref('')
const recognition = ref(null)
const currentQuestionIndex = ref(0)

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

const speechRecognitionSupported = Boolean(SpeechRecognition)

const customOptions = computed(() =>
  Array.isArray(props.test?.testOptions) ? props.test.testOptions : [],
)

const useFrequency = computed(() => props.test?.useFrequency !== false)
const useSeverity = computed(() => props.test?.useSeverity !== false)

const selectedAnswerMode = computed(() => {
  if (customOptions.value.length) return 'customOptions'
  if (useFrequency.value && useSeverity.value) return 'frequencySeverity'
  if (useFrequency.value) return 'frequency'
  if (useSeverity.value) return 'severity'
  return null
})

const hasConfiguredAnswerControl = computed(() =>
  Boolean(selectedAnswerMode.value),
)

const questions = computed(() =>
  Array.isArray(props.heuristic?.questions) && props.heuristic.questions.length
    ? props.heuristic.questions
    : [
        {
          id: props.heuristic?.id,
          title:
            props.heuristic?.title || t('HeuristicsTestView.unknownHeuristic'),
          descriptions: props.heuristic?.description
            ? [{ text: props.heuristic.description }]
            : [],
        },
      ],
)

const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value] || null,
)

const canonicalHeuristicIndex = computed(() => {
  const testStructure = props.test?.testStructure
  if (!Array.isArray(testStructure)) return props.heurisIndex
  const index = testStructure.findIndex(
    (heuristic) => heuristic?.id === props.heuristic?.id,
  )
  return index >= 0 ? index : props.heurisIndex
})

const heuristicNavigationItems = computed(() =>
  props.heuristics.map((heuristic, index) => ({
    id: heuristic?.id ?? index,
    title:
      heuristic?.title ||
      heuristic?.name ||
      `${t('HeuristicsTestView.unknownHeuristic')} ${index + 1}`,
  })),
)

const isFirstHeuristic = computed(() => props.heurisIndex <= 0)
const isLastHeuristic = computed(
  () => props.heurisIndex >= heuristicNavigationItems.value.length - 1,
)

const answerModes = computed(() =>
  [
    {
      title: t('HeuristicsTestView.answer.modes.frequencySeverity'),
      value: 'frequencySeverity',
    },
    {
      title: t('HeuristicsTestView.answer.modes.frequency'),
      value: 'frequency',
    },
    {
      title: t('HeuristicsTestView.answer.modes.severity'),
      value: 'severity',
    },
    {
      title: t('HeuristicsTestView.answer.modes.customOptions'),
      value: 'customOptions',
    },
  ].filter((item) => item.value === selectedAnswerMode.value),
)

const frequencyOptions = [
  { text: t('HeuristicsTestView.answer.frequencyScale.rare'), value: 0 },
  { text: t('HeuristicsTestView.answer.frequencyScale.occasional'), value: 1 },
  { text: t('HeuristicsTestView.answer.frequencyScale.sometimes'), value: 2 },
  { text: t('HeuristicsTestView.answer.frequencyScale.frequent'), value: 3 },
  { text: t('HeuristicsTestView.answer.frequencyScale.constant'), value: 4 },
]

const severityOptions = [
  { text: t('HeuristicsTestView.answer.severityScale.cosmetic'), value: 0 },
  { text: t('HeuristicsTestView.answer.severityScale.minor'), value: 1 },
  { text: t('HeuristicsTestView.answer.severityScale.moderate'), value: 2 },
  { text: t('HeuristicsTestView.answer.severityScale.major'), value: 3 },
  {
    text: t('HeuristicsTestView.answer.severityScale.catastrophic'),
    value: 4,
  },
]

const answerForQuestion = (questionIndex) =>
  props.currentUserTestAnswer?.heuristicQuestions?.[props.heurisIndex]
    ?.heuristicQuestions?.[questionIndex] || null

const questionDescription = (question) =>
  question?.descriptions?.find((description) => description?.text)?.text || ''

const answerModeLabel = (mode) =>
  answerModes.value.find((item) => item.value === mode)?.title || ''

const baseAnswer = (questionIndex, mode) => {
  const existing = answerForQuestion(questionIndex)?.heuristicAnswer || {}
  return {
    ...(existing && typeof existing === 'object' ? existing : {}),
    mode: mode || selectedAnswerMode.value,
  }
}

const answerText = (answer) => {
  const parts = []
  if (answer.frequency !== undefined) {
    parts.push(
      `${t('HeuristicsTestView.answer.frequency')}: ${optionText(
        frequencyOptions,
        answer.frequency,
      )}`,
    )
  }
  if (answer.severity !== undefined) {
    parts.push(
      `${t('HeuristicsTestView.answer.severity')}: ${optionText(
        severityOptions,
        answer.severity,
      )}`,
    )
  }
  if (answer.custom?.text) {
    parts.push(answer.custom.text)
  }
  return parts.join(' | ')
}

const answerValue = (answer) => {
  if (answer.mode === 'customOptions') return answer.custom?.value ?? null
  if (answer.mode === 'frequency') return answer.frequency ?? null
  if (answer.mode === 'severity') return answer.severity ?? null
  return {
    frequency: answer.frequency ?? null,
    severity: answer.severity ?? null,
  }
}

const optionText = (options, value) =>
  options.find((option) => option.value === value)?.text || String(value)

const emitAnswer = (questionIndex, answer) => {
  emit('update-answer', questionIndex, {
    ...answer,
    text: answerText(answer),
    value: answerValue(answer),
  })
}

const sanitizeAnswerForMode = (answer, mode) => {
  const nextAnswer = {
    ...(answer && typeof answer === 'object' ? answer : {}),
    mode,
  }

  if (
    mode === 'customOptions' &&
    !nextAnswer.custom &&
    (nextAnswer.text || nextAnswer.value !== undefined)
  ) {
    nextAnswer.custom = {
      text: nextAnswer.text,
      value: nextAnswer.value,
      timestamp: nextAnswer.timestamp,
    }
  }

  if (mode !== 'frequency' && mode !== 'frequencySeverity') {
    delete nextAnswer.frequency
  }
  if (mode !== 'severity' && mode !== 'frequencySeverity') {
    delete nextAnswer.severity
  }
  if (mode !== 'customOptions') {
    delete nextAnswer.custom
  }

  return nextAnswer
}

const initializeSharedAnswerMode = () => {
  setSharedAnswerMode(selectedAnswerMode.value)
}

const setSharedAnswerMode = (mode) => {
  if (!mode) return

  const questions = props.heuristic?.questions || []
  questions.forEach((_question, questionIndex) => {
    const existingAnswer =
      answerForQuestion(questionIndex)?.heuristicAnswer || {}
    emitAnswer(questionIndex, sanitizeAnswerForMode(existingAnswer, mode))
  })
}

const goToQuestion = (questionIndex) => {
  if (questionIndex < 0 || questionIndex >= questions.value.length) return
  currentQuestionIndex.value = questionIndex
}

const goToHeuristic = (heuristicIndex) => {
  if (
    heuristicIndex < 0 ||
    heuristicIndex >= heuristicNavigationItems.value.length ||
    heuristicIndex === props.heurisIndex
  ) {
    return
  }
  emit('select-heuristic', heuristicIndex)
}

const updateMetricAnswer = (questionIndex, metric, value) => {
  emitAnswer(questionIndex, {
    ...baseAnswer(questionIndex, selectedAnswerMode.value),
    [metric]: value,
  })
}

const updateCustomOptionAnswer = (questionIndex, option) => {
  emitAnswer(questionIndex, {
    ...baseAnswer(questionIndex, 'customOptions'),
    custom: option
      ? {
          text: option.text,
          value: option.value,
          timestamp: option.timestamp,
        }
      : null,
  })
}

const isFilledValue = (value) =>
  value !== undefined && value !== null && value !== ''

const isAnswerComplete = (answer, mode = selectedAnswerMode.value) => {
  if (!answer || typeof answer !== 'object') return false

  if (mode === 'frequency') {
    return isFilledValue(answer.frequency ?? answer.value)
  }

  if (mode === 'severity') {
    return isFilledValue(answer.severity ?? answer.value)
  }

  if (mode === 'frequencySeverity') {
    const value =
      answer.value && typeof answer.value === 'object' ? answer.value : {}
    return (
      isFilledValue(answer.frequency ?? value.frequency) &&
      isFilledValue(answer.severity ?? value.severity)
    )
  }

  if (mode === 'customOptions') {
    return Boolean(
      answer.custom?.text ||
      isFilledValue(answer.custom?.value) ||
      answer.text ||
      isFilledValue(answer.value),
    )
  }

  return isFilledValue(answer.value) || Boolean(answer.text)
}

const isQuestionAnswered = (questionIndex) => {
  const questionAnswer = answerForQuestion(questionIndex)
  if (!questionAnswer) return false
  return isAnswerComplete(questionAnswer.heuristicAnswer)
}

const isEvaluationComplete = computed(() => {
  const heuristicQuestions = props.currentUserTestAnswer?.heuristicQuestions
  if (!Array.isArray(heuristicQuestions) || heuristicQuestions.length === 0) {
    return false
  }
  return heuristicQuestions.every((heuristicAnswer) => {
    if (!Array.isArray(heuristicAnswer?.heuristicQuestions)) return false
    if (heuristicAnswer.heuristicQuestions.length === 0) return false
    return heuristicAnswer.heuristicQuestions.every((question) =>
      isAnswerComplete(question?.heuristicAnswer),
    )
  })
})

const handleBottomPrimaryAction = () => {
  if (isEvaluationComplete.value) {
    emit('finish-evaluation')
    return
  }
  emit('back')
}

const toggleSpeechRecording = (questionIndex) => {
  if (recordingQuestionIndex.value === questionIndex) {
    stopSpeechRecording()
    return
  }
  startSpeechRecording(questionIndex)
}

const saveTranscriptToCommentInput = (questionIndex, transcript) => {
  const text = transcript.trim()
  if (!text || questionIndex === null) return

  const currentComment =
    answerForQuestion(questionIndex)?.heuristicComment?.trim() || ''
  const nextComment = [currentComment, text].filter(Boolean).join(' ')
  emit('update-comment', props.heurisIndex, questionIndex, nextComment)
}

const startSpeechRecording = (questionIndex) => {
  if (!SpeechRecognition) return
  stopSpeechRecording(false)
  liveTranscript.value = ''
  finalTranscript.value = ''
  recordingQuestionIndex.value = questionIndex

  const instance = new SpeechRecognition()
  instance.continuous = true
  instance.interimResults = true
  instance.lang = navigator.language || 'en-US'
  instance.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0]?.transcript || ''
      if (event.results[i].isFinal) {
        finalTranscript.value = `${finalTranscript.value} ${transcript}`.trim()
      } else {
        interim = `${interim} ${transcript}`.trim()
      }
    }
    liveTranscript.value = [finalTranscript.value, interim]
      .filter(Boolean)
      .join(' ')
  }
  instance.onend = () => {
    const questionToSave = recordingQuestionIndex.value
    const text = liveTranscript.value.trim()
    recordingQuestionIndex.value = null
    recognition.value = null
    saveTranscriptToCommentInput(questionToSave, text)
  }
  recognition.value = instance
  instance.start()
}

const stopSpeechRecording = (save = true) => {
  if (!recognition.value) return
  const instance = recognition.value
  if (!save) {
    instance.onend = null
    recordingQuestionIndex.value = null
    recognition.value = null
  }
  instance.stop()
}

onBeforeUnmount(() => {
  stopSpeechRecording(false)
})

watch(
  () => [props.heurisIndex, selectedAnswerMode.value],
  () => {
    currentQuestionIndex.value = 0
    initializeSharedAnswerMode()
  },
  { immediate: true },
)

watch(
  () => questions.value.length,
  (questionCount) => {
    if (currentQuestionIndex.value >= questionCount) {
      currentQuestionIndex.value = Math.max(questionCount - 1, 0)
    }
  },
)
</script>

<style scoped>
.heuristic-answer-panel :deep(.dataCard) {
  background: transparent !important;
}

.heuristic-answer-workspace {
  display: grid;
  gap: 1rem;
  padding: 0;
  background: transparent;
}

.answer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 0 0.65rem;
  border-bottom: 1px solid rgba(0, 33, 63, 0.14);
}

.answer-heading h1 {
  margin: 0;
  color: #20242c;
  font-size: 1.9rem;
  font-weight: 400;
  line-height: 1.25;
}

.answer-question-card {
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
  gap: 1.6rem;
  padding: 1.45rem 1rem 0;
  background: transparent;
}

.question-side-menu {
  position: sticky;
  top: 96px;
  align-self: start;
  display: grid;
  gap: 1rem;
  max-height: calc(100vh - 140px);
  padding: 1rem;
  border: 1px solid rgba(0, 33, 63, 0.14);
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.side-menu-heading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 33, 63, 0.12);
  color: #00213f;
}

.side-menu-heading strong {
  font-size: 0.95rem;
  font-weight: 800;
}

.answer-content {
  display: grid;
  gap: 1.45rem;
  min-width: 0;
}

.question-description-box {
  position: relative;
  overflow: hidden;
  padding: 1.35rem 1.45rem;
  border: 1px solid rgba(0, 33, 63, 0.32);
  border-left: 5px solid #00213f;
  border-radius: 6px;
  color: #00213f;
  background:
    linear-gradient(135deg, rgba(223, 232, 251, 0.62), #fff 58%), #fff;
  box-shadow: 0 12px 28px rgba(0, 33, 63, 0.08);
}

.description-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1rem;
  color: #00213f;
  font-size: 0.95rem;
}

.description-title strong {
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.description-title :deep(.v-btn) {
  margin-left: auto;
}

.question-description-box p {
  margin: 0;
  max-width: 960px;
  color: #111827;
  font-size: 1.18rem;
  font-weight: 650;
  line-height: 1.55;
}

.question-rail {
  display: grid;
  gap: 0.55rem;
  overflow-y: auto;
  padding-right: 0.15rem;
}

.question-rail-item {
  display: grid;
  grid-template-columns: 1.45rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 52px;
  padding: 0.55rem;
  border: 1px solid #c9cdd3;
  border-radius: 4px;
  color: #5b6470;
  background: #ffffff;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.question-rail-item:hover {
  border-color: #00213f;
}

.question-rail-item.active {
  border-color: #00213f;
  color: #fff;
  background: #00213f;
}

.question-rail-item.complete {
  color: #00213f;
}

.question-rail-item.active.complete {
  color: #fff;
}

.rail-index {
  display: inline-flex;
  width: 1.45rem;
  height: 1.45rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #00213f;
  background: #dfe8fb;
  font-size: 0.78rem;
  font-weight: 800;
}

.rail-copy {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.question-rail-item.active .rail-index {
  color: #00213f;
  background: #fff;
}

.question-rail-item.complete:not(.active) .rail-index {
  color: #fff;
  background: #ff4d67;
}

.rail-title {
  overflow: hidden;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rail-status {
  color: #7d8794;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.question-rail-item.active .rail-status {
  color: rgba(255, 255, 255, 0.78);
}

.question-rail-item.complete:not(.active) .rail-status {
  color: #ff4d67;
}

.answer-blocks {
  display: grid;
  gap: 1.75rem;
}

.heuristic-bottom-menu {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  align-items: stretch;
  padding: 1rem 0 0;
  border-top: 1px solid rgba(0, 33, 63, 0.12);
}

.heuristic-nav-command,
.heuristic-list-command {
  min-height: 42px;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 960px) {
  .answer-header,
  .answer-question-card,
  .heuristic-bottom-menu {
    display: grid;
    grid-template-columns: 1fr;
  }

  .question-side-menu {
    position: static;
    max-height: none;
  }

  .question-rail {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    overflow-y: visible;
  }
}

@media (max-width: 640px) {
  .answer-header {
    gap: 0.75rem;
  }

  .answer-heading h1 {
    font-size: 1.45rem;
  }
}
</style>
