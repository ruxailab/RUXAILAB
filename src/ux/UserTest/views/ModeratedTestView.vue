<template>
  <div>
    <StepAnnouncementOverlay
      v-if="showStepAnnouncement"
      ref="stepAnnouncementOverlay"
      :kicker="nextStepAnnouncementKicker"
      :title="nextStepAnnouncementTitle"
    />

    <v-container fluid class="pa-0">
      <!-- Start Screen -->
      <v-row
        v-if="test && start"
        class="start-screen background-img pa-0 ma-0"
        align="center"
      >
        <v-col md="8" class="ma-5 pa-5">
          <img
            src="@/assets/logo_full_white.png"
            alt="RUXAILAB"
            class="mb-10"
            style="max-width: 300px"
          />
          <h1 class="text-h2 font-weight-bold text-white">
            {{ test.testTitle }}
          </h1>
          <p class="text-body-1 mb-5 text-white text-justify">
            {{ test.testDescription }}
          </p>
          <v-btn
            color="white"
            variant="outlined"
            rounded
            size="x-large"
            :disabled="isStartTestDisabled"
            @click="startTest"
          >
            {{ $t('UserTestView.actions.startTest') }}
          </v-btn>

          <!-- Messages when test is disabled -->
          <v-alert
            v-if="testDisabledReason === 'test-already-completed'"
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
                $t('UserTestView.alerts.testAlreadyCompleted')
              }}</strong
              ><br />
              {{ $t('UserTestView.alerts.testAlreadyCompletedMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-expired'"
            type="warning"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-clock-alert </v-icon>
            </template>
            <span class="text-white">
              <strong>{{ $t('UserTestView.alerts.testExpired') }}</strong
              ><br />
              {{ $t('UserTestView.alerts.testExpiredMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-not-active'"
            type="warning"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-pause-circle </v-icon>
            </template>
            <span class="text-white">
              <strong>{{ $t('UserTestView.alerts.testNotActive') }}</strong
              ><br />
              {{ $t('UserTestView.alerts.testNotActiveMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-no-tasks-configured'"
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
              <strong>{{ $t('UserTestView.alerts.testConfigError') }}</strong
              ><br />
              {{ $t('UserTestView.alerts.testConfigErrorMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-session-too-far'"
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
              <v-icon color="white"> mdi-calendar-clock </v-icon>
            </template>
            <span class="text-white">
              <strong>{{ $t('UserTestView.alerts.sessionTooFar') }}</strong
              ><br />
              {{ $t('UserTestView.alerts.sessionTooFarMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-no-data'"
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
              <strong>{{ $t('UserTestView.errors.noTestData') }}</strong
              ><br />
              {{ $t('UserTestView.errors.noTestDataMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-if="moderatorInactive"
            type="warning"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-wifi-off </v-icon>
            </template>
            <span class="text-white">
              <strong>Moderator Disconnected</strong><br />
              The moderator seems to be offline. Please wait or contact support.
            </span>
          </v-alert>
        </v-col>
      </v-row>

      <!--Answer Test Screen-->
      <v-row v-else class="main-test-interface pa-0 ma-0">
        <v-col ref="rightView" class="right-view pa-6">
          <v-alert
            v-if="moderatorInactive"
            density="compact"
            type="warning"
            variant="tonal"
            class="mb-4 rounded-xl"
            closable
          >
            <template #prepend>
              <v-icon size="small">mdi-wifi-off</v-icon>
            </template>
            <div class="text-caption">
              <strong>Moderator Disconnected:</strong>
              The moderator seems to be offline. Please wait.
            </div>
          </v-alert>

          <!--Sticky Stepper to follow Progress-->
          <v-row
            v-if="
              !isModerator && (globalIndex >= 1 || displayVideoCallComponent)
            "
            class="stepper-row sticky-stepper"
          >
            <v-col cols="12">
              <v-stepper
                :model-value="stepperValue"
                class="main-stepper rounded-xl elevation-3"
                :class="{
                  'stepper-animate':
                    globalIndex === 4 &&
                    test?.testStructure?.userTasks?.length > 1,
                }"
                style="visibility: visible"
              >
                <v-stepper-header>
                  <v-stepper-item
                    :value="1"
                    :title="$t('UserTestView.stepper.consent')"
                    :complete="stepperValue > 1"
                    :color="
                      stepperValue == 1
                        ? 'warning'
                        : stepperValue < 1
                          ? 'primary'
                          : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    :value="2"
                    :title="$t('UserTestView.stepper.preTest')"
                    :complete="stepperValue > 2"
                    :color="
                      stepperValue == 2
                        ? 'warning'
                        : stepperValue < 1
                          ? 'primary'
                          : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    :value="3"
                    :title="$t('UserTestView.stepper.tasks')"
                    :complete="stepperValue > 3"
                    :color="
                      stepperValue == 3
                        ? 'warning'
                        : stepperValue < 3
                          ? 'primary'
                          : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    :value="4"
                    :title="$t('UserTestView.stepper.postTest')"
                    :complete="stepperValue > 4"
                    :color="
                      stepperValue == 4
                        ? 'warning'
                        : stepperValue < 4
                          ? 'primary'
                          : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    :value="5"
                    :title="$t('UserTestView.stepper.completion')"
                    :complete="stepperValue > 5"
                    :color="
                      stepperValue == 5
                        ? 'warning'
                        : stepperValue < 5
                          ? 'primary'
                          : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <!-- Stepper secundario para tareas -->
          <v-row
            v-if="
              !isModerator &&
              globalIndex === 4 &&
              test?.testStructure?.userTasks?.length > 1
            "
            class="task-stepper-row"
            justify="center"
          >
            <v-col cols="12" md="8" lg="6" class="d-flex justify-center">
              <v-stepper
                :model-value="taskIndex + 1"
                class="task-stepper rounded-xl elevation-2"
                style="max-width: 100%"
              >
                <v-stepper-header>
                  <template
                    v-for="(task, index) in test.testStructure.userTasks"
                    :key="index"
                  >
                    <v-stepper-item
                      :value="index + 1"
                      :title="task.taskName"
                      :complete="
                        localTestAnswer.tasks[index]?.completed || false
                      "
                      :color="
                        taskIndex == index
                          ? 'warning'
                          : taskIndex < index
                            ? 'primary'
                            : 'success'
                      "
                      complete-icon="mdi-check"
                    />
                    <v-divider
                      v-if="index < test.testStructure.userTasks.length - 1"
                    />
                  </template>
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <!-- Observator Notes Drawer -->
          <v-navigation-drawer
            v-if="isObservator"
            v-model="notesDrawerOpen"
            location="right"
            persistent
            width="400"
            elevation="3"
            style="
              position: fixed;
              top: 0;
              right: 0;
              height: 100%;
              z-index: 1005;
            "
          >
            <ObservatorNotes
              v-if="localTestAnswer"
              v-model="localTestAnswer.sessionNotes"
              :current-task-index="taskIndex"
              :test="test"
              @save="saveAnswer"
            />
          </v-navigation-drawer>

          <!-- Video Call Component -->
          <div v-show="displayVideoCallComponent" v-if="test">
            <VideoCallFactory
              :room-id="roomId"
              :is-moderator="isModerator"
              :is-observator="isObservator"
              :user="user"
              :access-level="currentUserAccessLevel"
              :current-global-index="globalIndex"
              :current-task-index="taskIndex"
              :test="test"
              :local-test-answer="localTestAnswer"
              :session-staff="sessionStaffMembers"
              :session-participants="sessionParticipantsMembers"
              :notes-drawer-open="notesDrawerOpen"
              :notes-count="localTestAnswer.sessionNotes?.length || 0"
              :toggle-notes-drawer="toggleNotesDrawer"
              @set-remote-stream="remoteStream = $event"
              @proceed-to-next-step="proceedToNextStep"
              @step-selected="handleStepSelected"
              @call-ended="handleCallEnded"
              @moderator-status-change="handleModeratorStatusChange"
            />
          </div>

          <!-- Hide Form Elements while on Video Call Mode -->
          <div v-show="!displayVideoCallComponent">
            <!--Step 0: Welcome - Different for Moderator vs Participant -->
            <ModeratorWelcomeStep
              v-if="globalIndex === 0 && isModerator"
              :stepper-value="stepperValue"
              @start="handleWelcomeStart"
            />
            <WelcomeStep
              v-else-if="globalIndex === 0 && !isModerator"
              :stepper-value="stepperValue"
              :welcome-message="test?.testStructure?.welcomeMessage"
              @start="handleWelcomeStart"
            />

            <!--Step 1: Consent -->
            <ConsentStep
              v-if="globalIndex === 1 && taskIndex === 0"
              :test-title="test.testTitle"
              :pre-test-title="$t('UserTestView.titles.preTest')"
              :consent-text="test.testStructure.consent"
              :full-name-model="fullName"
              :consent-completed-model="localTestAnswer.consentCompleted"
              @update:full-name-model="(val) => (fullName = val)"
              @update:consent-completed-model="
                (val) => (localTestAnswer.consentCompleted = val)
              "
              @continue="completeStep(taskIndex, 'consent')"
              @decline-consent="handleConsentDecline"
            />

            <!--Step 2: Pre-test -->
            <PreTestStep
              v-if="globalIndex === 2 && taskIndex === 0"
              :test-title="test.testTitle"
              :pre-test-title="$t('UserTestView.titles.preTest')"
              :pre-test="test.testStructure.preTest"
              :pre-test-answer="localTestAnswer.preTestAnswer"
              :pre-test-completed="localTestAnswer.preTestCompleted"
              @done="completeStep(taskIndex, 'preTest')"
            />

            <!-- Step 3: Tasks -->
            <PreTasksStep
              v-if="globalIndex === 3 && taskIndex === 0"
              :num-tasks="test?.testStructure?.userTasks?.length || 0"
              @start-tasks="handleStartTasks"
            />

            <!-- Step 4: Task Step -->
            <TaskStep
              v-if="globalIndex === 4 && test.testType === STUDY_TYPES.USER"
              ref="taskStepComponent"
              v-model:post-answer="localTestAnswer.tasks[taskIndex].postAnswer"
              v-model:task-answer="localTestAnswer.tasks[taskIndex].taskAnswer"
              v-model:task-observations="
                localTestAnswer.tasks[taskIndex].taskObservations
              "
              :task="test.testStructure.userTasks[taskIndex]"
              :task-index="taskIndex"
              :test-id="testId"
              :sus-answers="localTestAnswer.tasks[taskIndex].susAnswers"
              :nasa-tlx-answers="
                localTestAnswer.tasks[taskIndex].nasaTlxAnswers
              "
              :submitted="localTestAnswer.submitted"
              :done-task-disabled="doneTaskDisabled"
              :remote-stream="remoteStream"
              :should-record-moderator="!isModerator"
              @update:sus-answers="
                (val) => {
                  localTestAnswer.tasks[taskIndex].susAnswers = Array.isArray(
                    val,
                  )
                    ? [...val]
                    : []
                }
              "
              @update:nasa-tlx-answers="
                (val) => {
                  localTestAnswer.tasks[taskIndex].nasaTlxAnswers = { ...val }
                }
              "
              @done="() => handleTaskFinish(true)"
              @could-not-finish="() => handleTaskFinish(false)"
              @show-loading="isLoading = true"
              @stop-show-loading="isLoading = false"
              @recording-started="isVisualizerVisible = $event"
              @tip-pressed="handleTipPressed"
              @timer-stopped="handleTimerStopped"
            />

            <PostTestStep
              v-if="globalIndex === 5"
              :test-title="test.testTitle"
              :post-test-title="$t('UserTestView.titles.postTest')"
              :post-test="test.testStructure.postTest"
              :post-test-answer="localTestAnswer.postTestAnswer"
              :post-test-completed="localTestAnswer.postTestCompleted"
              @done="
                async () => {
                  await completeStep(taskIndex, 'postTest')
                  taskIndex = 3
                }
              "
            />
            <FinishStep
              v-if="
                globalIndex === 6 &&
                localTestAnswer.postTestCompleted &&
                !localTestAnswer.submitted
              "
              :final-message="$t('finishTest.finalMessage')"
              :congratulations="$t('finishTest.congratulations')"
              :submit-message="$t('finishTest.submitMessage')"
              :submit-btn="$t('buttons.submit')"
              @submit="submitDialog = true"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Submit Dialog -->
    <SubmitDialog
      :model-value="submitDialog"
      :title="$t('HeuristicsTestView.messages.submitTest')"
      :message="$t('HeuristicsTestView.messages.submitOnce')"
      :cancel-label="$t('buttons.cancel')"
      :submit-label="$t('buttons.submit')"
      @cancel="submitDialog = false"
      @submit="handleSubmit"
    />

    <!-- Dialog for user to continue or change account -->
    <v-dialog :model-value="!loggedIn" width="500" persistent>
      <v-card v-if="user" class="rounded-xl pa-6">
        <v-row class="ma-0 pa-0" justify="center">
          <v-avatar color="primary-lighten-4" size="120">
            <v-icon size="80"> mdi-account-circle </v-icon>
          </v-avatar>
        </v-row>
        <v-card-title class="text-center text-h6 font-weight-bold mt-4">
          {{ $t('UserTestView.actions.welcomeBack') }}
        </v-card-title>
        <v-card-text class="text-center text-body-1">
          <p class="font-weight-medium">
            {{ user.email }}
          </p>
        </v-card-text>
        <v-card-actions class="d-flex flex-column pa-0">
          <v-btn
            color="primary"
            block
            variant="flat"
            class="my-2"
            @click="setTestAnswer()"
          >
            {{
              $t('UserTestView.actions.continueAs', { userEmail: user.email })
            }}
          </v-btn>
          <p class="text-caption mt-2">
            {{ $t('UserTestView.actions.notYou') }}
            <a
              href="#"
              class="text-primary font-weight-medium"
              @click.prevent="signOut"
              >{{ $t('UserTestView.actions.changeAccount') }}</a
            >
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {
  ref as dbRef,
  onValue,
  off,
  update,
  set,
  get,
  onDisconnect,
  serverTimestamp,
  remove,
} from 'firebase/database'
import { database } from '@/app/plugins/firebase/index'
import {
  ref,
  computed,
  watch,
  onMounted,
  reactive,
  watchEffect,
  nextTick,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { onBeforeUnmount } from 'vue'
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue'
import WelcomeStep from '@/ux/UserTest/components/steps/WelcomeStep.vue'
import ModeratorWelcomeStep from '@/ux/UserTest/components/steps/ModeratorWelcomeStep.vue'
import PreTestStep from '@/ux/UserTest/components/steps/PreTestStep.vue'
import PreTasksStep from '@/ux/UserTest/components/steps/PreTasksStep.vue'
import TaskStep from '@/ux/UserTest/components/steps/TaskStep.vue'
import PostTestStep from '@/ux/UserTest/components/steps/PostTestStep.vue'
import FinishStep from '@/ux/UserTest/components/steps/FinishStep.vue'
import SubmitDialog from '@/ux/UserTest/components/SubmitDialog.vue'
import StepAnnouncementOverlay from '@/ux/UserTest/components/StepAnnouncementOverlay.vue'
import VideoCallFactory from '@/shared/components/videoCall/VideoCallFactory.vue'
import ObservatorNotes from '@/ux/UserTest/components/ObservatorNotes.vue'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import {
  ACCESS_LEVEL,
  isObserverAccessLevel,
  normalizeAccessLevel,
} from '@/shared/utils/accessLevel'
import { isModeratedSessionViewer } from '@/shared/utils/studyAccessPolicy'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
import TaskAnswer from '@/ux/UserTest/models/TaskAnswer'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { showError, showInfo, showWarning } from '@/shared/utils/toast'
import { calculateProgress } from '../utils/testProgress'
import { animateStepAnnouncement } from '@/shared/utils/animations'
import { removeStaffDuplicates } from '@/ux/UserTest/utils/sessionPresence'

const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
// Data variables

onBeforeUnmount(() => {
  if (moderatorDisconnectTimeout.value)
    clearTimeout(moderatorDisconnectTimeout.value)
})

const testDisabledReason = ref(null)
const isStartTestDisabled = ref(true)
const loggedIn = ref(null)
const sessionCooperator = ref(null)
const testDate = ref(null)
const start = ref(true)
const globalIndex = ref(null)
const taskIndex = ref(0)
const localTestAnswer = reactive(new UserStudyEvaluatorAnswer())
const rightView = ref(null) // For scroll effect
const fullName = ref('') // For consent form component
const items = ref([])
const doneTaskDisabled = ref(false) // ?
const displayVideoCallComponent = ref(false)
const preTestIndex = ref(null)
const taskStepComponent = ref(null)
const allTasksCompleted = ref(false)
const submitDialog = ref(false)
const notesDrawerOpen = ref(false)

function toggleNotesDrawer() {
  notesDrawerOpen.value = !notesDrawerOpen.value
}
const moderatorInactive = ref(false)
const moderatorDisconnectTimeout = ref(null)
const showStepAnnouncement = ref(false)
const stepAnnouncementOverlay = ref(null)
const nextStepAnnouncementTitle = ref('')
const nextStepAnnouncementKicker = ref('')
const isProcessingRemoteStepAnnouncement = ref(false)
const lastAnnouncedRemoteStepKey = ref(null)
const lastWaitingParticipantsNotificationCount = ref(0)

const sessionId = computed(() => route.params.token || null)

// From video call to be used by recorders
const remoteStream = ref(null)

// Computed properties
const mediaUrls = computed(() => store.getters.mediaUrls)
const test = computed(() => store.getters.test)
const testId = computed(() => store.getters.test?.id || null)
const user = computed(() => {
  return store.getters.user
})
const isUserTestAdmin = computed(() => {
  return test.value?.testAdmin?.userDocId === user.value?.id
})

const normalizeSessionRole = (role) => {
  if (role === 'FACILITATOR' || role === ACCESS_LEVEL.ADMIN) return 'moderator'
  if (role === 'OBSERVER' || role === ACCESS_LEVEL.OBSERVATOR) {
    return 'observator'
  }
  return 'participant'
}

const normalizeMemberKey = (member) => {
  if (!member) return []

  const rawValues = [
    member.userDocId,
    member.id,
    member.email,
    member.name,
    member.displayName,
  ]

  const normalized = new Set()

  rawValues.forEach((value) => {
    if (value == null || !String(value).trim()) return

    const str = String(value).trim().toLowerCase()
    normalized.add(str)
    normalized.add(str.replace(/[^a-z0-9]/g, ''))

    const localPart = str.includes('@') ? str.split('@')[0] : str
    if (localPart) {
      normalized.add(localPart)
      normalized.add(localPart.replace(/[^a-z0-9]/g, ''))
    }
  })

  return [...normalized]
}

const normalizeSessionMember = (member, fallbackType = 'participant') => {
  if (!member) return null

  const memberId = member.userDocId || member.id || member.email
  if (!memberId) return null

  const isStaffMember = fallbackType === 'staff'
  const presenceStatus =
    member.presenceStatus ??
    member.status ??
    (isStaffMember ? 'disconnected' : null)

  return {
    id: memberId,
    userDocId: member.userDocId || member.id || member.email,
    email: member.email,
    name:
      member.name ||
      member.displayName ||
      member.email?.split('@')[0] ||
      fallbackType,
    role: normalizeSessionRole(member.role || member.accessLevel),
    connected: member.connected ?? (isStaffMember ? false : null),
    presenceStatus,
    presenceUpdatedAt: member.presenceUpdatedAt ?? null,
    isStaff: isStaffMember,
    accessLevel: member.accessLevel ?? member.role,
  }
}

const callState = ref({ staff: {}, participants: {} })

const sessionStaffMembers = computed(() => {
  const staffSource =
    Object.keys(callState.value.staff || {}).length > 0
      ? Object.values(callState.value.staff || {})
      : session.value?.staff || []

  return staffSource
    .map((member) => normalizeSessionMember(member, 'staff'))
    .filter(Boolean)
})

const sessionParticipantsMembers = computed(() => {
  const participantsSource =
    Object.keys(callState.value.participants || {}).length > 0
      ? Object.values(callState.value.participants || {})
      : session.value?.participants || []

  return participantsSource
    .map((member) => normalizeSessionMember(member, 'participant'))
    .filter(Boolean)
})

const currentUserAccessLevel = computed(() => {
  const cooperator = session.value?.staff?.find(
    (c) => c.userDocId === user.value?.id,
  )

  const participant = session.value?.participants?.find(
    (p) => p.userDocId === user.value?.id,
  )

  const rawValue =
    cooperator?.accessLevel ??
    cooperator?.role ??
    participant?.accessLevel ??
    participant?.role ??
    ACCESS_LEVEL.OBSERVATOR

  return normalizeAccessLevel(rawValue) ?? ACCESS_LEVEL.OBSERVATOR
})

const sessionFacilitator = computed(() => {
  return session.value?.staff?.find((staff) => staff.role === 'FACILITATOR')
})

const sessionObserver = computed(() => {
  const observator = session.value?.staff?.find(
    (staff) => staff.role === 'OBSERVER',
  )
  return observator || null
})

const isModerator = computed(() => {
  // If there is a FACILITATOR in the session, only they are the moderator.
  if (sessionFacilitator.value) {
    return sessionFacilitator.value.userDocId === user.value?.id
  }

  // Fallback: if there is no FACILITATOR, the testAdmin is the moderator.
  return isUserTestAdmin.value
})

const isObservator = computed(() => {
  if (isModerator.value) {
    return false
  }

  if (sessionObserver.value) {
    return sessionObserver.value.userDocId === user.value?.id
  }

  return isObserverAccessLevel(currentUserAccessLevel.value)
})

const session = computed(() => store.getters.session)
const isSessionViewer = computed(() => {
  if (isModerator.value) {
    return false
  }
  return isModeratedSessionViewer(test.value, user.value, session.value)
})
const hasTestDashboardAccess = computed(() => {
  if (!user.value) return false
  return (
    currentUserAccessLevel.value === ACCESS_LEVEL.ADMIN ||
    currentUserAccessLevel.value === ACCESS_LEVEL.EVALUATOR
  )
})

const timerComponent = computed(() => {
  // Get timer ref from TaskStep
  return taskStepComponent.value?.$refs?.timerComponent || null
})

const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)

const roomId = computed(() => {
  return test.value.id // Assuming we will use the test ID as the room ID
})

const stepperValue = computed(() => {
  if (globalIndex.value === 0) return 0 // Welcome step
  if (globalIndex.value === 1 && taskIndex.value === 0) return 1 // Consent
  if (globalIndex.value === 2 && taskIndex.value === 0) return 2 // Pre-test
  if (globalIndex.value === 3 && taskIndex.value === 0) return 3 // Pre-tasks (informational)
  if (globalIndex.value === 4 && taskIndex.value >= 0) return 3 // Tasks (still step 3)
  if (globalIndex.value === 5) return 4 // Post-test
  if (globalIndex.value === 6) return 5 // Completion
  return 1 // Default to first step
})

// Scroll to top of the page when step changes
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (rightView.value) {
    rightView.value.scrollTop = 0
  }
}

// Watchers
watch(user, async () => {
  if (user.value) {
    if (loggedIn.value) await setTestAnswer()
  }
})

watch(
  () => [
    globalIndex.value,
    taskIndex.value,
    displayVideoCallComponent.value,
    isUserTestAdmin.value,
  ],
  ([gi, ti, dvc, admin]) => {
    scrollToTop()
  },
)

watch(
  session,
  (newSession) => {
    if (!newSession) return

    testDate.value = newSession.scheduledAt

    sessionCooperator.value = newSession
  },
  { immediate: true },
)

watchEffect(() => {
  const index = taskIndex.value

  const taskList = test.value?.testStructure?.userTasks
  const task = Array.isArray(taskList) ? taskList[index] : undefined

  const answers = localTestAnswer?.tasks?.[index]?.susAnswers

  if (isModerator.value) {
    doneTaskDisabled.value = false
    return
  }

  if (task?.taskType === 'sus') {
    const validCount = answers?.filter((v) => typeof v === 'number').length ?? 0
    doneTaskDisabled.value = validCount < 10
  } else {
    doneTaskDisabled.value = false
  }
})

watch(
  () => test.value,
  async () => {
    await mappingSteps()
  },
  { deep: true },
)

watch(
  () => items.value,
  () => {
    if (items.value.length && globalIndex.value === null) {
      globalIndex.value = items.value[0].id
      if (items.value.find((obj) => obj.id === 0)) {
        preTestIndex.value = items.value[0].value[0].id
      }
    }
  },
  { deep: true },
)

// Methods
const proceedToNextStep = async () => {
  if (!isModerator.value) return

  // Increment globalIndex before updating Firebase
  globalIndex.value = globalIndex.value + 1

  const roomRef = dbRef(database, `rooms/${roomId.value}`)
  await update(roomRef, {
    globalIndex: globalIndex.value,
    taskIndex: taskIndex.value,
    showVideoCall: false,
  })
}

const handleStepSelected = async ({
  globalIndex: newGlobalIndex,
  taskIndex: newTaskIndex,
}) => {
  if (!isModerator.value) return

  globalIndex.value = newGlobalIndex
  taskIndex.value = newTaskIndex

  // Moderator stays in video call, but participant sees the selected step
  // Don't change displayVideoCallComponent for moderator

  const roomRef = dbRef(database, `rooms/${roomId.value}`)
  await update(roomRef, {
    globalIndex: newGlobalIndex,
    taskIndex: newTaskIndex,
    showVideoCall: false, // Set to false so participant sees the step content immediately
  })
}

const handleConsentDecline = async () => {
  // User declined consent, end the moderated test
  store.commit('SET_TOAST', {
    type: 'info',
    message: t('UserTestView.alerts.consentDecline'),
    timeout: 5000,
  })

  // Clean up room data
  const roomRef = dbRef(database, `rooms/${roomId.value}`)
  await set(roomRef, null)

  // Navigate back to admin
  setTimeout(() => {
    router.push('/admin')
  }, 2000)
}

const handleSubmit = async () => {
  submitDialog.value = false
  try {
    localTestAnswer.submitted = true
    await saveAnswer()
    displayVideoCallComponent.value = true
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.errors.failedToSubmitAnswer'),
    })
  }
}

const saveAnswer = async () => {
  try {
    attachMediaToTasks(localTestAnswer, mediaUrls.value)

    localTestAnswer.fullName = fullName.value
    if (user.value && user.value?.email) {
      localTestAnswer.userDocId = user.value.id
      localTestAnswer.invited = true
    }

    Object.assign(currentUserTestAnswer.value, localTestAnswer)

    await store.dispatch('saveTestAnswer', {
      data: currentUserTestAnswer.value,
      answersDocId: test.value.answersDocId,
      testType: test.value.testType,
    })
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.errors.failedToSaveAnswer'),
    })
  }
}

const attachMediaToTasks = (answer, mediaUrls) => {
  if (!answer?.tasks?.length) return

  for (const [taskIndex, medias] of Object.entries(mediaUrls)) {
    const task = answer.tasks[taskIndex]
    if (!task) continue

    for (const type in medias) {
      const field = MEDIA_FIELD_MAP?.[type] || type
      const url = medias[type]
      if (url != null) task[field] = url
    }
  }
}

const setTestAnswer = async () => {
  loggedIn.value = true
  await store.dispatch('getCurrentTestAnswerDoc')
}

const signOut = async () => {
  await store.dispatch('signOut')
  router.push('/signin')
}

const requestFullscreenIfAvailable = async () => {
  if (document.fullscreenElement) return

  const root = document.documentElement
  try {
    if (root.requestFullscreen) {
      await root.requestFullscreen()
      return
    }

    const legacy =
      root.webkitRequestFullscreen ||
      root.mozRequestFullScreen ||
      root.msRequestFullscreen

    if (legacy) {
      await legacy.call(root)
    }
  } catch {
    // Ignore if blocked by browser/user settings and continue test flow.
  }
}

const cleanupRoomStateForReuse = async (roomKey) => {
  if (!roomKey) return

  const callRef = dbRef(database, `calls/${roomKey}`)
  const roomRef = dbRef(database, `rooms/${roomKey}`)

  await Promise.allSettled([
    get(callRef).then((snapshot) => {
      if (snapshot.exists()) return remove(callRef)
      return null
    }),
    get(roomRef).then((snapshot) => {
      if (snapshot.exists()) return remove(roomRef)
      return null
    }),
  ])
}

const handleCallEnded = async () => {
  displayVideoCallComponent.value = false

  if (isModerator.value && roomId.value) {
    await cleanupRoomStateForReuse(roomId.value)
  }
}

const startTest = async () => {
  // Check if the test has no tasks
  if (
    !test.value.testStructure ||
    Object.keys(test.value.testStructure).length === 0
  ) {
    store.commit('SET_TOAST', {
      type: 'info',
      message: t('UserTestView.messages.noTasks'),
    })
    router.push(`/missions/${test.value.id}`)
    return
  }

  await requestFullscreenIfAvailable()

  const observerUser =
    isObservator.value ||
    isObserverAccessLevel(currentUserAccessLevel.value) ||
    normalizeSessionRole(currentUserAccessLevel.value) === 'observator'
  const staffUser = isModerator.value || observerUser

  if (isSessionViewer.value && !staffUser) {
    // Hide start screen and mount VideoCall component for non-participant viewers.
    start.value = false
    displayVideoCallComponent.value = true
    return
  }

  // First, add the class for the exit animation
  const startScreen = document.querySelector('.start-screen')
  if (startScreen) {
    startScreen.classList.add('leaving')
  }

  const currentUserId =
    user.value?.id || user.value?.userDocId || user.value?.uid

  if (staffUser) {
    displayVideoCallComponent.value = true
    start.value = false
  }

  if (!isModerator.value && currentUserId) {
    const isObserverMember = observerUser

    const memberRef = isObserverMember
      ? dbRef(database, `calls/${roomId.value}/staff/${currentUserId}`)
      : dbRef(database, `calls/${roomId.value}/participants/${currentUserId}`)
    const normalizedAccessLevel = normalizeAccessLevel(
      currentUserAccessLevel.value,
    )
    const now = Date.now()

    await update(memberRef, {
      userDocId: currentUserId,
      email: user.value.email || null,
      name:
        user.value.email?.split('@')[0] ||
        user.value.displayName ||
        (isObserverMember ? 'observer' : 'participant'),
      role: isObserverMember ? 'OBSERVER' : 'PARTICIPANT',
      accessLevel: isObserverMember
        ? 'OBSERVATOR'
        : (normalizedAccessLevel ?? 5),
      isModerator: false,
      connected: true,
      presenceStatus: 'connected',
      presenceUpdatedAt: now,
      joinedAt: now,
      media: {
        cameraEnabled: !isObserverMember,
        microphoneEnabled: !isObserverMember,
      },
    })
  }

  // listen for changes
  const roomRef = dbRef(database, `rooms/${roomId.value}`)

  if (isModerator.value || observerUser) {
    const callRef = dbRef(database, `calls/${roomId.value}`)
    const existingCallSnapshot = await get(callRef)

    if (!existingCallSnapshot.exists()) {
      await cleanupRoomStateForReuse(roomId.value)
    }

    onValue(callRef, (snapshot) => {
      const nextCallState = snapshot.val() || {}
      const participants = nextCallState.participants || {}
      const waitingParticipantsCount = Object.values(participants).filter(
        (member) => {
          const status =
            member?.presenceStatus ??
            member?.status ??
            (member?.connected === false ? 'disconnected' : 'connected')

          return status === 'waiting'
        },
      ).length

      if (waitingParticipantsCount > 0) {
        if (
          waitingParticipantsCount !==
          lastWaitingParticipantsNotificationCount.value
        ) {
          const message =
            waitingParticipantsCount === 1
              ? 'One participant is waiting to enter.'
              : 'More than one users are waiting to join.'

          showInfo(message)
          lastWaitingParticipantsNotificationCount.value =
            waitingParticipantsCount
        }
      } else {
        lastWaitingParticipantsNotificationCount.value = 0
      }

      callState.value = {
        staff: nextCallState.staff || {},
        participants,
      }
    })

    const callSnapshot = await get(callRef)

    if (!callSnapshot.exists()) {
      const staffMembers = Array.isArray(session.value?.staff)
        ? session.value.staff
        : []
      const participantMembers = Array.isArray(session.value?.participants)
        ? session.value.participants
        : []
      const participantMembersWithoutStaff = removeStaffDuplicates(
        participantMembers,
        [
          ...staffMembers,
          { userDocId: user.value?.id, email: user.value?.email },
        ],
      )

      const toMemberMap = (members, defaults = {}) =>
        Object.fromEntries(
          members
            .map((member) => {
              const memberId = member?.userDocId || member?.id || member?.email
              if (!memberId) return null

              const memberConnected = Object.prototype.hasOwnProperty.call(
                defaults,
                'connected',
              )
                ? defaults.connected
                : undefined
              const memberPresenceStatus = Object.prototype.hasOwnProperty.call(
                defaults,
                'presenceStatus',
              )
                ? defaults.presenceStatus
                : undefined

              const sanitizedMember = { ...member }
              delete sanitizedMember.connected
              delete sanitizedMember.presenceStatus
              delete sanitizedMember.presenceUpdatedAt
              delete sanitizedMember.updatedAt
              delete sanitizedMember.status

              const normalizedMember = {
                ...sanitizedMember,
                userDocId: member.userDocId || member.id || member.email,
                email: member.email || null,
                name:
                  member.name ||
                  member.displayName ||
                  member.email?.split('@')[0] ||
                  memberId,
                role: member.role || 'participant',
                accessLevel: member.accessLevel ?? member.role ?? 5,
                isModerator:
                  member.role === 'FACILITATOR' || member.isModerator === true,
                joinedAt: member.joinedAt ?? Date.now(),
                media: member.media ?? {
                  cameraEnabled: true,
                  microphoneEnabled: true,
                },
                ...(memberConnected !== undefined
                  ? { connected: memberConnected }
                  : {}),
                ...(memberPresenceStatus !== undefined
                  ? { presenceStatus: memberPresenceStatus }
                  : {}),
                ...(memberPresenceStatus === 'disconnected'
                  ? { presenceUpdatedAt: null }
                  : memberPresenceStatus === 'connected'
                    ? { presenceUpdatedAt: Date.now() }
                    : {}),
              }

              return [memberId, normalizedMember]
            })
            .filter(Boolean),
        )

      const moderatorEntry = {
        userDocId: user.value?.id || 'moderator',
        email: user.value?.email || null,
        name:
          user.value?.email?.split('@')[0] ||
          user.value?.displayName ||
          'moderator',
        role: 'FACILITATOR',
        accessLevel: 'ADMIN',
        isModerator: true,
        connected: true,
        presenceStatus: 'connected',
        presenceUpdatedAt: Date.now(),
        joinedAt: Date.now(),
        media: {
          cameraEnabled: true,
          microphoneEnabled: true,
        },
      }

      const payload = {
        createdAt: Date.now(),
        startedAt: Date.now(),
        status: 'active',
        staff: {
          [moderatorEntry.userDocId]: moderatorEntry,
          ...toMemberMap(
            staffMembers.filter((member) => {
              const memberId = member?.userDocId || member?.id || member?.email
              return memberId && memberId !== moderatorEntry.userDocId
            }),
            {},
          ),
        },
        participants: toMemberMap(participantMembersWithoutStaff, {
          connected: false,
          presenceStatus: 'disconnected',
        }),
      }

      await set(callRef, payload)
    }
  }

  // Ensure only moderator can set this, and only on explicit end, NOT using onDisconnect
  // onDisconnect(roomRef).set(null)

  onValue(roomRef, async (snapshot) => {
    const data = snapshot.val()

    // If data is null, the room has been deleted (e.g. by moderator ending call)
    if (!data) {
      if (!isModerator.value && displayVideoCallComponent.value) {
        // displayVideoCallComponent.value = false // Avoid updating state before redirect to prevent unmount error
        // Optionally show start screen or just return to test flow
        // start.value = true
        showInfo('The moderator has ended the session')
        router.push('/admin')
      }
      return
    }

    const nextGlobalIndex =
      data.globalIndex !== undefined ? data.globalIndex : 0
    const nextTaskIndex = data.taskIndex !== undefined ? data.taskIndex : 0
    const nextShowVideoCall =
      data.showVideoCall !== undefined
        ? data.showVideoCall
        : displayVideoCallComponent.value

    const previousGlobalIndex = globalIndex.value
    const previousTaskIndex = taskIndex.value

    if (!isModerator.value) {
      const announcementKey = `${nextGlobalIndex}-${nextTaskIndex}`
      const stageChanged =
        previousGlobalIndex !== nextGlobalIndex ||
        previousTaskIndex !== nextTaskIndex
      const isAnnounceableStage = nextGlobalIndex >= 1 && nextGlobalIndex <= 6
      const shouldAnnounceRemoteStage =
        isAnnounceableStage &&
        nextShowVideoCall === false &&
        stageChanged &&
        !isProcessingRemoteStepAnnouncement.value &&
        lastAnnouncedRemoteStepKey.value !== announcementKey

      if (shouldAnnounceRemoteStage) {
        isProcessingRemoteStepAnnouncement.value = true
        lastAnnouncedRemoteStepKey.value = announcementKey
        displayVideoCallComponent.value = true

        await showStageAnnouncementByGlobalIndex(nextGlobalIndex, nextTaskIndex)

        displayVideoCallComponent.value = false
        isProcessingRemoteStepAnnouncement.value = false
      } else if (isObservator.value) {
        // Observers stay in the lobby while waiting for the moderator.
        displayVideoCallComponent.value = true
      } else {
        displayVideoCallComponent.value = nextShowVideoCall
      }
    } else {
      // Moderator always stays in video call during session
      displayVideoCallComponent.value = true
    }

    globalIndex.value = nextGlobalIndex
    taskIndex.value = nextTaskIndex
  })

  // Wait for the animation to finish before changing the state
  setTimeout(() => {
    start.value = false
  }, 1000)

  // Initialize Room defaults for Moderator
  if (isModerator.value) {
    // Check if valid data exists, otherwise init defaults
    const snapshot = await get(roomRef)
    const currentData = snapshot.val() || {}

    const updates = {
      status: 'active',
      lastUpdate: Date.now(),
    }

    if (currentData.globalIndex === undefined) updates.globalIndex = 0
    if (currentData.taskIndex === undefined) updates.taskIndex = 0
    if (currentData.showVideoCall === undefined) updates.showVideoCall = false
    if (currentData.createdAt === undefined) updates.createdAt = Date.now()

    await update(roomRef, updates)

    // Avoid leaving a room-level onDisconnect update behind. The moderator's
    // explicit end flow must delete the room branch completely.
  }
}

const handleWelcomeStart = async () => {
  await requestFullscreenIfAvailable()
  displayVideoCallComponent.value = true
  globalIndex.value = 1
}

const showNextStepAnnouncement = async (
  title,
  stageNumber,
  kickerOverride = '',
) => {
  nextStepAnnouncementKicker.value = kickerOverride || `Stage ${stageNumber}`
  nextStepAnnouncementTitle.value = title
  showStepAnnouncement.value = true

  const safetyHideTimer = window.setTimeout(() => {
    showStepAnnouncement.value = false
  }, 4200)

  try {
    await nextTick()
    await animateStepAnnouncement(stepAnnouncementOverlay.value, {
      totalDuration: 3,
    })
  } finally {
    window.clearTimeout(safetyHideTimer)
    showStepAnnouncement.value = false
  }
}

const safelyShowNextStepAnnouncement = async (
  title,
  stageNumber,
  kickerOverride = '',
) => {
  try {
    await showNextStepAnnouncement(title, stageNumber, kickerOverride)
  } catch {
    // Non-critical: users can continue even if announcement animation fails.
  }
}

const getPostTasksAnnouncement = () => {
  if (validate(test.value?.testStructure?.postTest)) {
    return {
      title: t('UserTestView.stepper.postTest'),
      stage: 4,
    }
  }

  return {
    title: t('UserTestView.WelcomeStep.steps.submission'),
    stage: 4,
  }
}

const showTaskTitleAnnouncement = async (idx) => {
  const task = test.value?.testStructure?.userTasks?.[idx]
  if (!task) return

  const fallbackTitle = t('UserTestView.stepper.taskX', { num: idx + 1 })
  const announcementTitle = task.taskName || fallbackTitle
  const announcementKicker = fallbackTitle

  await safelyShowNextStepAnnouncement(announcementTitle, 3, announcementKicker)
}

const showStageAnnouncementByGlobalIndex = async (
  idx,
  currentTaskIndex = 0,
) => {
  if (idx === 1) {
    await safelyShowNextStepAnnouncement(t('UserTestView.stepper.consent'), 1)
    return
  }

  if (idx === 2) {
    await safelyShowNextStepAnnouncement(t('UserTestView.stepper.preTest'), 2)
    return
  }

  if (idx === 3) {
    await safelyShowNextStepAnnouncement(t('UserTestView.stepper.tasks'), 3)
    return
  }

  if (idx === 4) {
    await showTaskTitleAnnouncement(currentTaskIndex)
    return
  }

  if (idx === 5) {
    await safelyShowNextStepAnnouncement(t('UserTestView.stepper.postTest'), 4)
    return
  }

  if (idx === 6) {
    await safelyShowNextStepAnnouncement(
      t('UserTestView.WelcomeStep.steps.submission'),
      5,
    )
  }
}

const handleStartTasks = async () => {
  await showTaskTitleAnnouncement(0)
  taskIndex.value = 0
  globalIndex.value = 4
}

async function handleTaskFinish(userCompleted) {
  // callTimerSave()
  await completeStep(taskIndex.value, 'tasks', userCompleted)
}

const startTimer = () => {
  if (
    timerComponent.value &&
    typeof timerComponent.value.startTimer === 'function'
  ) {
    timerComponent.value.startTimer()
  }
}

const handleTimerStopped = (elapsedTime, idx) => {
  // idx is passed from TaskStep, always use it

  if (!localTestAnswer.tasks) {
    console.error('localTestAnswer.tasks no está definido') // eslint-disable-line no-console
    return
  }

  if (idx === undefined || idx === null) {
    return
  }

  if (localTestAnswer.tasks[idx]) {
    // Asegurar que el tiempo es un número
    const timeToSave =
      typeof elapsedTime === 'number' ? elapsedTime : parseInt(elapsedTime)
    if (!isNaN(timeToSave)) {
      localTestAnswer.tasks[idx].taskTime = timeToSave
    } else {
      console.error('Tiempo no válido:', elapsedTime) // eslint-disable-line no-console
    }
  } else {
    console.error('No se pudo guardar el tiempo para la tarea', idx) // eslint-disable-line no-console
  }
}

const handleTipPressed = (idx) => {
  if (idx === undefined || idx === null) {
    return
  }

  if (!localTestAnswer.tasks?.[idx]) {
    return
  }

  const current = Number(localTestAnswer.tasks[idx].tipPressCount || 0)
  localTestAnswer.tasks[idx].tipPressCount = current + 1
}

const STEP_GROUP_IDS = {
  preTest: 0,
  tasks: 1,
  postTest: 2,
}

function findStepGroup(groupId) {
  return items.value.find((item) => item.id === groupId)
}

function markSubStepComplete(groupId, subStepId) {
  const group = findStepGroup(groupId)
  if (group?.value?.[subStepId]) {
    group.value[subStepId].icon = 'mdi-check-circle-outline'
  }
}

function markGroupComplete(groupId) {
  const group = findStepGroup(groupId)
  if (group) {
    group.icon = 'mdi-check-circle-outline'
  }
}

const completeStep = async (id, type, userCompleted = true) => {
  displayVideoCallComponent.value = true
  try {
    if (type === 'consent') {
      localTestAnswer.consentCompleted = true
      const preTestGroup = findStepGroup(STEP_GROUP_IDS.preTest)
      if (preTestGroup) {
        markSubStepComplete(STEP_GROUP_IDS.preTest, 0)
        if (
          localTestAnswer.preTestCompleted &&
          localTestAnswer.consentCompleted
        ) {
          markGroupComplete(STEP_GROUP_IDS.preTest)
        }
      }
    }
    if (type === 'preTest') {
      localTestAnswer.preTestCompleted = true
      markSubStepComplete(STEP_GROUP_IDS.preTest, 1)
      if (
        localTestAnswer.preTestCompleted &&
        localTestAnswer.consentCompleted
      ) {
        markGroupComplete(STEP_GROUP_IDS.preTest)
      }
    }
    if (type === 'tasks') {
      if (!Array.isArray(localTestAnswer.tasks)) {
        showWarning('Task data is invalid. Please refresh and try again.')
        return
      }
      localTestAnswer.tasks[id].completed = userCompleted
      markSubStepComplete(STEP_GROUP_IDS.tasks, id)
      allTasksCompleted.value = true

      const tasksGroup = findStepGroup(STEP_GROUP_IDS.tasks)
      for (let i = 0; i < tasksGroup?.value?.length || 0; i++) {
        if (!localTestAnswer.tasks[i]?.completed) {
          allTasksCompleted.value = false
          break
        }
      }
      if (allTasksCompleted.value) {
        markGroupComplete(STEP_GROUP_IDS.tasks)
      }
      if (id < localTestAnswer.tasks.length - 1) {
        await showTaskTitleAnnouncement(id + 1)
        taskIndex.value = id + 1
        lastAnnouncedRemoteStepKey.value = `${globalIndex.value}-${taskIndex.value}`
        startTimer()
      }
      if (userCompleted) {
        store.commit('SET_TOAST', {
          type: 'success',
          message: t('UserTestView.messages.taskCompletedSuccess', {
            taskName: test.value.testStructure.userTasks[id].taskName,
          }),
          timeout: 3000,
        })
      }
    }
    if (type === 'postTest') {
      localTestAnswer.postTestCompleted = true
      markSubStepComplete(STEP_GROUP_IDS.postTest, id)
    }

    const roomRef = dbRef(database, `rooms/${roomId.value}`)
    await update(roomRef, {
      globalIndex: globalIndex.value,
      taskIndex: taskIndex.value,
      showVideoCall: true,
    })

    // Update individual participant taskIndex (for tracking)
    if (!isModerator.value && user.value?.id) {
      const participantRef = dbRef(
        database,
        `calls/${roomId.value}/participants/${user.value.id}`,
      )
      // We can just update taskIndex.
      // Note: 'taskIndex' variable here is the NEXT index (already updated above if type=='tasks')
      // validation: type === 'tasks' ? id + 1 : taskIndex.value
      await update(participantRef, {
        taskIndex: taskIndex.value,
      })
    }

    calculateProgress(localTestAnswer)
    await saveAnswer()
  } catch (error) {
    console.error('Error in completeStep:', error) // eslint-disable-line no-console
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.errors.failedToCompleteStep'),
    })
  }
}

const mappingSteps = async () => {
  try {
    const nextItems = []

    // PreTest
    if (validate(test.value?.testStructure?.preTest)) {
      nextItems.push({
        title: t('UserTestView.stepper.preTest'),
        icon: 'mdi-check-bold',
        value: [
          {
            title: t('UserTestView.stepper.consent'),
            icon: 'mdi-check-bold',
            id: 0,
          },
          {
            title: t('UserTestView.stepper.form'),
            icon: 'mdi-check-bold',
            id: 1,
          },
        ],
        id: 0,
      })
      if (
        !localTestAnswer.preTestAnswer.length &&
        Array.isArray(test.value.testStructure.preTest)
      ) {
        localTestAnswer.preTestAnswer = test.value.testStructure.preTest.map(
          () => ({
            answer: '',
          }),
        )
      }
    }

    // Tasks
    if (validate(test.value?.testStructure?.userTasks)) {
      nextItems.push({
        title: t('UserTestView.stepper.tasks'),
        icon: 'mdi-check-bold',
        value: test.value.testStructure.userTasks.map((task, index) => ({
          title: task.taskName,
          icon: 'mdi-check-bold',
          id: index,
        })),
        id: 1,
      })
      if (
        !localTestAnswer.tasks.length &&
        Array.isArray(test.value.testStructure.userTasks)
      ) {
        localTestAnswer.tasks = test.value.testStructure.userTasks.map(
          (task, i) => {
            const newTask = new TaskAnswer({
              taskId: task.id || i,
              taskAnswer: '',
              taskObservations: '',
              postAnswer: '',
              taskTime: 0,
              completed: false,
              tipPressCount: 0,
              susAnswers: [],
              nasaTlxAnswers: null,
            })
            return newTask
          },
        )
      }
    }

    // PostTest
    if (validate(test.value?.testStructure?.postTest)) {
      nextItems.push({
        title: t('UserTestView.stepper.postTest'),
        icon: 'mdi-check-bold',
        value: test.value.testStructure.postTest,
        id: 2,
      })
      if (
        !localTestAnswer.postTestAnswer.length &&
        Array.isArray(test.value.testStructure.postTest)
      ) {
        localTestAnswer.postTestAnswer = test.value.testStructure.postTest.map(
          () => ({
            answer: '',
          }),
        )
      }
    }

    items.value = nextItems
  } catch (error) {
    console.error('Error mapping steps:', error.message) // eslint-disable-line no-console
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.errors.failedToInitializeTestData'),
    })
  }
}

const validate = (object) => {
  return (
    object !== null &&
    object !== undefined &&
    object !== '' &&
    Array.isArray(object) &&
    object.length > 0
  )
}

// testDisabledReason is already declared at line 544

watchEffect(() => {
  if (!test.value) {
    testDisabledReason.value = 'test-no-data'
    isStartTestDisabled.value = true
    return
  }
  if (isModerator.value) {
    if (localTestAnswer.submitted) {
      testDisabledReason.value = 'test-already-completed'
      isStartTestDisabled.value = true
      isStartTestDisabled.value = true
    } else if (
      !test.value.testStructure ||
      Object.keys(test.value.testStructure).length === 0
    ) {
      testDisabledReason.value = 'test-no-tasks-configured'
      isStartTestDisabled.value = true
    } else {
      testDisabledReason.value = null
      isStartTestDisabled.value = false
    }
    return
  }
  const now = new Date()
  const sessionDate = session.value?.scheduledAt
    ? new Date(session.value.scheduledAt)
    : null

  // 🧩 Test already completed
  if (localTestAnswer.submitted) {
    testDisabledReason.value = 'test-already-completed'
    isStartTestDisabled.value = true
    return
  }

  // 🧩 Test is not active
  if (test.value.status !== 'active') {
    testDisabledReason.value = 'test-not-active'
    isStartTestDisabled.value = true
    return
  }

  // 🧩 Test structure missing
  if (
    !test.value.testStructure ||
    Object.keys(test.value.testStructure).length === 0
  ) {
    testDisabledReason.value = 'test-no-tasks-configured'
    isStartTestDisabled.value = true
    return
  }

  // 🧩 Check session date
  if (sessionDate) {
    const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) {
      testDisabledReason.value = 'test-expired'
      isStartTestDisabled.value = true
      return
    }

    if (diffHours > 24) {
      testDisabledReason.value = 'test-session-too-far'
      isStartTestDisabled.value = true
      return
    }
    testDisabledReason.value = null
    return false
  }

  // 🧩 Test expired (fallback endDate)
  if (test.value.endDate) {
    const endDate = new Date(test.value.endDate)
    if (now > endDate) {
      testDisabledReason.value = 'test-expired'
      isStartTestDisabled.value = true
      return
    }
  }

  testDisabledReason.value = null
  isStartTestDisabled.value = false
})

// Lifecycle hooks
onMounted(async () => {
  if (!user.value) {
    showError(t('UserTestView.errors.loginRequired'))
    router.push('/signin')
    return
  }

  if (!sessionId.value) {
    showInfo(t('UserTestView.messages.useSessionLink'))
    return
  }

  globalIndex.value = 0

  if (
    currentUserTestAnswer.value &&
    Object.keys(currentUserTestAnswer.value).length > 0
  ) {
    Object.assign(localTestAnswer, currentUserTestAnswer.value)
  }

  await mappingSteps()
})

// Auto-join if refresh happens during active call
watch(
  isModerator,
  async (newValue) => {
    if (newValue && roomId.value) {
      const roomRef = dbRef(database, `rooms/${roomId.value}`)
      const snapshot = await get(roomRef)
      if (snapshot.exists()) {
        const val = snapshot.val()
        if (val.showVideoCall) {
          displayVideoCallComponent.value = true
          start.value = false // Ensure we hide the start screen if it's there
          await startTest()
        }
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(async () => {
  const roomRef = dbRef(database, `rooms/${roomId.value}`)
  off(roomRef)

  // Never re-create or mutate room metadata during unmount. The room is deleted
  // only in the explicit end-call flow, and any leftover timestamp writes would
  // reintroduce stale `lastUpdate` values after the branch was already removed.

  if (moderatorDisconnectTimeout.value) {
    clearTimeout(moderatorDisconnectTimeout.value)
    moderatorDisconnectTimeout.value = null
  }
})
</script>

<style scoped>
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

.start-screen.leaving::before {
  opacity: 0;
}

/* Stepper sticky styles */
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
  transition:
    background 1s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-stepper.stepper-animate {
  background: #00213f !important;
  opacity: 0.3;
  filter: blur(1px);
}

/* Task stepper background */
.task-stepper {
  background: #00213f !important;
  color: #fff !important;
  --v-stepper-header-title-color: #fff !important;
  --v-stepper-item-title-color: #fff !important;
  --v-stepper-item-color: #fff !important;
}

/* Forzar tamaño grande y negrita en los números del stepper (avatar) y títulos, usando selectores globales */
:deep(.v-stepper-item__avatar) {
  font-size: 1rem !important;
  font-weight: 900 !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Aumentar el tamaño del icono de check-circle cuando el step está completo */
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
