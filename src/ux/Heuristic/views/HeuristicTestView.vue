<template>
  <div>
    <Snackbar />
    <!-- Submit Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-error text-white" primary-title>
          {{ $t('HeuristicsTestView.messages.submitTest') }}
        </v-card-title>

        <v-card-text>
          {{ $t('HeuristicsTestView.messages.submitOnce') }}
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            class="bg-grey-lighten-3"
            variant="text"
            @click="dialog = false"
          >
            {{ $t('HeuristicsTestView.actions.cancel') }}
          </v-btn>
          <v-btn
            class="bg-error text-white ml-1"
            variant="text"
            @click="(submitAnswer(), (dialog = false))"
          >
            {{ $t('HeuristicsTestView.actions.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AutoSaveStatusBanner
      v-if="!start && !currentUserTestAnswer?.submitted"
      :message="saveStatusMessage"
      :status-type="saveStatusType"
      :is-saving="autoSaveInProgress"
      :last-save-text="
        lastSaveTime && saveStatusType === 'success' ? formatLastSaveTime() : ''
      "
      :show-action="saveStatusType === 'error'"
      helper-message="Changes are saved automatically while you work."
      @action="manualSaveAnswer"
    />

    <v-dialog
      :model-value="fromlink && !noExistUser && !logined"
      width="500"
      persistent
    >
      <v-card v-if="user">
        <v-row class="ma-0 pa-0 pt-5" justify="center">
          <v-avatar
            class="justify-center"
            color="secondary-lighten-2"
            size="150"
          >
            <v-icon size="120"> mdi-account </v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn class="text-white bg-primary" @click="setTest()">
            {{
              $t('HeuristicsTestView.actions.continueAs', {
                userMail: user.email,
              })
            }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            {{
              $t('HeuristicsTestView.actions.notMail', {
                userEmail: user.email,
              })
            }}
            <a style="color: #3f51b5" @click="signOut()">{{
              $t('HeuristicsTestView.actions.changeAccount')
            }}</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <EvaluatorInfoDisplay
      v-if="showEvaluatorInfo"
      :sections="evaluatorInfoSections"
      @start="evaluatorInfoAcknowledged = true"
    />

    <v-container v-if="test && start" fluid class="pa-0">
      <v-row
        :class="[
          currentPage === TEST_PAGES.welcome
            ? 'start-screen background-img'
            : 'instructions-screen',
          'pa-0 ma-0',
        ]"
        :align="currentPage === TEST_PAGES.welcome ? 'center' : 'start'"
      >
        <v-col
          v-if="currentPage === TEST_PAGES.welcome"
          cols="12"
          md="8"
          class="ma-5 pa-5"
        >
          <img
            src="../../../assets/logo_full_white.png"
            alt="RUXAILAB"
            class="mb-10"
            style="max-width: 300px"
          />
          <h1 class="text-h2 font-weight-bold text-white">
            {{ test.testTitle }}
          </h1>
          <p class="text-body-1 mb-5 text-white text-justify">
            {{ truncateDescription(test.testDescription) }}
          </p>
          <v-btn
            color="white"
            variant="outlined"
            rounded
            class="mt-4"
            :disabled="isStartTestDisabled || !answerInitialized"
            @click="openInstructionsPage"
          >
            {{ $t('HeuristicsTestView.actions.startTest') }}
          </v-btn>

          <v-alert
            v-if="testDisabledReason === 'already-completed'"
            type="info"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-check-circle </v-icon>
            </template>
            <span class="text-white">
              <strong>{{
                $t('HeuristicsTestView.alerts.testAlreadyCompleted')
              }}</strong
              ><br />
              {{ $t('HeuristicsTestView.alerts.testAlreadyCompletedMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'no-heuristics'"
            type="error"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-alert-circle </v-icon>
            </template>
            <span class="text-white">
              <strong>{{
                $t('HeuristicsTestView.alerts.testConfigError')
              }}</strong
              ><br />
              {{ $t('HeuristicsTestView.messages.noHeuristicsConfigured') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'no-answer-options'"
            type="error"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white">mdi-alert-circle</v-icon>
            </template>

            <span class="text-white">
              <strong>
                {{ $t('HeuristicsTestView.alerts.testConfigError') }}
              </strong>
              <br />
              {{ $t('HeuristicsTestView.alerts.noAnswerOptionsConfigured') }}
            </span>
          </v-alert>
        </v-col>
        <v-col v-else cols="12" class="pa-6">
          <HeuristicInstructionsStep
            :sections="evaluatorInfoSections"
            :disabled="isStartTestDisabled"
            @start="startTest"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-container v-else fluid class="pa-0">
      <v-row class="main-test-interface pa-0 ma-0">
        <v-col ref="rightView" class="right-view pa-6">
          <v-row class="stepper-row sticky-stepper">
            <v-col cols="12">
              <v-stepper
                :model-value="heuristicStepperValue"
                class="main-stepper rounded-xl elevation-3"
                style="visibility: visible"
              >
                <v-stepper-header>
                  <v-stepper-item
                    value="1"
                    :title="$t('HeuristicsTestView.flow.instructions')"
                    complete
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="2"
                    :title="$t('HeuristicsTestView.flow.heuristicEvaluation')"
                    :complete="
                      review == false || currentUserTestAnswer?.submitted
                    "
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="3"
                    :title="$t('HeuristicsTestView.flow.finalSubmission')"
                    :complete="currentUserTestAnswer?.submitted"
                    color="white"
                    complete-icon="mdi-check"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <v-row class="justify-center">
            <v-col cols="12" lg="10" xl="9">
              <HeuristicCardsStep
                v-if="index == 1 && review == true && showHeuristicCards"
                :heuristics="heuristics"
                :current-user-test-answer="currentUserTestAnswer"
                :calculated-progress="calculatedProgress"
                :per-heuristic-progress="perHeuristicProgress"
                :heuristic-description="heuristicDescription"
                :heuristic-storage="heuristicStorage"
                @select-heuristic="handleHeurisClick"
                @finish-evaluation="review = false"
              />

              <HeuristicAnswerStep
                v-if="index == 1 && review == true && !showHeuristicCards"
                :heuristic="heuristics[heurisIndex]"
                :heuristics="heuristics"
                :heuris-index="heurisIndex"
                :current-user-test-answer="currentUserTestAnswer"
                :test="test"
                @back="showHeuristicCards = true"
                @select-heuristic="handleHeurisClick"
                @finish-evaluation="review = false"
                @update-answer="
                  (questionIndex, value) =>
                    updateHeuristicAnswer(heurisIndex, questionIndex, value)
                "
                @update-comment="
                  (sourceHeurisIndex, questionIndex, comment) =>
                    updateComment(comment, sourceHeurisIndex, questionIndex)
                "
                @update-image="
                  (sourceHeurisIndex, questionIndex, imageUrl) =>
                    updateImageUrl(imageUrl, sourceHeurisIndex, questionIndex)
                "
                @add-comment="
                  (sourceHeurisIndex, questionIndex, comment) =>
                    addComment(comment, sourceHeurisIndex, questionIndex)
                "
                @update-comment-by-id="
                  (sourceHeurisIndex, questionIndex, commentId, text) =>
                    updateCommentById(
                      commentId,
                      text,
                      sourceHeurisIndex,
                      questionIndex,
                    )
                "
                @remove-comment="
                  (sourceHeurisIndex, questionIndex, commentId) =>
                    removeComment(commentId, sourceHeurisIndex, questionIndex)
                "
                @add-image="
                  (sourceHeurisIndex, questionIndex, imageUrl, metadata) =>
                    addImage(
                      imageUrl,
                      sourceHeurisIndex,
                      questionIndex,
                      metadata,
                    )
                "
                @remove-image="
                  (sourceHeurisIndex, questionIndex, imageId) =>
                    removeImage(imageId, sourceHeurisIndex, questionIndex)
                "
              />

              <div v-if="calculatedProgress == 100 && review == false">
                <HeuristicFinishStep @submit="dialog = true" />
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <v-btn
      v-if="showSaveBtn && !start"
      position="fixed"
      location="bottom right"
      icon
      class="mb-10 mr-5"
    >
      <v-speed-dial v-model="fab" class="mr-3" open-on-hover>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            size="large"
            color="primary"
            icon
            class="btn-fix"
          >
            <v-icon v-if="fab"> mdi-close </v-icon>
            <v-icon v-else size="large"> mdi-hammer-screwdriver </v-icon>
          </v-btn>
        </template>
        <v-tooltip key="save-tooltip" location="left">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              color="secondary"
              @click="manualSaveAnswer"
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <div>
            <span>{{ $t('HeuristicsTestView.actions.save') }}</span>
          </div>
        </v-tooltip>
        <v-tooltip key="submit-tooltip" location="left">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :disabled="calculatedProgress < 100"
              class="text-white"
              icon
              size="small"
              color="success"
              @click="dialog = true"
            >
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <div>
            <span>{{ $t('HeuristicsTestView.actions.submit') }}</span>
          </div>
        </v-tooltip>
      </v-speed-dial>
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { debounce } from 'lodash'
import AutoSaveStatusBanner from '@/shared/components/AutoSaveStatusBanner.vue'
import Snackbar from '@/shared/components/Snackbar'
import HeuristicInstructionsStep from '@/ux/Heuristic/components/HeuristicInstructionsStep.vue'
import HeuristicAnswerStep from '@/ux/Heuristic/components/steps/HeuristicAnswerStep.vue'
import HeuristicCardsStep from '@/ux/Heuristic/components/steps/HeuristicCardsStep.vue'
import HeuristicFinishStep from '@/ux/Heuristic/components/steps/HeuristicFinishStep.vue'
import HeuristicQuestionAnswer from '@/ux/Heuristic/models/HeuristicQuestionAnswer'
import { resolveHeuristicAnswerMode } from '@/ux/Heuristic/utils/heuristicAnswerMode'
import Heuristic from '@/ux/Heuristic/models/Heuristic'
import { showSuccess, showError } from '@/shared/utils/toast'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import HeuristicAnswer from '../models/HeuristicAnswer'
import EvaluatorInfoDisplay from '@/ux/Heuristic/components/EvaluatorInfoDisplay.vue'
import {
  resolveStudyAccess,
  STUDY_ROLE,
} from '@/shared/utils/studyAccessPolicy'

const props = defineProps({
  id: { type: String, default: '' },
  token: { type: String, default: null },
})

const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const logined = ref(null)
const fromlink = ref(null)
const start = ref(true)
const evaluatorInfoAcknowledged = ref(false)
const index = ref(1)
const noExistUser = ref(true)
const heurisIndex = ref(0)
const fab = ref(false)
const dialog = ref(false)
const calculatedProgress = ref(0)
const review = ref(true)
const rightView = ref(null)
const displayHeuristics = ref([])
const showHeuristicCards = ref(true)

const TEST_PAGES = {
  welcome: 'welcome_page',
  instructions: 'instructions_page',
  answers: 'heuristic_answer_page',
}
const currentPage = ref(TEST_PAGES.welcome)
const answerInitialized = ref(false)

const truncateDescription = (description) => {
  if (!description || description.length <= 150) return description
  return `${description.slice(0, 147)}...`
}

// Auto-save status variables
const autoSaveInProgress = ref(false)
const lastSaveTime = ref(null)

// Save status variables
const saveStatusMessage = ref('All changes saved')
const saveStatusType = ref('default') // default, saving, success, error

const test = computed(() => store.getters.test)
const showEvaluatorInfo = computed(() => {
  if (
    !test.value ||
    !user.value ||
    !start.value ||
    testAlreadyStarted.value ||
    evaluatorInfoAcknowledged.value ||
    evaluatorInfoSections.value.length === 0
  ) {
    return false
  }

  const access = resolveStudyAccess(test.value, user.value)
  return access.role === STUDY_ROLE.EVALUATOR || access.isPublicParticipant
})

const evaluatorInfoSections = computed(() => {
  const sections = test.value?.evaluatorInfo?.sections
  return Array.isArray(sections) ? sections : []
})

const trackTimeEnabled = computed(() => test.value?.trackTime !== false)

const testDisabledReason = computed(() => {
  if (currentUserTestAnswer.value?.submitted) return 'already-completed'

  if (heuristics.value.length === 0) return 'no-heuristics'

  const hasCustomOptions =
    Array.isArray(test.value?.testOptions) && test.value.testOptions.length > 0

  const frequencyEnabled = test.value?.useFrequency !== false
  const severityEnabled = test.value?.useSeverity !== false

  if (!hasCustomOptions && !frequencyEnabled && !severityEnabled) {
    return 'no-answer-options'
  }

  if (!user.value) return 'login-required'

  return null
})

const isStartTestDisabled = computed(() => Boolean(testDisabledReason.value))

const heuristicDescription = (heuristic) => {
  if (!heuristic) return t('HeuristicsTestView.cards.noDescription')

  const directDescription =
    heuristic.description || heuristic.text || heuristic.subtitle
  if (directDescription) return directDescription

  const firstQuestionDescription = heuristic.questions
    ?.flatMap((question) => question.descriptions || [])
    ?.find((description) => description?.text)

  return (
    firstQuestionDescription?.text ||
    t('HeuristicsTestView.cards.noDescription')
  )
}

const byteSize = (value) => {
  if (!value) return 0
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return new TextEncoder().encode(text).length
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  const decimals = size >= 10 || unitIndex === 0 ? 0 : 1
  return `${size.toFixed(decimals)} ${units[unitIndex]}`
}

const heuristicStorage = (heuristicAnswer) => {
  if (!heuristicAnswer?.heuristicQuestions) return formatBytes(0)

  const totalBytes = heuristicAnswer.heuristicQuestions.reduce(
    (total, question) => {
      const commentsBytes = Array.isArray(question.comments)
        ? question.comments.reduce(
            (sum, comment) => sum + byteSize(comment?.text),
            0,
          )
        : byteSize(question.heuristicComment)

      const imagesBytes = Array.isArray(question.images)
        ? question.images.reduce(
            (sum, image) => sum + Number(image?.size || image?.bytes || 0),
            0,
          )
        : 0

      const legacyImageBytes =
        !Array.isArray(question.images) || question.images.length === 0
          ? byteSize(question.answerImageUrl)
          : 0

      return total + commentsBytes + imagesBytes + legacyImageBytes
    },
    0,
  )

  return formatBytes(totalBytes)
}

//Fisher-Yates algorithm to shuffle heuristics order
const shuffleHeuristics = (array) => {
  // Verify that the input is a valid array
  if (!array || !Array.isArray(array)) return array

  // Use a copy of the array to avoid mutating the original
  const shuffledArray = [...array]

  // Algorithem Fisher-Yates
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // Shuffle elements
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  return shuffledArray
}

const heuristics = computed(() => {
  if (displayHeuristics.value.length) {
    return displayHeuristics.value
  }

  // Prefer heuristics from test.testStructure if available
  if (test.value?.testStructure && Array.isArray(test.value.testStructure)) {
    return test.value.testStructure
  }
  // Fallback to heuristics getter
  if (store.getters.heuristics && store.getters.heuristics.length) {
    return store.getters.heuristics
  }
  // Fallback to empty array
  return []
})

const user = computed(() => {
  if (store.getters.user) setExistUser()
  return store.getters.user
})
const currentUserTestAnswer = ref(new HeuristicAnswer())

const normalizeCurrentUserTestAnswer = (answer) => {
  if (answer instanceof HeuristicAnswer) return answer

  return new HeuristicAnswer({
    ...(answer || {}),
    userDocId: answer?.userDocId ?? user.value?.id ?? null,
  })
}

const testAlreadyStarted = computed(
  () =>
    Boolean(currentUserTestAnswer.value?.testStarted) ||
    calculatedProgress.value > 0 ||
    hasSavedAnswers(),
)

const showSaveBtn = computed(() => {
  if (currentUserTestAnswer.value.submitted) return false
  return true
})

const isUserTestAdmin = computed(() => {
  return test.value.testAdmin.userDocId === user.value?.id
})

const hasTestDashboardAccess = computed(() => {
  if (!user.value) return false
  if (isUserTestAdmin.value) return true
  const coop = test.value?.cooperators?.find(
    (c) => c.userDocId === user.value.id,
  )
  return coop?.accessLevel === ACCESS_LEVEL.EVALUATOR
})

const heuristicStepperValue = computed(() => {
  if (currentUserTestAnswer.value?.submitted || review.value === false) return 3
  return 2
})

// Status management functions
const updateSaveStatus = (message, type = 'default') => {
  saveStatusMessage.value = message
  saveStatusType.value = type
}

const formatLastSaveTime = () => {
  if (!lastSaveTime.value) return ''

  const now = new Date()
  const saveTime = new Date(lastSaveTime.value)
  const diffMs = now - saveTime
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins === 1) return '1 min ago'
  if (diffMins < 60) return `${diffMins} mins ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`

  return saveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const parseTimeSpent = (value) => {
  const [minutes = '0', seconds = '0'] = String(value || '0:0').split(':')
  return (
    (Math.max(0, Number(minutes) || 0) * 60 +
      Math.max(0, Number(seconds) || 0)) *
    1000
  )
}

const formatTimeSpent = (ms) => {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const verifyTimerState = (heuristic) => {
  if (!heuristic) return

  heuristic.timeSpentMs =
    Number.isFinite(Number(heuristic.timeSpentMs)) &&
    Number(heuristic.timeSpentMs) >= 0
      ? Number(heuristic.timeSpentMs)
      : parseTimeSpent(heuristic.timeSpent)
  heuristic.timeSpent = formatTimeSpent(heuristic.timeSpentMs)
  heuristic.timerStartedAt =
    Number.isFinite(Number(heuristic.timerStartedAt)) &&
    Number(heuristic.timerStartedAt) > 0
      ? Number(heuristic.timerStartedAt)
      : null
}

const startTimer = (heuristicIndex) => {
  if (start.value || currentUserTestAnswer.value?.submitted) return

  const heuristic =
    currentUserTestAnswer.value?.heuristicQuestions?.[heuristicIndex]
  if (!heuristic) return
  verifyTimerState(heuristic)

  if (!heuristic.timerStartedAt) {
    heuristic.timerStartedAt = Date.now()
  }
}

const pauseTimer = (heuristicIndex) => {
  const heuristic =
    currentUserTestAnswer.value?.heuristicQuestions?.[heuristicIndex]
  if (!heuristic?.timerStartedAt) return
  verifyTimerState(heuristic)

  const elapsed = Date.now() - heuristic.timerStartedAt
  if (elapsed > 0) {
    heuristic.timeSpentMs += elapsed
    heuristic.timeSpent = formatTimeSpent(heuristic.timeSpentMs)
  }
  heuristic.timerStartedAt = null
}

const snapshotRunningTimer = (heuristicIndex) => {
  const heuristic =
    currentUserTestAnswer.value?.heuristicQuestions?.[heuristicIndex]
  if (!heuristic?.timerStartedAt) return
  verifyTimerState(heuristic)

  const now = Date.now()
  const elapsed = now - heuristic.timerStartedAt
  if (elapsed > 0) {
    heuristic.timeSpentMs += elapsed
    heuristic.timeSpent = formatTimeSpent(heuristic.timeSpentMs)
    heuristic.timerStartedAt = now
  }
}

const openInstructionsPage = () => {
  const startScreen = document.querySelector('.start-screen')
  if (startScreen) {
    startScreen.classList.add('leaving')
  }

  setTimeout(() => {
    currentPage.value = TEST_PAGES.instructions
  }, 1000)
}

const startTest = async () => {
  if (heuristics.value.length === 0) {
    store.commit('setError', {
      errorCode: 400,
      message: t('HeuristicsTestView.messages.noHeuristics'),
    })
    return
  }
  if (!answerCompletionMode.value) {
    showError(t('HeuristicsTestView.errors.noAnswerOptions'))
    return
  }

  if (!answerInitialized.value) return

  const invitedCooperator = test.value?.cooperators?.find(
    (cooperator) => cooperator.userDocId === user.value?.id,
  )
  if (!isUserTestAdmin.value && invitedCooperator?.accepted !== true) {
    await store.dispatch('acceptStudyCollaboration', {
      test: test.value,
      cooperator: user.value,
    })
  }

  start.value = false
  currentPage.value = TEST_PAGES.answers
  showHeuristicCards.value = true
  index.value = 1

  // Mark test as started
  if (currentUserTestAnswer.value) {
    currentUserTestAnswer.value.testStarted = true
    currentUserTestAnswer.value.lastViewedHeuristicIndex = heurisIndex.value
    if (trackTimeEnabled.value) startTimer(heurisIndex.value)
    // Auto-save when test starts
    debouncedAutoSave()
  }
}

const updateComment = (_comment, _heurisIndex, _answerIndex) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }
  const question =
    currentUserTestAnswer.value.heuristicQuestions[_heurisIndex]
      .heuristicQuestions[_answerIndex]
  question.heuristicComment = _comment || ''
  // Show saving status immediately
  updateSaveStatus('Saving changes...', 'saving')
  // Trigger auto-save on comment change
  debouncedAutoSave()
}

const updateImageUrl = (_imageUrl, _heurisIndex, _answerIndex) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }
  const question =
    currentUserTestAnswer.value.heuristicQuestions[_heurisIndex]
      .heuristicQuestions[_answerIndex]
  question.answerImageUrl = _imageUrl || ''
  // Show saving status immediately
  updateSaveStatus('Saving changes...', 'saving')
  // Trigger auto-save on image upload
  debouncedAutoSave()
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  const array = new Uint32Array(2)
  crypto.getRandomValues(array)
  return `${Date.now()}-${array[0].toString(36)}${array[1].toString(36)}`
}

const addComment = (_comment, _heurisIndex, _answerIndex) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }
  const question =
    currentUserTestAnswer.value.heuristicQuestions[_heurisIndex]
      .heuristicQuestions[_answerIndex]

  // Initialize comments array if it doesn't exist
  if (!Array.isArray(question.comments)) {
    question.comments = []
  }

  // Add the new comment
  const newComment = {
    id: generateId(),
    text: (_comment || '').trim(),
    createdAt: Date.now(),
  }

  // Use spread operator to trigger Vue reactivity
  question.comments = [...question.comments, newComment]

  // Update legacy field for backward compatibility (first comment)
  if (question.comments.length === 1) {
    question.heuristicComment = newComment.text
  }

  // Force reactivity update by reassigning the heuristicQuestions array
  currentUserTestAnswer.value.heuristicQuestions = [
    ...currentUserTestAnswer.value.heuristicQuestions,
  ]

  // Show saving status immediately
  updateSaveStatus('Saving changes...', 'saving')
  // Trigger auto-save
  debouncedAutoSave()
}

const updateCommentById = (_commentId, _text, _heurisIndex, _answerIndex) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }
  const question =
    currentUserTestAnswer.value.heuristicQuestions[_heurisIndex]
      .heuristicQuestions[_answerIndex]

  if (!Array.isArray(question.comments)) {
    return
  }

  const commentIndex = question.comments.findIndex((c) => c.id === _commentId)
  if (commentIndex !== -1) {
    // Create a new comment object to trigger reactivity
    const updatedComment = {
      ...question.comments[commentIndex],
      text: (_text || '').trim(),
      updatedAt: Date.now(),
    }

    // Replace the array with a new one containing the updated comment
    question.comments = [
      ...question.comments.slice(0, commentIndex),
      updatedComment,
      ...question.comments.slice(commentIndex + 1),
    ]

    // Update legacy field if this is the first comment
    if (commentIndex === 0) {
      question.heuristicComment = updatedComment.text
    }
  }

  // Force reactivity update
  currentUserTestAnswer.value.heuristicQuestions = [
    ...currentUserTestAnswer.value.heuristicQuestions,
  ]

  // Show saving status immediately
  updateSaveStatus('Saving changes...', 'saving')
  // Trigger auto-save
  debouncedAutoSave()
}

/**
 * Remove a comment by ID
 */
const removeComment = (_commentId, _heurisIndex, _answerIndex) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }
  const question =
    currentUserTestAnswer.value.heuristicQuestions[_heurisIndex]
      .heuristicQuestions[_answerIndex]

  if (!Array.isArray(question.comments)) {
    return
  }

  const index = question.comments.findIndex((c) => c.id === _commentId)
  if (index !== -1) {
    // Use filter to create a new array without the removed comment (triggers reactivity)
    question.comments = question.comments.filter((c) => c.id !== _commentId)

    // Update legacy field
    question.heuristicComment = question.comments[0]?.text || ''
  }

  // Force reactivity update
  currentUserTestAnswer.value.heuristicQuestions = [
    ...currentUserTestAnswer.value.heuristicQuestions,
  ]

  // Show saving status immediately
  updateSaveStatus('Saving changes...', 'saving')
  // Trigger auto-save
  debouncedAutoSave()
}

/**
 * Add a new image to a question
 */
const addImage = (_imageUrl, _heurisIndex, _answerIndex, _metadata = {}) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }
  const question =
    currentUserTestAnswer.value.heuristicQuestions[_heurisIndex]
      .heuristicQuestions[_answerIndex]

  // Initialize images array if it doesn't exist
  if (!Array.isArray(question.images)) {
    question.images = []
  }

  // Add the new image
  const newImage = {
    id: generateId(),
    url: _imageUrl,
    createdAt: Date.now(),
    ..._metadata,
  }

  // Use spread operator to trigger Vue reactivity
  question.images = [...question.images, newImage]

  // Update legacy field for backward compatibility (first image)
  if (question.images.length === 1) {
    question.answerImageUrl = newImage.url
  }

  // Force reactivity update
  currentUserTestAnswer.value.heuristicQuestions = [
    ...currentUserTestAnswer.value.heuristicQuestions,
  ]

  // Show saving status immediately
  updateSaveStatus('Saving changes...', 'saving')
  // Trigger auto-save
  debouncedAutoSave()
}

/**
 * Remove an image by ID
 */
const removeImage = (_imageId, _heurisIndex, _answerIndex) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }
  const question =
    currentUserTestAnswer.value.heuristicQuestions[_heurisIndex]
      .heuristicQuestions[_answerIndex]

  if (!Array.isArray(question.images)) {
    return
  }

  const index = question.images.findIndex((i) => i.id === _imageId)
  if (index !== -1) {
    question.images = question.images.filter((i) => i.id !== _imageId)

    question.answerImageUrl = question.images[0]?.url || ''
  }

  currentUserTestAnswer.value.heuristicQuestions = [
    ...currentUserTestAnswer.value.heuristicQuestions,
  ]

  updateSaveStatus('Saving changes...', 'saving')
  debouncedAutoSave()
}

const updateHeuristicAnswer = (_heurisIndex, _answerIndex, _value) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }

  currentUserTestAnswer.value.heuristicQuestions[
    _heurisIndex
  ].heuristicQuestions[_answerIndex].heuristicAnswer = _value
  handleAnswerChange(_heurisIndex, _answerIndex)
}

const handleAnswerChange = (_heurisIndex, _answerIndex) => {
  if (
    !currentUserTestAnswer.value.heuristicQuestions?.[_heurisIndex]
      ?.heuristicQuestions?.[_answerIndex]
  ) {
    return
  }

  const question =
    currentUserTestAnswer.value.heuristicQuestions[_heurisIndex]
      .heuristicQuestions[_answerIndex]

  // Check if the answer is actually empty/not selected
  if (
    question.heuristicAnswer &&
    typeof question.heuristicAnswer === 'object'
  ) {
    // Check if it's an empty answer object
    const isEmptyAnswer = isAnswerEmpty(question.heuristicAnswer)

    if (isEmptyAnswer && !question.heuristicAnswer.mode) {
      question.heuristicAnswer = null
    }
  }

  calculateProgress()
  // Show saving status immediately
  updateSaveStatus('Saving changes...', 'saving')
  // Trigger auto-save on answer change
  debouncedAutoSave()
}

// Helper function to check if an answer is empty
const isAnswerEmpty = (answer) => {
  if (!answer || answer === '' || answer === null) {
    return true
  }

  if (typeof answer === 'object') {
    if (Object.keys(answer).length === 0) {
      return true
    }

    if (answer.mode) {
      if (answer.mode === 'frequency') {
        return answer.frequency === null || answer.frequency === undefined
      }
      if (answer.mode === 'severity') {
        return answer.severity === null || answer.severity === undefined
      }
      if (answer.mode === 'frequencySeverity') {
        return (
          answer.frequency === null ||
          answer.frequency === undefined ||
          answer.severity === null ||
          answer.severity === undefined
        )
      }
      if (answer.mode === 'customOptions') {
        return !answer.custom || !answer.custom.text
      }
    }

    // Check for your specific answer structure
    if (answer.text !== undefined && answer.value !== undefined) {
      const isTextEmpty =
        answer.text === '' || answer.text === null || answer.text === undefined

      let isValueEmpty = false
      if (answer.value === null || answer.value === undefined) {
        isValueEmpty = true
      } else if (typeof answer.value === 'object') {
        if (Object.keys(answer.value).length === 0) {
          isValueEmpty = true
        } else if (
          answer.value.value !== undefined &&
          answer.value.text !== undefined
        ) {
          // Nested structure like {value: {}, text: ""}
          const isNestedTextEmpty =
            answer.value.text === '' ||
            answer.value.text === null ||
            answer.value.text === undefined
          const isNestedValueEmpty =
            !answer.value.value ||
            (typeof answer.value.value === 'object' &&
              Object.keys(answer.value.value).length === 0)
          isValueEmpty = isNestedTextEmpty && isNestedValueEmpty
        }
      } else if (answer.value === '') {
        isValueEmpty = true
      }

      return isTextEmpty && isValueEmpty
    }
  }

  return false
}

const answerCompletionMode = computed(() =>
  resolveHeuristicAnswerMode(test.value),
)

const isFilledAnswerValue = (value) =>
  value !== undefined && value !== null && value !== ''

const isAnswerCompleteForMode = (answer, mode = answerCompletionMode.value) => {
  if (!mode) return isAnswerValid(answer)
  if (!answer || typeof answer !== 'object') return false

  if (mode === 'frequency') {
    return isFilledAnswerValue(answer.frequency ?? answer.value)
  }

  if (mode === 'severity') {
    return isFilledAnswerValue(answer.severity ?? answer.value)
  }

  if (mode === 'frequencySeverity') {
    const value =
      answer.value && typeof answer.value === 'object' ? answer.value : {}
    return (
      isFilledAnswerValue(answer.frequency ?? value.frequency) &&
      isFilledAnswerValue(answer.severity ?? value.severity)
    )
  }

  if (mode === 'customOptions') {
    return Boolean(
      answer.custom?.text ||
      isFilledAnswerValue(answer.custom?.value) ||
      answer.text ||
      isFilledAnswerValue(answer.value),
    )
  }

  return isAnswerValid(answer)
}

const calculateProgress = () => {
  if (!heuristics.value || !currentUserTestAnswer.value.heuristicQuestions) {
    calculatedProgress.value = 0
    return
  }
  const total = currentUserTestAnswer.value.total || 0
  let answered = 0

  currentUserTestAnswer.value.heuristicQuestions.forEach((heuQ) => {
    if (heuQ?.heuristicQuestions) {
      heuQ.heuristicQuestions.forEach((question) => {
        // Check for valid answer content, not just object existence
        const hasValidAnswer = isAnswerCompleteForMode(question.heuristicAnswer)

        if (hasValidAnswer) {
          answered++
        }
      })
    }
  })

  const percent = total > 0 ? ((100 * answered) / total).toFixed(1) : 0
  calculatedProgress.value = parseFloat(percent)

  if (isNaN(calculatedProgress.value)) {
    calculatedProgress.value = 0
  }
}

// Helper function: Check if an answer is actually valid
const isAnswerValid = (answer) => {
  // Use the isAnswerEmpty function to check
  const isEmpty = isAnswerEmpty(answer)
  // Valid if NOT empty
  return !isEmpty
}

// Function called from the template
const perHeuristicProgress = (item) => {
  if (
    !item ||
    !item.heuristicQuestions ||
    !Array.isArray(item.heuristicQuestions)
  ) {
    return 0
  }
  const total = item.heuristicTotal || 0

  const answered = item.heuristicQuestions.filter((q) =>
    isAnswerCompleteForMode(q.heuristicAnswer),
  ).length

  return total > 0 ? ((answered * 100) / total).toFixed(1) : 0
}

const autoSaveAnswer = async () => {
  if (
    !answerInitialized.value ||
    !currentUserTestAnswer.value ||
    currentUserTestAnswer.value.submitted
  ) {
    return
  }

  if (trackTimeEnabled.value) snapshotRunningTimer(heurisIndex.value)

  // Update progress and metadata
  currentUserTestAnswer.value.progress = calculatedProgress.value
  currentUserTestAnswer.value.lastViewedHeuristicIndex = heurisIndex.value
  currentUserTestAnswer.value.lastSaveTime = new Date().toISOString()

  if (
    !currentUserTestAnswer.value.testStarted &&
    calculatedProgress.value > 0
  ) {
    currentUserTestAnswer.value.testStarted = true
  }

  autoSaveInProgress.value = true

  const orderedData = getOrderedHeuristicsForSave()

  try {
    await store.dispatch('saveTestAnswer', {
      data: orderedData,
      answersDocId: test.value.answersDocId,
      testType: test.value.testType,
      // No success message for auto-save
    })
    lastSaveTime.value = new Date()
    updateSaveStatus('All changes saved', 'success')
  } catch {
    updateSaveStatus('Failed to save', 'error')
    // Revert to default after 5 seconds
    setTimeout(() => {
      if (saveStatusType.value === 'error') {
        updateSaveStatus('All changes saved', 'default')
      }
    }, 5000)
  } finally {
    autoSaveInProgress.value = false
  }
}

const getOrderedHeuristicsForSave = () => {
  const answer = normalizeCurrentUserTestAnswer(currentUserTestAnswer.value)

  if (!answer.heuristicQuestions || !test.value?.testStructure) {
    return answer
  }

  const baseOrder = test.value.testStructure.map((h) => h.id)

  const orderedHeuristicQuestions = [...answer.heuristicQuestions].sort(
    (a, b) =>
      baseOrder.indexOf(a.heuristicId) - baseOrder.indexOf(b.heuristicId),
  )

  return new HeuristicAnswer({
    ...answer,
    heuristicQuestions: orderedHeuristicQuestions,
  })
}

// Manual save function (with toast)
const manualSaveAnswer = async () => {
  if (!currentUserTestAnswer.value) {
    showError('HeuristicsTestView.errors.noAnswerData')
    return
  }

  if (trackTimeEnabled.value) snapshotRunningTimer(heurisIndex.value)

  // Update progress and metadata
  currentUserTestAnswer.value.progress = calculatedProgress.value
  currentUserTestAnswer.value.lastViewedHeuristicIndex = heurisIndex.value
  currentUserTestAnswer.value.lastSaveTime = new Date().toISOString()

  if (
    !currentUserTestAnswer.value.testStarted &&
    calculatedProgress.value > 0
  ) {
    currentUserTestAnswer.value.testStarted = true
  }

  autoSaveInProgress.value = true
  updateSaveStatus('Saving...', 'saving')

  const orderedData = getOrderedHeuristicsForSave()

  try {
    await store.dispatch('saveTestAnswer', {
      data: orderedData,
      answersDocId: test.value.answersDocId,
      testType: test.value.testType,
      successMessage: t('alerts.savedChanges'),
      errorMessage: t('alerts.errorSavingProgress'),
    })
    lastSaveTime.value = new Date()
    updateSaveStatus('Progress saved', 'success')

    // Show manual save success toast
    showSuccess('HeuristicsTestView.messages.answerSaved')
  } catch {
    updateSaveStatus('Save failed', 'error')
    showError('HeuristicsTestView.errors.failedToSaveAnswer')
  } finally {
    autoSaveInProgress.value = false
  }
}

// Debounced version for auto-save
const debouncedAutoSave = debounce(autoSaveAnswer, 1500)

const submitAnswer = async () => {
  if (!currentUserTestAnswer.value) {
    showError('HeuristicsTestView.errors.noAnswerData')
    return
  }
  if (trackTimeEnabled.value) pauseTimer(heurisIndex.value)
  currentUserTestAnswer.value.submitted = true
  autoSaveInProgress.value = true
  updateSaveStatus('Submitting...', 'saving')
  const orderedData = getOrderedHeuristicsForSave()
  try {
    currentUserTestAnswer.value.progress = calculatedProgress.value
    currentUserTestAnswer.value.lastSaveTime = new Date().toISOString()
    await store.dispatch('saveTestAnswer', {
      data: orderedData,
      answersDocId: test.value.answersDocId,
      testType: test.value.testType,
    })
    showSuccess('alerts.genericSuccess')
    setTimeout(() => {
      if (hasTestDashboardAccess.value) {
        router.push(`/heuristic/dashboard/${test.value.id}`)
      } else {
        router.push('/admin')
      }
    }, 1500)
  } catch {
    currentUserTestAnswer.value.submitted = false
    showError('HeuristicsTestView.errors.failedToSubmitAnswer')
    updateSaveStatus('Submission failed', 'error')
  } finally {
    autoSaveInProgress.value = false
  }
}

const setExistUser = () => {
  noExistUser.value = false
}

const signOut = () => {
  store.dispatch('logout').then(() => {
    noExistUser.value = true
  })
}

const populateWithHeuristicQuestions = () => {
  if (!heuristics.value || !test.value) {
    return false
  }

  // Check if we need to initialize or just update the structure
  const needsInitialization =
    !currentUserTestAnswer.value.heuristicQuestions?.length

  if (needsInitialization) {
    // Initialize with empty questions if no data exists
    let totalQuestions = 0
    const heuristicQuestions = heuristics.value.map((heu) => {
      const questions = (
        heu.questions?.length ? heu.questions : [{ id: heu.id }]
      ).map(
        (h) =>
          new HeuristicQuestionAnswer({
            heuristicId: h.id,
            heuristicAnswer: null,
            heuristicComment: '',
            answerImageUrl: '',
            comments: [],
            images: [],
          }),
      )
      totalQuestions += questions.length
      return new Heuristic({
        heuristicTitle: heu.title || t('HeuristicsTestView.unknownHeuristic'),
        heuristicId: heu.id,
        heuristicQuestions: questions,
        heuristicTotal: questions.length,
        timeSpent: '00:00',
        timerStartedAt: null,
      })
    })
    currentUserTestAnswer.value.heuristicQuestions = heuristicQuestions
    currentUserTestAnswer.value.total = totalQuestions
  } else {
    // We have existing data, but need to ensure structure matches current heuristics
    let totalQuestions = 0

    // Create a DEEP COPY of existing questions to prevent reference issues
    const existingHeuristics = JSON.parse(
      JSON.stringify(currentUserTestAnswer.value.heuristicQuestions || []),
    )

    currentUserTestAnswer.value.heuristicQuestions = heuristics.value.map(
      (heu, index) => {
        // Get existing heuristic questions for this index, if any
        const existingHeuristic = existingHeuristics[index] || {}
        const existingQuestions = existingHeuristic.heuristicQuestions || []

        // Create or update questions
        const questions = (
          heu.questions?.length ? heu.questions : [{ id: heu.id }]
        ).map((h, qIndex) => {
          // Try to find existing answer for this question by heuristicId
          let existingQuestion = existingQuestions.find(
            (q) => q.heuristicId === h.id,
          )

          // If not found by id, try by index
          if (!existingQuestion && existingQuestions[qIndex]) {
            existingQuestion = existingQuestions[qIndex]
          }

          if (existingQuestion) {
            // Check if the saved answer is actually empty
            let restoredAnswer = existingQuestion.heuristicAnswer
            if (restoredAnswer && isAnswerEmpty(restoredAnswer)) {
              restoredAnswer = null
            } else if (restoredAnswer) {
              // Create a copy to avoid reference issues
              restoredAnswer = JSON.parse(JSON.stringify(restoredAnswer))
            }

            // Return existing question with saved data
            return new HeuristicQuestionAnswer({
              heuristicId: h.id,
              heuristicAnswer: restoredAnswer,
              heuristicComment: existingQuestion.heuristicComment || '',
              answerImageUrl: existingQuestion.answerImageUrl || '',
              comments: Array.isArray(existingQuestion.comments)
                ? existingQuestion.comments
                : [],
              images: Array.isArray(existingQuestion.images)
                ? existingQuestion.images
                : [],
            })
          } else {
            // Create new question
            return new HeuristicQuestionAnswer({
              heuristicId: h.id,
              heuristicAnswer: null,
              heuristicComment: '',
              answerImageUrl: '',
              comments: [],
              images: [],
            })
          }
        })

        totalQuestions += questions.length

        return new Heuristic({
          heuristicTitle: heu.title || 'Unknown Heuristic',
          heuristicId: heu.id,
          heuristicQuestions: questions,
          heuristicTotal: questions.length,
          timeSpent:
            existingHeuristic.timeSpent ||
            formatTimeSpent(existingHeuristic.timeSpentMs || 0),
          timerStartedAt: existingHeuristic.timerStartedAt || null,
        })
      },
    )

    currentUserTestAnswer.value.total = totalQuestions
  }
  currentUserTestAnswer.value.heuristicQuestions.forEach((heuristic) => {
    verifyTimerState(heuristic)
    heuristic.timerStartedAt = null
  })
  return true
}

const hasSavedAnswers = () => {
  if (!currentUserTestAnswer.value?.heuristicQuestions?.length) {
    return false
  }

  // Check if any question has an answer, comment, or image
  for (const heuristic of currentUserTestAnswer.value.heuristicQuestions) {
    if (heuristic?.heuristicQuestions) {
      for (const question of heuristic.heuristicQuestions) {
        const hasAnswer = isAnswerValid(question.heuristicAnswer)
        // Check legacy comment format
        const hasLegacyComment =
          question.heuristicComment && question.heuristicComment.trim() !== ''
        // Check new comments array format
        const hasNewComments =
          Array.isArray(question.comments) && question.comments.length > 0
        // Check legacy image format
        const hasLegacyImage =
          question.answerImageUrl && question.answerImageUrl.trim() !== ''
        // Check new images array format
        const hasNewImages =
          Array.isArray(question.images) && question.images.length > 0

        if (
          hasAnswer ||
          hasLegacyComment ||
          hasNewComments ||
          hasLegacyImage ||
          hasNewImages
        ) {
          return true
        }
      }
    }
  }
  return false
}

const initializeHeuristicsOrder = () => {
  const baseHeuristics = Array.isArray(test.value?.testStructure)
    ? [...test.value.testStructure]
    : []

  if (!baseHeuristics.length) {
    displayHeuristics.value = []
    return
  }

  const userAnswer = currentUserTestAnswer.value || {}
  const hasProgress =
    Number(userAnswer.progress || 0) > 0 ||
    !!userAnswer.testStarted ||
    hasSavedAnswers()

  if (hasProgress && Array.isArray(userAnswer.heuristicQuestions)) {
    const shuffled = shuffleHeuristics(baseHeuristics)
    const ordered = shuffled
      .map((shuffledHeu) =>
        userAnswer.heuristicQuestions.find(
          (savedHeu) => savedHeu.heuristicId === shuffledHeu.id,
        ),
      )
      .filter(Boolean)
      .map((savedHeu) =>
        baseHeuristics.find((h) => h.id === savedHeu.heuristicId),
      )
      .filter(Boolean)

    displayHeuristics.value = shuffled
    // Reorder answers to match shuffled heuristics
    currentUserTestAnswer.value.heuristicQuestions = ordered.map((heu) =>
      userAnswer.heuristicQuestions.find((h) => h.heuristicId === heu.id),
    )
  } else {
    displayHeuristics.value = shuffleHeuristics(baseHeuristics)
  }
}

const restoreProgress = () => {
  if (currentUserTestAnswer.value?.submitted) {
    start.value = true
    currentPage.value = TEST_PAGES.welcome
    review.value = true
    calculateProgress()
    updateSaveStatus('All changes saved', 'default')
    return
  }

  if (hasSavedAnswers() || currentUserTestAnswer.value?.testStarted) {
    // User has saved progress or test was started
    start.value = false
    currentPage.value = TEST_PAGES.answers
    review.value = true
    showHeuristicCards.value = true
    index.value = 1

    // Calculate progress from saved data
    calculateProgress()

    // Restore the last viewed heuristic if available
    if (currentUserTestAnswer.value.lastViewedHeuristicIndex !== undefined) {
      heurisIndex.value = currentUserTestAnswer.value.lastViewedHeuristicIndex
    }

    // Set test as started
    currentUserTestAnswer.value.testStarted = true
    if (trackTimeEnabled.value) startTimer(heurisIndex.value)

    // Update status indicator
    updateSaveStatus('Progress restored', 'success')
    setTimeout(() => {
      updateSaveStatus('All changes saved', 'default')
    }, 3000)
  } else {
    // No saved progress, start fresh
    start.value = true
    currentPage.value = TEST_PAGES.welcome
    review.value = true
    showHeuristicCards.value = true
    index.value = 1
    calculatedProgress.value = 0
  }
}

const setTest = async () => {
  logined.value = true
  answerInitialized.value = false
  await store.dispatch('getCurrentTestAnswerDoc')
  currentUserTestAnswer.value = normalizeCurrentUserTestAnswer(
    store.getters.currentUserTestAnswer,
  )
  initializeHeuristicsOrder()
  answerInitialized.value = populateWithHeuristicQuestions()
  restoreProgress()
}

const setReviewTrue = () => {
  review.value = true
  // Update last viewed heuristic when user navigates
  currentUserTestAnswer.value.lastViewedHeuristicIndex = heurisIndex.value
  updateSaveStatus('Saving changes...', 'saving')
  debouncedAutoSave()
}

const handleHeurisClick = (i) => {
  heurisIndex.value = i
  showHeuristicCards.value = false
  setReviewTrue()
}

// Setup auto-save on page unload
const setupAutoSaveOnUnload = () => {
  window.addEventListener('beforeunload', (_event) => {
    if (
      calculatedProgress.value > 0 &&
      !currentUserTestAnswer.value?.submitted
    ) {
      // Update status before unload
      updateSaveStatus('Saving before exit...', 'saving')
      // Save synchronously before page unload
      autoSaveAnswer().catch(() => {})
    }
  })
}

watch(heurisIndex, (newIndex, oldIndex) => {
  if (rightView.value) {
    rightView.value.scrollTop = 0
  }
  // Auto-save when navigating between heuristics
  if (!start.value) {
    if (trackTimeEnabled.value) {
      if (oldIndex !== undefined && oldIndex !== newIndex) {
        pauseTimer(oldIndex)
      }
      startTimer(newIndex)
    }

    currentUserTestAnswer.value.lastViewedHeuristicIndex = heurisIndex.value
    updateSaveStatus('Saving changes...', 'saving')
    debouncedAutoSave()
  }
})

watch(
  user,
  async () => {
    if (user.value) {
      noExistUser.value = false
      if (logined.value) setTest()
    }
  },
  { deep: true },
)

onBeforeMount(async () => {
  answerInitialized.value = false
  if (route.params.token) {
    fromlink.value = true
  }

  // Load test data first
  await store.dispatch('getStudy', { id: props.id })

  // Then load user's answers
  await store.dispatch('getCurrentTestAnswerDoc')

  // Load answer data into local reactive state
  currentUserTestAnswer.value = normalizeCurrentUserTestAnswer(
    store.getters.currentUserTestAnswer,
  )

  // Randomize only for fresh runs; keep deterministic order for resumed runs.
  initializeHeuristicsOrder()

  answerInitialized.value = populateWithHeuristicQuestions()
  // calculate progress before checking restore
  calculateProgress()

  // Check and restore progress
  restoreProgress()

  // Setup auto-save on unload
  setupAutoSaveOnUnload()
})

onUnmounted(() => {
  // Save progress when component is destroyed
  if (calculatedProgress.value > 0 && !currentUserTestAnswer.value?.submitted) {
    if (trackTimeEnabled.value) pauseTimer(heurisIndex.value)
    autoSaveAnswer().catch(() => {})
  }
})
</script>

<style scoped>
.start-container {
  background: linear-gradient(134.16deg, #3f51b5 -13.6%, #283593 117.67%);
  height: 100vh;
}
.start-row {
  max-width: 1200px;
  margin: 0 auto;
}
.start-screen {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-size: 200% 200%;
  animation: subtleGradient 20s ease-in-out infinite;
  background-image: linear-gradient(
    160deg,
    #00213f 0%,
    #1a2f4f 35%,
    #303f9f 100%
  );
  transition: opacity 8s cubic-bezier(0.4, 0, 0.2, 1);
}

.start-screen.leaving,
.start-screen.leaving > *,
.start-screen.leaving::before {
  opacity: 0;
  transition-duration: 1.2s;
}

@keyframes subtleGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.start-screen::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140%;
  margin-right: -450px;
  margin-top: 100px;
  background-image: url(../../../assets/logo_small_red.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
}

.instructions-screen {
  min-height: 100vh;
  background: #fff;
}

.main-test-interface {
  min-height: 100vh;
  background: #fff;
}

.right-view {
  min-height: 100vh;
}

.sticky-stepper {
  position: sticky;
  top: 0;
  z-index: 10;
  background: transparent;
}

.main-stepper {
  background: #00213f !important;
  color: #fff !important;
  --v-stepper-header-title-color: #fff !important;
  --v-stepper-item-title-color: #fff !important;
  --v-stepper-item-color: #fff !important;
}

.btn-fix:focus::before {
  opacity: 0 !important;
}

:deep(.v-stepper-item__avatar) {
  font-size: 1rem !important;
  font-weight: 900 !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.v-stepper-item--complete .v-stepper-item__avatar .v-icon) {
  font-size: 1.25rem !important;
  width: 2.2rem !important;
  height: 2.2rem !important;
}

:deep(.v-stepper-item__title) {
  font-size: 1.1rem !important;
  font-weight: 300 !important;
  line-height: 0.8 !important;
}

.v-stepper-item {
  padding: 1rem;
}
</style>
