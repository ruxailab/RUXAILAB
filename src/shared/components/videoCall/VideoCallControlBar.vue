<template>
  <div class="bottom-control-bar">
    <div class="control-bar-layout">
      <div class="control-bar-left"></div>

      <div class="control-buttons-container">
        <template v-if="!props.isObservator">
          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                :class="{
                  'control-btn-disabled': !props.isCameraEnabled,
                  'control-btn-enabled': props.isCameraEnabled,
                }"
                class="control-btn"
                icon
                size="large"
                @click="props.toggleCamera"
              >
                <v-icon size="28">{{
                  props.isCameraEnabled ? 'mdi-video' : 'mdi-video-off'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              props.isCameraEnabled ? 'Turn off camera' : 'Turn on camera'
            }}</span>
          </v-tooltip>

          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                :class="{
                  'control-btn-disabled': !props.isMicrophoneEnabled,
                  'control-btn-enabled': props.isMicrophoneEnabled,
                }"
                class="control-btn"
                icon
                size="large"
                @click="props.toggleMicrophone"
              >
                <v-icon size="28">{{
                  props.isMicrophoneEnabled
                    ? 'mdi-microphone'
                    : 'mdi-microphone-off'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              props.isMicrophoneEnabled
                ? 'Mute microphone'
                : 'Unmute microphone'
            }}</span>
          </v-tooltip>

          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                :class="{
                  'control-btn-active': props.isSharingScreen,
                  'control-btn-enabled': !props.isSharingScreen,
                }"
                class="control-btn"
                icon
                size="large"
                @click="props.toggleScreenShare"
              >
                <v-icon size="28">{{
                  props.isSharingScreen
                    ? 'mdi-monitor-off'
                    : 'mdi-monitor-screenshot'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              props.isSharingScreen ? 'Stop sharing screen' : 'Share screen'
            }}</span>
          </v-tooltip>
        </template>
      </div>

      <div class="control-bar-right">
        <v-tooltip v-if="props.caller && !props.callStarted" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="success"
              class="control-btn control-btn-primary me-2"
              size="large"
              @click="props.startCall"
            >
              <v-icon start size="20">mdi-video-plus</v-icon>
              Open Room
            </v-btn>
          </template>
          <span>Start the video call session</span>
        </v-tooltip>

        <v-tooltip v-if="props.caller && props.callStarted" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="error"
              class="control-btn control-btn-danger me-2"
              size="large"
              @click="props.endCall"
            >
              <v-icon start size="20">mdi-phone-hangup</v-icon>
              End Call
            </v-btn>
          </template>
          <span>End the video call session</span>
        </v-tooltip>

        <v-tooltip
          v-if="(props.isObservator || !props.caller) && canLeaveCall"
          location="top"
        >
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="error"
              class="control-btn control-btn-danger me-2"
              size="large"
              @click="props.leaveCall"
            >
              <v-icon start size="20">mdi-phone-hangup</v-icon>
              Leave Call
            </v-btn>
          </template>
          <span>Leave the video call session</span>
        </v-tooltip>

        <v-tooltip v-if="props.isObservator" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :class="{
                'control-btn-active': props.notesDrawerOpen,
                'control-btn-enabled': !props.notesDrawerOpen,
              }"
              class="control-btn secondary-control-btn"
              icon
              size="large"
              @click="props.toggleNotesDrawer"
            >
              <v-badge
                :content="props.notesCount"
                :model-value="props.notesCount > 0"
                color="error"
              >
                <v-icon size="28">
                  {{
                    props.notesDrawerOpen
                      ? 'mdi-notebook-edit'
                      : 'mdi-notebook-outline'
                  }}
                </v-icon>
              </v-badge>
            </v-btn>
          </template>
          <span>{{ props.notesDrawerOpen ? 'Hide notes' : 'Show notes' }}</span>
        </v-tooltip>

        <v-tooltip v-if="!props.isObservator" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :class="{
                'control-btn-active': props.showStepperPanel,
                'control-btn-enabled': !props.showStepperPanel,
              }"
              class="control-btn secondary-control-btn"
              icon
              size="large"
              @click="props.toggleStepperPanel"
            >
              <v-icon size="28">mdi-format-list-numbered</v-icon>
            </v-btn>
          </template>
          <span>{{
            props.showStepperPanel ? 'Hide steps' : 'Show steps'
          }}</span>
        </v-tooltip>

        <v-tooltip location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :class="{
                'control-btn-active': props.showSidePanel,
                'control-btn-enabled': !props.showSidePanel,
              }"
              class="control-btn secondary-control-btn"
              icon
              size="large"
              @click="props.toggleSidePanel"
            >
              <v-icon size="28">mdi-account-group</v-icon>
            </v-btn>
          </template>
          <span>{{ props.showSidePanel ? 'Hide panel' : 'Show panel' }}</span>
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

const canLeaveCall = computed(
  () => props.isObservator || (props.callStarted && !props.caller),
)

const overflowActions = computed(() => {
  const actions = []

  if (props.isObservator) {
    actions.push({
      key: 'notes',
      icon: props.notesDrawerOpen
        ? 'mdi-notebook-edit'
        : 'mdi-notebook-outline',
      label: props.notesDrawerOpen ? 'Hide notes' : 'Show notes',
      active: props.notesDrawerOpen,
      handler: props.toggleNotesDrawer,
    })
  } else {
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
