<template>
  <component
    :is="activeComponent"
    v-bind="props"
    :is-moderator="isModerator"
    :is-observator="isObservator"
    :session-staff="sessionStaff"
    :session-participants="sessionParticipants"
    :completed-steps="completedSteps"
    @set-remote-stream="emit('setRemoteStream', $event)"
    @proceed-to-next-step="emit('proceedToNextStep')"
    @step-selected="emit('stepSelected', $event)"
    @call-ended="emit('call-ended')"
    @moderator-status-change="emit('moderatorStatusChange', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'
import VideoCallMesh from './mesh/VideoCallMesh.vue'
import VideoCallLiveKit from './livekit/VideoCallLiveKit.vue'
import {
  VIDEO_CALL_PROVIDERS,
  resolveVideoCallProvider,
} from '@/shared/constants/videoCallProviders'

const props = defineProps({
  roomId: String,
  isModerator: Boolean,
  isObservator: Boolean,
  user: Object,
  accessLevel: Number,
  currentGlobalIndex: Number,
  currentTaskIndex: Number,
  test: Object,
  localTestAnswer: Object,
  sessionStaff: Array,
  sessionParticipants: Array,
  notesDrawerOpen: Boolean,
  notesCount: Number,
  toggleNotesDrawer: Function,
  completedSteps: {
    type: Object,
    default: () => ({
      consent: false,
      preTest: false,
      tasks: false,
      postTest: true,
      completion: false,
    }),
  },
})

const emit = defineEmits([
  'setRemoteStream',
  'proceedToNextStep',
  'stepSelected',
  'call-ended',
  'moderatorStatusChange',
])

const provider = computed(() =>
  resolveVideoCallProvider(props.test?.testStructure),
)

const activeComponent = computed(() =>
  provider.value === VIDEO_CALL_PROVIDERS.LIVEKIT
    ? VideoCallLiveKit
    : VideoCallMesh,
)
</script>
