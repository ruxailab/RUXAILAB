<template>
  <v-container class="mobile-task fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { doc, onSnapshot } from 'firebase/firestore'
import {
  onDisconnect,
  ref as dbRef,
  remove,
  set,
} from 'firebase/database'
import { database, db } from '@/app/plugins/firebase'
import { submitMobileTaskOutcome } from '@/ux/UserTest/services/mobileTaskCompanionClient'
import {
  mapMobileTaskUiState,
  MOBILE_TASK_SAVED_CONFIRMATION_MS,
  MOBILE_TASK_TOKEN_PATTERN,
  mobileTaskPresencePath,
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

let unsubscribe = null
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

function viewRef() {
  return doc(db, 'tests', props.studyId, 'mobileTaskViews', props.token)
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
  const path = mobileTaskPresencePath(props.token)
  if (!path || sessionEnded) return
  presenceRef = dbRef(database, path)
  presenceDisconnect = onDisconnect(presenceRef)
  try {
    await presenceDisconnect.remove()
    await set(presenceRef, { connected: true })
  } catch {
    /* Presence is best-effort; the task view still works. */
  }
}

function stopListening() {
  if (typeof unsubscribe === 'function') unsubscribe()
  unsubscribe = null
}

function markEnded() {
  sessionEnded = true
  serverState.value = 'ended'
  networkFailure.value = false
  clearLocalAccepted()
  stopListening()
  void stopPresence()
}

function listen() {
  stopListening()
  if (!locatorIsValid()) {
    markEnded()
    return
  }
  sessionEnded = false
  unsubscribe = onSnapshot(
    viewRef(),
    (snapshot) => {
      if (!snapshot.exists()) {
        markEnded()
        return
      }
      if (!submitting.value) networkFailure.value = false
      applyServerPayload(snapshot.data() || {})
    },
    () => {
      if (!submitting.value && !sessionEnded) networkFailure.value = true
    },
  )
  void startPresence()
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
  min-height: 100vh;
  background: #f4f6f8;
}

.mobile-task__description :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
