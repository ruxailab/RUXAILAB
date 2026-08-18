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

        <div class="panel-section">
          <h4>{{ t('videoCall.panel.participants') }}</h4>
          <div
            v-for="participant in participantsList"
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
              </span>
              <div class="participant-status">
                <v-chip
                  size="x-small"
                  :color="participant.connected ? 'green' : 'grey'"
                >
                  {{
                    participant.connected
                      ? t('videoCall.panel.connected')
                      : t('videoCall.panel.disconnected')
                  }}
                </v-chip>
                <v-chip
                  v-if="participant.isSelf && !isObservator"
                  size="x-small"
                  :color="participant.hasCamera ? 'green' : 'red'"
                  class="ml-1"
                >
                  {{
                    participant.hasCamera
                      ? t('videoCall.panel.camera')
                      : t('videoCall.panel.noCamera')
                  }}
                </v-chip>
                <v-chip
                  v-if="participant.isSelf && !isObservator"
                  size="x-small"
                  :color="participant.hasMicrophone ? 'green' : 'red'"
                  class="ml-1"
                >
                  {{
                    participant.hasMicrophone
                      ? t('videoCall.panel.microphone')
                      : t('videoCall.panel.noMicrophone')
                  }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isObservator" class="panel-section">
          <h4>{{ t('videoCall.panel.settings') }}</h4>
          <v-list density="compact">
            <v-list-item @click="toggleCamera">
              <template #prepend>
                <v-icon :color="isCameraEnabled ? 'green' : 'red'">
                  {{ isCameraEnabled ? 'mdi-video' : 'mdi-video-off' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{
                  isCameraEnabled
                    ? t('videoCall.panel.disableCamera')
                    : t('videoCall.panel.enableCamera')
                }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="toggleMicrophone">
              <template #prepend>
                <v-icon :color="isMicrophoneEnabled ? 'green' : 'red'">
                  {{
                    isMicrophoneEnabled
                      ? 'mdi-microphone'
                      : 'mdi-microphone-off'
                  }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{
                  isMicrophoneEnabled
                    ? t('videoCall.panel.muteMicrophone')
                    : t('videoCall.panel.unmuteMicrophone')
                }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="callStarted" @click="toggleScreenShare">
              <template #prepend>
                <v-icon :color="isSharingScreen ? 'blue' : 'grey'">
                  {{
                    isSharingScreen
                      ? 'mdi-monitor-off'
                      : 'mdi-monitor-screenshot'
                  }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{
                  isSharingScreen
                    ? t('videoCall.panel.stopScreenShare')
                    : t('videoCall.panel.shareScreen')
                }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
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
const props = defineProps({
  showSidePanel: Boolean,
  showStepperPanel: Boolean,
  caller: Boolean,
  isObservator: Boolean,
  callStarted: Boolean,
  participantsList: Array,
  currentStepperValue: Number,
  taskDropdownItems: Array,
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
</script>

<style scoped src="./videoCallShared.css"></style>
