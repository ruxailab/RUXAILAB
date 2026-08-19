<template>
  <div>
    <div class="side-panel" :class="{ 'side-panel-open': showSidePanel }">
      <div class="side-panel-header">
        <h3>{{ t('videoCall.panel.toolsPanelTitle') }}</h3>
        <v-btn
          icon
          size="small"
          variant="text"
          class="close-btn"
          @click="toggleSidePanel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="side-panel-content">
        <div class="panel-section">
          <h4>{{ t('videoCall.panel.sessionControl') }}</h4>

          <div v-if="!callStarted" class="session-controls">
            <div v-if="!caller" class="participant-info">
              <p class="text-body-2 mb-0">
                <v-icon start size="16">mdi-information</v-icon>
                {{ t('videoCall.panel.joinRoomInfo') }}
              </p>
            </div>
          </div>

          <div v-else class="session-controls">
            <v-btn
              v-if="caller"
              color="success"
              size="large"
              block
              class="mb-3"
              @click="proceedToNextStep"
            >
              <v-icon start>mdi-arrow-right</v-icon>
              {{ t('videoCall.panel.proceedNextStep') }}
            </v-btn>

            <v-btn
              v-if="!isObservator"
              color="error"
              size="large"
              block
              variant="outlined"
              @click="endCall"
            >
              <v-icon start>mdi-phone-hangup</v-icon>
              {{ t('videoCall.panel.endCall') }}
            </v-btn>

            <div class="status-message">
              <v-chip color="green" size="small" class="mb-2">
                <v-icon start size="16">mdi-phone</v-icon>
                {{ t('videoCall.panel.activeCall') }}
              </v-chip>
            </div>
          </div>
        </div>

        <div v-if="safeStaffList.length" class="panel-section">
          <h4>Staff</h4>
          <div
            v-for="member in safeStaffList"
            :key="member.id"
            class="participant-item"
          >
            <v-avatar
              size="32"
              :color="member.role === 'moderator' ? 'blue' : 'orange'"
            >
              <v-icon color="white">{{
                member.role === 'moderator' ? 'mdi-account-star' : 'mdi-eye'
              }}</v-icon>
            </v-avatar>
            <div class="participant-info">
              <span class="participant-name">
                {{ member.name }}
                <v-chip
                  v-if="member.role === 'observator'"
                  size="x-small"
                  color="orange"
                  class="ml-1"
                >
                  {{ t('videoCall.panel.observator') }}
                </v-chip>
                <v-chip
                  v-else-if="member.role === 'moderator'"
                  size="x-small"
                  color="blue"
                  class="ml-1"
                >
                  {{ t('videoCall.panel.moderator') }}
                </v-chip>
              </span>
              <div class="participant-status">
                <v-chip size="x-small" :color="getPresenceState(member).color">
                  {{ getPresenceState(member).label }}
                </v-chip>
                <v-chip
                  v-if="member.presenceUpdatedAt"
                  size="x-small"
                  color="grey"
                  class="ml-1"
                >
                  {{ formatPresenceUpdatedAt(member.presenceUpdatedAt) }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <div v-if="safeParticipantList.length" class="panel-section">
          <h4>{{ t('videoCall.panel.participants') }}</h4>
          <div
            v-for="participant in safeParticipantList"
            :key="participant.id"
            class="participant-item"
          >
            <v-avatar
              size="32"
              :color="
                participant.role === 'moderator'
                  ? 'blue'
                  : participant.role === 'observator'
                    ? 'orange'
                    : 'green'
              "
            >
              <v-icon color="white">{{
                participant.role === 'moderator'
                  ? 'mdi-account-star'
                  : participant.role === 'observator'
                    ? 'mdi-eye'
                    : 'mdi-account'
              }}</v-icon>
            </v-avatar>
            <div class="participant-info">
              <span class="participant-name">
                {{
                  participant.name +
                  (participant.isSelf ? ` (${t('videoCall.panel.you')})` : '')
                }}

                <v-chip
                  v-if="participant.role === 'observator'"
                  size="x-small"
                  color="orange"
                  class="ml-1"
                >
                  {{ t('videoCall.panel.observator') }}
                </v-chip>

                <v-chip
                  v-else-if="participant.role === 'moderator'"
                  size="x-small"
                  color="blue"
                  class="ml-1"
                >
                  {{ t('videoCall.panel.moderator') }}
                </v-chip>
                {{ participant }}
              </span>
              <div class="participant-status">
                <v-chip
                  size="x-small"
                  :color="getPresenceState(participant).color"
                >
                  {{ getPresenceState(participant).label }}
                </v-chip>
                <v-chip
                  v-if="participant.presenceUpdatedAt"
                  size="x-small"
                  color="grey"
                  class="ml-1"
                >
                  {{ formatPresenceUpdatedAt(participant.presenceUpdatedAt) }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="stepper-panel"
      :class="{ 'stepper-panel-open': showStepperPanel }"
    >
      <div class="stepper-panel-header">
        <h3>Test Progress</h3>
        <v-btn
          icon
          size="small"
          variant="text"
          class="close-btn"
          @click="toggleStepperPanel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="stepper-panel-content">
        <div v-if="!caller" class="moderator-notice">
          <v-chip size="small" color="orange" class="mb-4">
            <v-icon start size="16">mdi-information</v-icon>
            {{ t('videoCall.panel.moderatorOnlySteps') }}
          </v-chip>
        </div>

        <div class="custom-stepper">
          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 0,
              'step-completed': currentStepperValue >= 1,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('consent')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue >= 1" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>1</span>
              </div>
              <div v-if="currentStepperValue >= 1" class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Consent</h4>
              <p class="step-description">User consent and agreement</p>
            </div>
          </div>

          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 1,
              'step-completed': currentStepperValue >= 2,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('pretest')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue >= 2" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>2</span>
              </div>
              <div v-if="currentStepperValue >= 2" class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Pre-test</h4>
              <p class="step-description">Initial questionnaire</p>
            </div>
          </div>

          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 2,
              'step-completed': currentStepperValue >= 3,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('tasks')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue >= 3" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>3</span>
              </div>
              <div v-if="currentStepperValue >= 3" class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Tasks</h4>
              <p class="step-description">User testing tasks</p>

              <div
                v-if="
                  currentStepperValue === 2 &&
                  caller &&
                  test?.testStructure?.userTasks
                "
                class="tasks-dropdown mt-3"
              >
                <v-select
                  :items="taskDropdownItems"
                  :model-value="currentTaskIndex"
                  item-title="title"
                  item-value="index"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="task-selector"
                  placeholder="Select a task"
                  prepend-inner-icon="mdi-format-list-bulleted"
                  @update:model-value="goToSpecificTask"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps" :title="item.raw.title">
                      <template #prepend>
                        <v-icon
                          size="20"
                          :color="
                            item.raw.index < currentTaskIndex
                              ? 'success'
                              : item.raw.index === currentTaskIndex
                                ? 'primary'
                                : 'grey'
                          "
                        >
                          {{
                            item.raw.index < currentTaskIndex
                              ? 'mdi-check-circle'
                              : item.raw.index === currentTaskIndex
                                ? 'mdi-play-circle'
                                : 'mdi-circle-outline'
                          }}
                        </v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>
            </div>
          </div>

          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 3,
              'step-completed': currentStepperValue >= 4,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('posttest')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue >= 4" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>4</span>
              </div>
              <div v-if="currentStepperValue >= 4" class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Post-test</h4>
              <p class="step-description">Final questionnaire</p>
            </div>
          </div>

          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 4,
              'step-completed': currentStepperValue === 5,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('completion')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue === 5" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>5</span>
              </div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Completion</h4>
              <p class="step-description">Test finished</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showSidePanel || showStepperPanel"
      class="panel-overlay"
      @click="closePanels"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  showSidePanel: Boolean,
  showStepperPanel: Boolean,
  caller: Boolean,
  isObservator: Boolean,
  callStarted: Boolean,
  participantsList: { type: Array, default: () => [] },
  staffList: { type: Array, default: () => [] },
  participantList: { type: Array, default: () => [] },
  currentStepperValue: Number,
  taskDropdownItems: { type: Array, default: () => [] },
  currentTaskIndex: Number,
  test: Object,
  isCameraEnabled: Boolean,
  isMicrophoneEnabled: Boolean,
  isSharingScreen: Boolean,
  t: Function,
  toggleSidePanel: Function,
  toggleStepperPanel: Function,
  closePanels: Function,
  proceedToNextStep: Function,
  goToStep: Function,
  goToSpecificTask: Function,
  endCall: Function,
  toggleCamera: Function,
  toggleMicrophone: Function,
  toggleScreenShare: Function,
})

const safeStaffList = computed(() =>
  Array.isArray(props.staffList) ? props.staffList : [],
)
const safeParticipantList = computed(() =>
  Array.isArray(props.participantList) ? props.participantList : [],
)

const getPresenceState = (member) => {
  const rawStatus =
    member?.presenceStatus ??
    (member?.connected === true
      ? 'connected'
      : member?.connected === false
        ? 'disconnected'
        : 'waiting')

  const normalized = String(rawStatus).trim().toLowerCase()

  if (
    normalized === 'waiting' ||
    normalized === 'lobby' ||
    normalized === 'pending'
  ) {
    return { color: 'orange', label: 'waiting' }
  }

  if (
    normalized === 'connected' ||
    normalized === 'in-room' ||
    normalized === 'joined'
  ) {
    return { color: 'green', label: 'connected' }
  }

  if (
    normalized === 'disconnected' ||
    normalized === 'offline' ||
    normalized === 'left' ||
    normalized === 'exited'
  ) {
    return { color: 'grey', label: 'disconnected' }
  }

  return { color: 'grey', label: normalized || 'waiting' }
}

const formatPresenceUpdatedAt = (value) => {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped src="./videoCallShared.css"></style>
