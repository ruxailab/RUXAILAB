<template>
  <div>
    <VideoToolDrawer
      :model-value="showSidePanel"
      :title="t('videoCall.panel.toolsPanelTitle')"
      @close="closePanels"
    >
      <ToolsPanel
        :staff-list="staffList"
        :participant-list="participantList"
        :t="t"
      />
    </VideoToolDrawer>

    <VideoToolDrawer
      v-if="!isObservator"
      :model-value="showStepperPanel"
      title="Test Progress"
      @close="closePanels"
    >
      <TestProgressPanel
        :caller="caller"
        :current-stepper-value="currentStepperValue"
        :task-dropdown-items="taskDropdownItems"
        :current-task-index="currentTaskIndex"
        :test="test"
        :t="t"
        :go-to-step="goToStep"
        :go-to-specific-task="goToSpecificTask"
        :completed-steps="completedSteps"
      />
    </VideoToolDrawer>

    <div
      v-if="showSidePanel || showStepperPanel"
      class="panel-overlay"
      @click="closePanels"
    ></div>
  </div>
</template>

<script setup>
import VideoToolDrawer from './VideoToolDrawer.vue'
import ToolsPanel from './ToolsPanel.vue'
import TestProgressPanel from './TestProgressPanel.vue'

defineProps({
  showSidePanel: Boolean,
  showStepperPanel: Boolean,
  caller: Boolean,
  isObservator: Boolean,
  staffList: { type: Array, default: () => [] },
  participantList: { type: Array, default: () => [] },
  currentStepperValue: Number,
  taskDropdownItems: { type: Array, default: () => [] },
  currentTaskIndex: Number,
  test: Object,
  t: Function,
  toggleSidePanel: Function,
  toggleStepperPanel: Function,
  closePanels: Function,
  goToStep: Function,
  goToSpecificTask: Function,
  completedSteps: {
    type: Object,
    default: () => ({
      consent: false,
      preTest: false,
      tasks: false,
      postTest: false,
      completion: false,
    }),
  },
})
</script>

<style scoped src="./videoCallShared.css"></style>
