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

    <!-- Persistent Save Status Indicator (Right Side) -->
    <div
      v-if="!start && !currentUserTestAnswer?.submitted"
      class="save-status-indicator"
      :class="{ 'status-mini': mini }"
    >
      <v-card
        elevation="2"
        class="status-card"
        :color="saveStatusColor"
        density="compact"
      >
        <v-card-text class="pa-2">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">
                {{ saveStatusIcon }}
              </v-icon>
              <span class="text-caption font-weight-medium">
                {{ saveStatusMessage }}
              </span>
            </div>
            <v-progress-circular
              v-if="autoSaveInProgress"
              indeterminate
              size="16"
              width="2"
              color="white"
              class="ml-2"
            />
            <v-icon
              v-else-if="lastSaveTime && saveStatusType === 'success'"
              size="small"
              class="ml-2"
            >
              mdi-clock-outline
            </v-icon>
          </div>
          <!-- Last save time -->
          <div
            v-if="lastSaveTime && saveStatusType === 'success'"
            class="text-caption text-white text-right mt-1"
          >
            {{ formatLastSaveTime() }}
          </div>
        </v-card-text>
      </v-card>
    </div>
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

    <v-container
      v-if="test && start && !testAlreadyStarted"
      class="start-container"
      fluid
    >
      <v-row class="start-row fill-height" align="center" justify="center">
        <v-col
          cols="12"
          md="6"
          sm="12"
          class="text-center text-md-left mb-4 mb-md-0"
        >
          <h1 class="text-h2 font-weight-light text-white mb-4">
            {{ test.testTitle }}
          </h1>
          <p class="text-body-1 text-white mb-6">
            {{ test.testDescription }}
          </p>
          <v-alert
            v-if="heuristics.length === 0"
            type="warning"
            class="mb-6 text-left"
            variant="tonal"
            density="compact"
            icon="mdi-alert"
          >
            {{ $t('HeuristicsTestView.messages.noHeuristicsConfigured') }}
          </v-alert>
          <v-btn
            color="white"
            variant="outlined"
            size="large"
            rounded
            :disabled="!user || heuristics.length === 0"
            @click="startTest()"
          >
            {{ $t('HeuristicsTestView.actions.startTest') }}
          </v-btn>
        </v-col>
        <v-col cols="12" md="5" class="d-flex justify-center">
          <v-img
            :src="require('../../../assets/BackgroundTestView.png')"
            cover
            max-width="80%"
            height="auto"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-card v-else height="100vh">
      <v-layout class="fill-height">
        <v-navigation-drawer
          v-model="drawer"
          :rail="mini"
          permanent
          color="testPrimary"
        >
          <div v-if="!mini" class="pa-4">
            <v-list-item>
              <v-row dense align="center">
                <v-col cols="8" class="pa-0 pl-3">
                  <text-clamp
                    class="text-h5 text-white text-truncate font-weight-bold"
                    :text="test.testTitle"
                    :max-lines="2"
                  />
                </v-col>
                <v-col cols="4" class="d-flex justify-end">
                  <v-progress-circular
                    rotate="-90"
                    :model-value="isValidProgress ? calculatedProgress : 0"
                    color="forth"
                    :size="50"
                    :width="5"
                  >
                    <div class="text-caption text-white">
                      {{
                        $t('common.percentValue', {
                          value: isValidProgress ? calculatedProgress : 0,
                        })
                      }}
                    </div>
                  </v-progress-circular>
                </v-col>
              </v-row>
            </v-list-item>
          </div>

          <v-list class="nav-list" density="compact">
            <div v-for="(item, n) in items" :key="n">
              <v-list
                v-if="item.id == 1"
                :value="index == 1 ? true : false"
                @click="index = item.id"
              >
                <div v-if="mini">
                  <v-tooltip
                    v-for="(heuris, i) in item.value"
                    :key="i"
                    location="right"
                  >
                    <template #activator="{ props }">
                      <v-list-item
                        v-bind="props"
                        link
                        :active="heurisIndex == i"
                        @click="heurisIndex = i"
                      >
                        <template #prepend>
                          <v-progress-circular
                            v-if="
                              perHeuristicProgress(
                                currentUserTestAnswer.heuristicQuestions[i],
                              ) != 100
                            "
                            rotate="-90"
                            :model-value="
                              perHeuristicProgress(
                                currentUserTestAnswer.heuristicQuestions[i],
                              )
                            "
                            :size="24"
                            :width="3"
                            :color="heurisIndex == i ? 'white' : 'secondary'"
                          />
                          <v-icon
                            v-else
                            :color="heurisIndex == i ? 'white' : 'secondary'"
                          >
                            {{ heuris.icon }}
                          </v-icon>
                        </template>
                      </v-list-item>
                    </template>
                    <div>
                      <span>{{
                        heuris.title ||
                        $t('HeuristicsTestView.unknownHeuristic')
                      }}</span>
                    </div>
                  </v-tooltip>
                </div>

                <div v-else>
                  <v-list-item
                    v-for="(heuris, i) in item.value"
                    :key="i"
                    link
                    :active="heurisIndex == i"
                    @click="handleHeurisClick(i)"
                  >
                    <template #prepend>
                      <v-progress-circular
                        v-if="
                          perHeuristicProgress(
                            currentUserTestAnswer.heuristicQuestions[i],
                          ) != 100
                        "
                        rotate="-90"
                        :model-value="
                          perHeuristicProgress(
                            currentUserTestAnswer.heuristicQuestions[i],
                          )
                        "
                        :size="24"
                        :width="3"
                        :color="heurisIndex == i ? 'white' : 'forth'"
                      />
                      <v-icon
                        v-else
                        :color="heurisIndex == i ? 'white' : 'forth'"
                      >
                        {{ heuris.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title
                      :class="heurisIndex == i ? 'text-white' : 'text-forth'"
                      class="pl-5"
                    >
                      {{
                        heuris.title ||
                        $t('HeuristicsTestView.unknownHeuristic')
                      }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="review == true && calculatedProgress == 100"
                    link
                    @click="review = false"
                  >
                    <template #prepend>
                      <v-icon color="forth"> mdi-send-circle-outline </v-icon>
                    </template>
                    <v-list-item-title class="text-forth">
                      {{ $t('buttons.submit') }}
                    </v-list-item-title>
                  </v-list-item>
                </div>
              </v-list>

              <v-list-item v-else-if="item.id == 2" @click="index = item.id">
                <template #prepend>
                  <v-icon :color="index == item.id ? 'white' : 'forth'">
                    {{ item.icon }}
                  </v-icon>
                </template>
                <v-list-item-title
                  :class="index == item.id ? 'text-white' : 'text-forth'"
                >
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </div>
          </v-list>

          <template #append>
            <v-row class="d-flex pb-10 pt-5 px-5" justify="end">
              <v-btn
                size="small"
                icon
                class="bg-secondary"
                @click.stop="mini = !mini"
              >
                <v-icon v-if="mini" color="white"> mdi-chevron-right </v-icon>
                <v-icon v-else color="white"> mdi-chevron-left </v-icon>
              </v-btn>
            </v-row>
          </template>
        </v-navigation-drawer>

        <v-main
          ref="rightView"
          :class="{ 'main-content-shifted': !mini }"
          class="background-main px-20 py-4 transition-all"
        >
          <ShowInfo
            v-if="index == 1 && review == true"
            :title="
              heuristics[heurisIndex]?.title ||
              $t('HeuristicsTestView.unknownHeuristic')
            "
          >
            <template #content>
              <v-card-title class="text-h6 font-weight-regular text-primary">
                {{
                  heuristics[heurisIndex]?.title ||
                  $t('HeuristicsTestView.unknownHeuristic')
                }}
              </v-card-title>
              <v-divider class="mb-5" />
              <v-row
                v-for="(question, i) in heuristics[heurisIndex]?.questions ||
                []"
                :key="i"
                justify="center"
              >
                <v-col cols="10">
                  <v-card class="elevation-2 px-10 py-5 mb-2">
                    <v-row class="mb-2">
                      <v-col cols="11">
                        <p class="text-body-1 font-weight-medium">
                          {{ i + 1 }})
                          {{
                            question.title ||
                            $t('HeuristicsTestView.unknownQuestion')
                          }}
                        </p>
                      </v-col>
                      <v-col cols="1">
                        <HelpBtn :question="question" />
                      </v-col>
                    </v-row>
                    <AddCommentBtn
                      :heuris-index="heurisIndex"
                      :answer-heu="
                        currentUserTestAnswer.heuristicQuestions[heurisIndex]
                          ?.heuristicQuestions[i] || {}
                      "
                      :disable="currentUserTestAnswer?.submitted"
                      @update-comment="
                        (comment) => updateComment(comment, heurisIndex, i)
                      "
                      @update-image="
                        (imageUrl) => updateImageUrl(imageUrl, heurisIndex, i)
                      "
                      @add-comment="
                        (comment) => addComment(comment, heurisIndex, i)
                      "
                      @update-comment-by-id="
                        (commentId, text) =>
                          updateCommentById(commentId, text, heurisIndex, i)
                      "
                      @remove-comment="
                        (commentId) => removeComment(commentId, heurisIndex, i)
                      "
                      @add-image="
                        (imageUrl) => addImage(imageUrl, heurisIndex, i)
                      "
                      @remove-image="
                        (imageId) => removeImage(imageId, heurisIndex, i)
                      "
                    >
                      <template #answer>
                        <v-select
                          v-if="
                            currentUserTestAnswer?.heuristicQuestions?.[
                              heurisIndex
                            ]?.heuristicQuestions?.[i]
                          "
                          v-model="
                            currentUserTestAnswer.heuristicQuestions[
                              heurisIndex
                            ].heuristicQuestions[i].heuristicAnswer
                          "
                          class="optionSelect"
                          return-object
                          :items="test.testOptions"
                          :item-title="
                            (item) =>
                              item?.text ||
                              $t('HeuristicsTestView.selectAnOption')
                          "
                          item-value="value"
                          variant="outlined"
                          density="compact"
                          :disabled="currentUserTestAnswer?.submitted"
                          placeholder="Select an answer..."
                          @update:model-value="
                            handleAnswerChange(heurisIndex, i)
                          "
                        />
                        <v-alert v-else type="error" class="mt-4">
                          {{
                            $t('HeuristicsTestView.errors.questionNotLoaded')
                          }}
                        </v-alert>
                      </template>
                    </AddCommentBtn>
                  </v-card>
                </v-col>
              </v-row>
            </template>
          </ShowInfo>

          <div v-if="calculatedProgress == 100 && review == false">
            <ShowInfo :title="$t('finishTest.title')">
              <template #content>
                <v-row justify="center" class="pa-4">
                  <v-col cols="11" class="mt-3">
                    <v-card class="pa-10">
                      <v-row
                        justify="center"
                        class="text-h5 font-weight-bold text-testPrimary mb-2"
                      >
                        {{ $t('finishTest.finalMessage') }}!
                      </v-row>
                      <v-row
                        justify="center"
                        class="text-subtitle-1 text-ternary"
                      >
                        {{ $t('finishTest.congratulations') }}
                      </v-row>
                      <v-row justify="center" align="center" class="mt-6">
                        <v-col cols="12" md="6" class="text-center">
                          <img
                            draggable="false"
                            :src="
                              require('../../../../public/finalMessage.svg')
                            "
                            alt="Final test svg"
                            class="img-fluid"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                          class="text-center text-md-left"
                        >
                          <div class="text-subtitle-1 text-ternary mb-4">
                            {{ $t('finishTest.submitMessage') }}
                          </div>
                          <v-btn
                            color="testPrimary"
                            variant="flat"
                            :disabled="currentUserTestAnswer?.submitted"
                            @click="dialog = true"
                          >
                            <v-icon start> mdi-send </v-icon>
                            {{ $t('buttons.submit') }}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </template>
            </ShowInfo>
          </div>
        </v-main>
      </v-layout>
    </v-card>

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
              :disabled="calculateProgress < 100"
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
import ShowInfo from '@/shared/components/ShowInfo.vue'
import AddCommentBtn from '@/ux/Heuristic/components/AddCommentBtn.vue'
import HelpBtn from '@/ux/Heuristic/components/QuestionHelpBtn.vue'
import TextClamp from 'vue3-text-clamp'
import Snackbar from '@/shared/components/Snackbar'
import HeuristicQuestionAnswer from '@/ux/Heuristic/models/HeuristicQuestionAnswer'
import Heuristic from '@/ux/Heuristic/models/Heuristic'
import { showSuccess, showError } from '@/shared/utils/toast'
import HeuristicAnswer from '../models/HeuristicAnswer'

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
const drawer = ref(true)
const start = ref(true)
const mini = ref(false)
const index = ref(null)
const noExistUser = ref(true)
const heurisIndex = ref(0)
const preTestIndex = ref(null)
const items = ref([])
const fab = ref(false)
const dialog = ref(false)
const calculatedProgress = ref(0)
const review = ref(true)
const rightView = ref(null)
const displayHeuristics = ref([])

// Auto-save status variables
const autoSaveInProgress = ref(false)
const lastSaveTime = ref(null)

// Save status variables
const saveStatusMessage = ref('All changes saved')
const saveStatusType = ref('default') // default, saving, success, error
const saveStatusIcon = ref('mdi-check-circle')
const saveStatusColor = ref('primary')

const test = computed(() => store.getters.test)

const testAlreadyStarted = computed(() => {
  return (
    currentUserTestAnswer.value?.testStarted ||
    calculatedProgress.value > 0 ||
    hasSavedAnswers()
  )
})

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
const currentUserTestAnswer = ref({})
const showSaveBtn = computed(() => {
  if (currentUserTestAnswer.value.submitted) return false
  return true
})

const isUserTestAdmin = computed(() => {
  return test.value.testAdmin.userDocId === user.value?.id
})

const isValidProgress = computed(() => {
  return calculatedProgress.value >= 0 && calculatedProgress.value <= 100
})

// Status management functions
const updateSaveStatus = (message, type = 'default') => {
  saveStatusMessage.value = message
  saveStatusType.value = type

  switch (type) {
    case 'saving':
      saveStatusIcon.value = 'mdi-content-save'
      saveStatusColor.value = 'warning'
      break
    case 'success':
      saveStatusIcon.value = 'mdi-check-circle'
      saveStatusColor.value = 'success'
      break
    case 'error':
      saveStatusIcon.value = 'mdi-alert-circle'
      saveStatusColor.value = 'error'
      break
    default:
      saveStatusIcon.value = 'mdi-check-circle'
      saveStatusColor.value = 'primary'
  }
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

const startTest = async () => {
  if (heuristics.value.length === 0) {
    store.commit('setError', {
      errorCode: 400,
      message: t('HeuristicsTestView.messages.noHeuristics'),
    })
    return
  }

  if (!isUserTestAdmin.value) {
    await store.dispatch('acceptStudyCollaboration', {
      test: test.value,
      cooperator: user.value,
    })
  }

  start.value = false

  // Mark test as started
  if (currentUserTestAnswer.value) {
    currentUserTestAnswer.value.testStarted = true
    currentUserTestAnswer.value.lastViewedHeuristicIndex = heurisIndex.value
    startTimer(heurisIndex.value)
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
const addImage = (_imageUrl, _heurisIndex, _answerIndex) => {
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

    if (isEmptyAnswer) {
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

const mappingSteps = () => {
  if (validate(heuristics.value) && heuristics.value.length !== 0) {
    items.value = [
      {
        title: t('HeuristicsTestView.headers.heuristics'),
        icon: 'mdi-checkbox-marked-circle-outline',
        value: heuristics.value.map((option) => ({
          title: option.title || t('HeuristicsTestView.unknownHeuristic'),
          icon: 'mdi-checkbox-marked-circle-outline',
          done: false,
          total: option.total || 0,
          id: option.id,
        })),
        id: 1,
      },
    ]
  }
}

const validate = (object) => {
  return object !== null && object !== undefined && object !== ''
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
        const hasValidAnswer = isAnswerValid(question.heuristicAnswer)

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
    isAnswerValid(q.heuristicAnswer),
  ).length

  return total > 0 ? ((answered * 100) / total).toFixed(1) : 0
}

const autoSaveAnswer = async () => {
  if (!currentUserTestAnswer.value || currentUserTestAnswer.value.submitted) {
    return
  }

  snapshotRunningTimer(heurisIndex.value)

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
  if (
    !currentUserTestAnswer.value?.heuristicQuestions ||
    !test.value?.testStructure
  ) {
    return currentUserTestAnswer.value
  }

  const baseOrder = test.value.testStructure.map((h) => h.id)

  const orderedHeuristicQuestions = [
    ...currentUserTestAnswer.value.heuristicQuestions,
  ].sort(
    (a, b) =>
      baseOrder.indexOf(a.heuristicId) - baseOrder.indexOf(b.heuristicId),
  )

  return new HeuristicAnswer({
    ...currentUserTestAnswer.value,
    heuristicQuestions: orderedHeuristicQuestions,
  })
}

// Manual save function (with toast)
const manualSaveAnswer = async () => {
  if (!currentUserTestAnswer.value) {
    showError('HeuristicsTestView.errors.noAnswerData')
    return
  }

  snapshotRunningTimer(heurisIndex.value)

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
  pauseTimer(heurisIndex.value)
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
      router.push('/admin')
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
    return
  }

  // Check if we need to initialize or just update the structure
  const needsInitialization =
    !currentUserTestAnswer.value.heuristicQuestions?.length

  if (needsInitialization) {
    // Initialize with empty questions if no data exists
    let totalQuestions = 0
    const heuristicQuestions = heuristics.value.map((heu) => {
      const questions =
        heu.questions?.map(
          (h) =>
            new HeuristicQuestionAnswer({
              heuristicId: h.id,
              heuristicAnswer: null,
              heuristicComment: '',
              answerImageUrl: '',
              comments: [],
              images: [],
            }),
        ) || []
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
        const questions =
          heu.questions?.map((h, qIndex) => {
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
          }) || []

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
  if (hasSavedAnswers() || currentUserTestAnswer.value?.testStarted) {
    // User has saved progress or test was started
    start.value = false
    review.value = true

    // Calculate progress from saved data
    calculateProgress()

    // Restore the last viewed heuristic if available
    if (currentUserTestAnswer.value.lastViewedHeuristicIndex !== undefined) {
      heurisIndex.value = currentUserTestAnswer.value.lastViewedHeuristicIndex
    }

    // Set test as started
    currentUserTestAnswer.value.testStarted = true
    startTimer(heurisIndex.value)

    // Update status indicator
    updateSaveStatus('Progress restored', 'success')
    setTimeout(() => {
      updateSaveStatus('All changes saved', 'default')
    }, 3000)
  } else {
    // No saved progress, start fresh
    start.value = true
    review.value = true
    calculatedProgress.value = 0
  }
}

const setTest = async () => {
  logined.value = true
  await store.dispatch('getCurrentTestAnswerDoc')
  currentUserTestAnswer.value = store.getters.currentUserTestAnswer || {}
  initializeHeuristicsOrder()
  populateWithHeuristicQuestions()
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

watch(
  displayHeuristics,
  async () => {
    mappingSteps()
  },
  { deep: true },
)

watch(
  test,
  async () => {
    mappingSteps()
  },
  { deep: true },
)

watch(
  items,
  () => {
    if (items.value.length) {
      index.value = items.value[0].id
      if (items.value.find((obj) => obj.id == 0)) {
        preTestIndex.value = items.value[0].value[0].id
      }
    }
  },
  { deep: true },
)

watch(heurisIndex, (newIndex, oldIndex) => {
  if (rightView.value) {
    rightView.value.scrollTop = 0
  }
  // Auto-save when navigating between heuristics
  if (!start.value) {
    if (oldIndex !== undefined && oldIndex !== newIndex) {
      pauseTimer(oldIndex)
    }

    currentUserTestAnswer.value.lastViewedHeuristicIndex = heurisIndex.value
    startTimer(newIndex)
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
  if (route.params.token) {
    fromlink.value = true
  }

  // Load test data first
  await store.dispatch('getStudy', { id: props.id })

  // Then load user's answers
  await store.dispatch('getCurrentTestAnswerDoc')

  // Load answer data into local reactive state
  currentUserTestAnswer.value = store.getters.currentUserTestAnswer || {}

  // Randomize only for fresh runs; keep deterministic order for resumed runs.
  initializeHeuristicsOrder()

  populateWithHeuristicQuestions()
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
    pauseTimer(heurisIndex.value)
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
.background-main {
  background-color: #f5f7fa;
  height: 100%;
  overflow-y: auto;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.main-content-shifted {
  padding-left: 256px !important; /* Vuetify's default drawer width */
}
.btn-fix:focus::before {
  opacity: 0 !important;
}
.nav-list::-webkit-scrollbar {
  width: 7px;
}
.nav-list::-webkit-scrollbar-track {
  background: none;
}
.nav-list::-webkit-scrollbar-thumb {
  background: #7986cb;
  border-radius: 4px;
}
.nav-list::-webkit-scrollbar-thumb:hover {
  background: #5c6bc0;
}

/* Persistent Save Status Indicator */
.save-status-indicator {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 999;
  width: 220px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.save-status-indicator.status-mini {
  right: 80px;
}

.status-card {
  background: linear-gradient(
    135deg,
    var(--v-success-base) 0%,
    var(--v-success-darken-1) 100%
  );
  color: white !important;
}

.status-card[color='warning'] {
  background: linear-gradient(
    135deg,
    var(--v-warning-base) 0%,
    var(--v-warning-darken-1) 100%
  );
}

.status-card[color='error'] {
  background: linear-gradient(
    135deg,
    var(--v-error-base) 0%,
    var(--v-error-darken-1) 100%
  );
}

.status-card[color='primary'] {
  background: linear-gradient(
    135deg,
    var(--v-primary-base) 0%,
    var(--v-primary-darken-1) 100%
  );
}

.status-card .text-caption {
  color: rgba(255, 255, 255, 0.9) !important;
}

.status-card .v-icon {
  color: white !important;
}

/* Animation for status changes */
.status-card {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0.8;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
