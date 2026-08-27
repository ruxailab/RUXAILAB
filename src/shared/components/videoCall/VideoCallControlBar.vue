<template>
  <div class="bottom-control-bar">
    <div class="control-bar-layout">
      <div class="control-bar-left"></div>

      <div class="control-buttons-container">
        <template v-if="!isObservator">
          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                :class="{
                  'control-btn-disabled': !isCameraEnabled,
                  'control-btn-enabled': isCameraEnabled,
                }"
                class="control-btn"
                icon
                size="large"
                @click="toggleCamera"
              >
                <v-icon size="28">{{
                  isCameraEnabled ? 'mdi-video' : 'mdi-video-off'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              isCameraEnabled ? 'Turn off camera' : 'Turn on camera'
            }}</span>
          </v-tooltip>

          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                :class="{
                  'control-btn-disabled': !isMicrophoneEnabled,
                  'control-btn-enabled': isMicrophoneEnabled,
                }"
                class="control-btn"
                icon
                size="large"
                @click="toggleMicrophone"
              >
                <v-icon size="28">{{
                  isMicrophoneEnabled
                    ? 'mdi-microphone'
                    : 'mdi-microphone-off'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              isMicrophoneEnabled
                ? 'Mute microphone'
                : 'Unmute microphone'
            }}</span>
          </v-tooltip>

          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                :class="{
                  'control-btn-active': isSharingScreen,
                  'control-btn-enabled': !isSharingScreen,
                }"
                class="control-btn"
                icon
                size="large"
                @click="toggleScreenShare"
              >
                <v-icon size="28">{{
                  isSharingScreen
                    ? 'mdi-monitor-off'
                    : 'mdi-monitor-screenshot'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              isSharingScreen ? 'Stop sharing screen' : 'Share screen'
            }}</span>
          </v-tooltip>
        </template>
      </div>

      <div class="control-bar-right">
        <v-tooltip v-if="caller && !callStarted" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="success"
              class="control-btn control-btn-primary me-2"
              size="large"
              @click="startCall"
            >
              <v-icon start size="20">mdi-video-plus</v-icon>
              Open Room
            </v-btn>
          </template>
          <span>Start the video call session</span>
        </v-tooltip>

        <v-tooltip v-if="caller && callStarted" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="error"
              class="control-btn control-btn-danger me-2"
              size="large"
              @click="endCall"
            >
              <v-icon start size="20">mdi-phone-hangup</v-icon>
              End Call
            </v-btn>
          </template>
          <span>End the video call session</span>
        </v-tooltip>

        <v-tooltip
          v-if="(isObservator || !caller) && canLeaveCall"
          location="top"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="error"
              class="control-btn control-btn-danger me-2"
              size="large"
              @click="leaveCall"
            >
              <v-icon start size="20">mdi-phone-hangup</v-icon>
              Leave Call
            </v-btn>
          </template>
          <span>Leave the video call session</span>
        </v-tooltip>

        <v-tooltip v-if="canUseNotes" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :class="{
                'control-btn-active': notesDrawerOpen,
                'control-btn-enabled': !notesDrawerOpen,
              }"
              class="control-btn secondary-control-btn"
              icon
              size="large"
              @click="toggleNotesDrawer"
            >
              <v-badge
                :content="notesCount"
                :model-value="notesCount > 0"
                color="error"
              >
                <v-icon size="28">
                  {{
                    notesDrawerOpen
                      ? 'mdi-notebook-edit'
                      : 'mdi-notebook-outline'
                  }}
                </v-icon>
              </v-badge>
            </v-btn>
          </template>
          <span>{{ notesDrawerOpen ? 'Hide notes' : 'Show notes' }}</span>
        </v-tooltip>

        <v-tooltip v-if="!isObservator" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :class="{
                'control-btn-active': showStepperPanel,
                'control-btn-enabled': !showStepperPanel,
              }"
              class="control-btn secondary-control-btn"
              icon
              size="large"
              @click="toggleStepperPanel"
            >
              <v-icon size="28">mdi-format-list-numbered</v-icon>
            </v-btn>
          </template>
          <span>{{
            showStepperPanel ? 'Hide steps' : 'Show steps'
          }}</span>
        </v-tooltip>

        <v-tooltip location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :class="{
                'control-btn-active': showSidePanel,
                'control-btn-enabled': !showSidePanel,
              }"
              class="control-btn secondary-control-btn"
              icon
              size="large"
              @click="toggleSidePanel"
            >
              <v-icon size="28">mdi-account-group</v-icon>
            </v-btn>
          </template>
          <span>{{ showSidePanel ? 'Hide panel' : 'Show panel' }}</span>
        </v-tooltip>

        <v-menu
          location="top end"
          offset="12"
          content-class="control-overflow-menu-content"
        >
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              class="control-btn control-btn-enabled control-overflow-menu"
              icon
              size="large"
            >
              <v-icon size="28">mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          <v-list density="compact" class="control-overflow-list">
            <v-list-item
              v-for="action in overflowActions"
              :key="action.key"
              :active="action.active"
              @click="runOverflowAction(action)"
            >
              <template #prepend>
                <v-icon>{{ action.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ action.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  caller: Boolean,
  isObservator: Boolean,
  callStarted: Boolean,
  isCameraEnabled: Boolean,
  isMicrophoneEnabled: Boolean,
  isSharingScreen: Boolean,
  showStepperPanel: Boolean,
  showSidePanel: Boolean,
  notesDrawerOpen: Boolean,
  notesCount: Number,
  toggleCamera: Function,
  toggleMicrophone: Function,
  toggleScreenShare: Function,
  startCall: Function,
  leaveCall: Function,
  endCall: Function,
  toggleStepperPanel: Function,
  toggleSidePanel: Function,
  toggleNotesDrawer: Function,
})

const canLeaveCall = computed(() => props.isObservator || !props.caller)

const canUseNotes = computed(() => props.isObservator || props.caller)

const overflowActions = computed(() => {
  const actions = []

  if (canUseNotes.value) {
    actions.push({
      key: 'notes',
      icon: props.notesDrawerOpen
        ? 'mdi-notebook-edit'
        : 'mdi-notebook-outline',
      label: props.notesDrawerOpen ? 'Hide notes' : 'Show notes',
      active: props.notesDrawerOpen,
      handler: props.toggleNotesDrawer,
    })
  }

  if (!props.isObservator) {
    actions.push({
      key: 'steps',
      icon: 'mdi-format-list-numbered',
      label: props.showStepperPanel ? 'Hide steps' : 'Show steps',
      active: props.showStepperPanel,
      handler: props.toggleStepperPanel,
    })
  }

  actions.push({
    key: 'participants',
    icon: 'mdi-account-group',
    label: props.showSidePanel ? 'Hide panel' : 'Show panel',
    active: props.showSidePanel,
    handler: props.toggleSidePanel,
  })

  return actions
})

function runOverflowAction(action) {
  if (typeof action.handler === 'function') {
    action.handler()
  }
}
</script>

<style scoped src="./videoCallShared.css"></style>
