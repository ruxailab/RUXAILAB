<template>
  <div class="session-backdrop mobile-task">
    <SessionBackdropMark />
    <v-container class="session-backdrop-content mobile-task__panel" fluid>
      <v-card rounded="xl" class="pa-2">
          <v-card-text class="pa-4 pa-sm-6">
            <template v-if="uiState === 'loading'">
              <div class="d-flex flex-column align-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="56"
                  width="5"
                />
              </div>
            </template>

            <template v-else-if="uiState === 'waiting'">
              <h1 class="text-h4 font-weight-bold mb-3">
                {{ t('MobileTask.waitingTitle') }}
              </h1>
              <p class="text-h6 mb-0">
                {{ t('MobileTask.waitingBody') }}
              </p>
            </template>

            <template v-else-if="uiState === 'active' || uiState === 'sending'">
              <p class="text-subtitle-1 text-medium-emphasis mb-1">
                {{ t('MobileTask.taskLabel', { number: taskView.taskNumber }) }}
              </p>
              <h1 class="text-h4 font-weight-bold mb-4">
                {{ taskView.title }}
              </h1>
              <div
                v-safe-html="taskView.description"
                class="mobile-task__description text-h6 mb-6"
              />
              <v-btn
                color="error"
                variant="outlined"
                block
                class="mb-3"
                min-height="48"
                :disabled="uiState === 'sending'"
                @click="sendOutcome('not_completed')"
              >
                {{ t('MobileTask.notCompleted') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                block
                min-height="48"
                :disabled="uiState === 'sending'"
                :loading="uiState === 'sending'"
                @click="sendOutcome('completed')"
              >
                {{
                  uiState === 'sending'
                    ? t('MobileTask.sending')
                    : t('MobileTask.completed')
                }}
              </v-btn>
            </template>

            <template v-else-if="uiState === 'accepted'">
              <h1 class="text-h4 font-weight-bold mb-3">
                {{ t('MobileTask.acceptedTitle') }}
              </h1>
              <p
                v-if="displayedOutcome?.outcome === 'completed'"
                class="text-h6 mb-2"
              >
                {{ t('MobileTask.completedSaved') }}
              </p>
              <p
                v-else-if="displayedOutcome?.outcome === 'not_completed'"
                class="text-h6 mb-2"
              >
                {{ t('MobileTask.notCompletedSaved') }}
              </p>
              <p class="text-h6 mb-0">
                {{ t('MobileTask.acceptedBody') }}
              </p>
            </template>

            <template v-else-if="uiState === 'completed'">
              <h1 class="text-h4 font-weight-bold mb-3">
                {{ t('MobileTask.completedTitle') }}
              </h1>
              <p class="text-h6 mb-0">
                {{ t('MobileTask.completedBody') }}
              </p>
            </template>

            <template v-else-if="uiState === 'disconnected'">
              <h1 class="text-h4 font-weight-bold mb-3">
                {{ t('MobileTask.disconnectedTitle') }}
              </h1>
              <p class="text-h6 mb-4">
                {{ t('MobileTask.disconnectedBody') }}
              </p>
              <v-btn
                color="primary"
                variant="flat"
                block
                min-height="48"
                @click="retry"
              >
                {{ t('MobileTask.retry') }}
              </v-btn>
            </template>

            <template v-else>
              <h1 class="text-h4 font-weight-bold mb-3">
                {{ t('MobileTask.endedTitle') }}
              </h1>
              <p class="text-h6 mb-0">
                {{ t('MobileTask.endedBody') }}
              </p>
            </template>
          </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SessionBackdropMark from '@/shared/components/SessionBackdropMark.vue'
import { useI18n } from 'vue-i18n'
import {
  onDisconnect,
  onValue,
  ref as dbRef,
  remove,
  set,
} from 'firebase/database'
import { database } from '@/app/plugins/firebase'
import { submitMobileTaskOutcome } from '@/ux/UserTest/services/mobileTaskCompanionClient'
import {
  mapMobileTaskUiState,
  MOBILE_TASK_SAVED_CONFIRMATION_MS,
  MOBILE_TASK_TOKEN_PATTERN,
  mobileTaskLiveConnectedPath,
  mobileTaskLivePath,
  resolveMobileTaskChannel,
  settleMobileTaskSubmit,
} from '@/ux/UserTest/utils/mobileTaskPageState'

const props = defineProps({
  studyId: { type: String, default: '' },
  participantUid: { type: String, default: '' },
  token: { type: String, default: '' },
})

const { t } = useI18n()
const serverState = ref(null)
const submitting = ref(false)
const networkFailure = ref(false)
const localAccepted = ref(false)
const localAcceptedAttemptId = ref(null)
const displayedOutcome = ref(null)
const pendingOutcome = ref(null)
const taskView = ref({
  taskNumber: null,
  title: '',
  description: '',
  taskIndex: null,
  taskId: null,
  attemptId: null,
})

let rtdbUnsubscribe = null
let rtdbPayload
let rtdbFailed = false
let sawPayload = false
let presenceRef = null
let presenceDisconnect = null
let sessionEnded = false
let confirmationTimer = null

const uiState = computed(() =>
  mapMobileTaskUiState({
    serverState: serverState.value,
    submitting: submitting.value,
    networkFailure: networkFailure.value,
    localAccepted: localAccepted.value,
    localAcceptedAttemptId: localAcceptedAttemptId.value,
    serverAttemptId: taskView.value.attemptId,
  }),
)

function locatorIsValid() {
  return (
    typeof props.studyId === 'string' &&
    props.studyId.length > 0 &&
    props.studyId.length <= 200 &&
    !props.studyId.includes('/') &&
    typeof props.participantUid === 'string' &&
    props.participantUid.length > 0 &&
    MOBILE_TASK_TOKEN_PATTERN.test(props.token)
  )
}

function clearLocalAccepted() {
  if (confirmationTimer) {
    clearTimeout(confirmationTimer)
    confirmationTimer = null
  }
  localAccepted.value = false
  localAcceptedAttemptId.value = null
}

function showLocalAccepted(attemptId) {
  localAccepted.value = true
  localAcceptedAttemptId.value =
    typeof attemptId === 'string' && attemptId.length > 0 ? attemptId : null
  if (confirmationTimer) clearTimeout(confirmationTimer)
  confirmationTimer = setTimeout(() => {
    localAccepted.value = false
    localAcceptedAttemptId.value = null
    confirmationTimer = null
  }, MOBILE_TASK_SAVED_CONFIRMATION_MS)
}

function applyServerPayload(payload) {
  const nextState = payload?.state || null
  serverState.value = nextState
  if (nextState === 'completed' || nextState === 'ended') {
    clearLocalAccepted()
  }
  if (nextState !== 'active') return
  const nextAttemptId =
    typeof payload.attemptId === 'string' ? payload.attemptId : null
  if (
    localAccepted.value &&
    nextAttemptId &&
    nextAttemptId !== localAcceptedAttemptId.value
  ) {
    clearLocalAccepted()
  }
  taskView.value = {
    taskNumber: payload.taskNumber,
    title: typeof payload.title === 'string' ? payload.title : '',
    description:
      typeof payload.description === 'string' ? payload.description : '',
    taskIndex: payload.taskIndex,
    taskId: payload.taskId,
    attemptId: nextAttemptId,
  }
  displayedOutcome.value = null
  pendingOutcome.value = null
}

function phoneLocator() {
  return {
    studyId: props.studyId,
    participantUid: props.participantUid,
    token: props.token,
  }
}

function resetChannel() {
  rtdbPayload = undefined
  rtdbFailed = false
  sawPayload = false
}

function publishChannel() {
  if (sessionEnded) return
  const channel = resolveMobileTaskChannel({
    rtdb: rtdbPayload,
    rtdbFailed,
    sawPayload,
  })
  if (channel.status === 'loading') return
  if (channel.status === 'disconnected') {
    if (!submitting.value) networkFailure.value = true
    return
  }
  if (channel.status === 'ended') {
    markEnded()
    return
  }
  if (typeof rtdbPayload?.state === 'string') {
    sawPayload = true
  }
  if (!submitting.value) networkFailure.value = false
  applyServerPayload(channel.payload)
}

function listen() {
  stopListening()
  const path = mobileTaskLivePath(props.token)
  if (!locatorIsValid() || !path) {
    markEnded()
    return
  }
  sessionEnded = false
  resetChannel()
  void startPresence()
  rtdbUnsubscribe = onValue(
    dbRef(database, path),
    (snapshot) => {
      rtdbFailed = false
      rtdbPayload = snapshot.exists() ? snapshot.val() || {} : null
      publishChannel()
    },
    () => {
      rtdbFailed = true
      rtdbPayload = null
      publishChannel()
    },
  )
}

async function stopPresence() {
  const disconnect = presenceDisconnect
  const node = presenceRef
  presenceDisconnect = null
  presenceRef = null
  if (disconnect) {
    try {
      await disconnect.cancel()
    } catch {
      /* already disconnected */
    }
  }
  if (node) {
    try {
      await remove(node)
    } catch {
      /* best-effort */
    }
  }
}

async function startPresence() {
  await stopPresence()
  const path = mobileTaskLiveConnectedPath(props.token)
  if (!path || sessionEnded) return
  presenceRef = dbRef(database, path)
  presenceDisconnect = onDisconnect(presenceRef)
  try {
    await presenceDisconnect.remove()
    await set(presenceRef, true)
  } catch {
    /* Presence is best-effort; the task view still works. */
  }
}

function stopListening() {
  if (typeof rtdbUnsubscribe === 'function') rtdbUnsubscribe()
  rtdbUnsubscribe = null
}

function markEnded() {
  sessionEnded = true
  serverState.value = 'ended'
  networkFailure.value = false
  clearLocalAccepted()
  stopListening()
  void stopPresence()
}

function hasAttemptIdentity() {
  return (
    Number.isInteger(taskView.value.taskIndex) &&
    taskView.value.taskId != null &&
    taskView.value.taskId !== '' &&
    typeof taskView.value.attemptId === 'string' &&
    taskView.value.attemptId.length > 0
  )
}

async function sendOutcome(outcome) {
  if (submitting.value) return
  if (uiState.value !== 'active' && uiState.value !== 'disconnected') return
  submitting.value = true
  networkFailure.value = false
  const settled = await settleMobileTaskSubmit(async () => {
    if (!hasAttemptIdentity()) {
      throw new Error('Task attempt is not available')
    }
    return submitMobileTaskOutcome({
      ...phoneLocator(),
      taskIndex: taskView.value.taskIndex,
      taskId: taskView.value.taskId,
      attemptId: taskView.value.attemptId,
      outcome,
    })
  })
  submitting.value = false
  if (!settled.success) {
    networkFailure.value = true
    pendingOutcome.value = outcome
    return
  }
  networkFailure.value = false
  pendingOutcome.value = null
  displayedOutcome.value = settled
  showLocalAccepted(settled.attemptId)
}

function retry() {
  if (pendingOutcome.value) {
    void sendOutcome(pendingOutcome.value)
    return
  }
  if (sessionEnded) return
  listen()
}

function onVisible() {
  if (document.visibilityState !== 'visible' || sessionEnded) return
  if (networkFailure.value) listen()
  else void startPresence()
}

if (!locatorIsValid()) {
  serverState.value = 'ended'
  sessionEnded = true
} else {
  serverState.value = 'waiting'
}

onMounted(() => {
  listen()
  document.addEventListener('visibilitychange', onVisible)
})

onBeforeUnmount(() => {
  clearLocalAccepted()
  stopListening()
  void stopPresence()
  document.removeEventListener('visibilitychange', onVisible)
})
</script>

<style scoped>
.mobile-task {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  align-items: safe center;
  justify-content: center;
  padding: 24px 16px;
  box-sizing: border-box;
  background-color: #00213f;
  background-image: linear-gradient(160deg, #00213f 0%, #1a2f4f 45%, #303f9f 100%);
}

.mobile-task__panel {
  width: min(100%, 32rem);
  margin: 0;
}

.mobile-task :deep(.session-backdrop-mark) {
  top: auto;
  bottom: 0;
  height: 100dvh;
  margin-top: 0;
  background-size: auto 100%;
  background-position: right bottom;
  /* The logo file has empty space under the X. Shift it so the mark sits on the bottom edge. */
  transform: translateY(25.121%);
}

.mobile-task__description :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
