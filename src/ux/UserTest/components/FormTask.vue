<template>
  <v-stepper
    v-model="step"
    class="pa-sm-6"
    non-linear
  >
    <v-stepper-header>
      <v-stepper-item
        :complete="step > 1"
        :step="1"
        value="1"
        editable
        title="Basic Info"
        @click="step = '1'"
      />
      <v-divider />
      <v-stepper-item
        :complete="step > 2"
        :step="2"
        value="2"
        editable
        title="Configuration"
        @click="step = '2'"
      />
      <v-divider />
      <v-stepper-item
        :complete="step > 3"
        :step="3"
        value="3"
        editable
        title="Advanced"
        @click="step = '3'"
      />
      <v-divider />
      <v-stepper-item
        :complete="step > 4"
        :step="4"
        value="4"
        editable
        title="Preview"
        @click="step = '4'"
      />
    </v-stepper-header>

    <!-- Content Area with v-if for forced re-rendering -->
    <div class="stepper-content">
      <v-card-text v-show="step === '1'">
        <TaskBasicInfo
          ref="taskBasicInfoRef"
          :model-value="localTask"
          :validation-rules="requiredRule"
          @update:model-value="handleTaskUpdate"
        />
      </v-card-text>

      <v-card-text v-if="step === '2'">
        <TaskConfiguration
          :model-value="localTask"
          :select-items="selectItems"
          :validation-rules="requiredRule"
          @update:model-value="handleTaskUpdate"
        />
      </v-card-text>

      <v-card-text v-if="step === '3'">
        <TaskAdvancedOptions
          :model-value="localTask"
          @update:model-value="handleTaskUpdate"
        />
      </v-card-text>

      <v-card-text v-if="step === '4'">
        <TaskPreview :task="localTask" />
      </v-card-text>
    </div>

    <v-stepper-actions
      @click:prev="goToPreviousStep"
      @click:next="goToNextStep"
    />
  </v-stepper>
</template>

<script setup>
import { ref } from 'vue';
import TaskBasicInfo from './task-steps/TaskBasicInfo.vue';
import TaskConfiguration from './task-steps/TaskConfiguration.vue';
import TaskAdvancedOptions from './task-steps/TaskAdvancedOptions.vue';
import TaskPreview from './task-steps/TaskPreview.vue';
import Task from '../models/Task';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const taskBasicInfoRef = ref(null);

const emit = defineEmits(['validate', 'update:task', 'complete']);

const step = ref("1");
const localTask = ref({ ...props.task });

// Required props for the step components
const selectItems = [
  { label: 'No Answer', value: 'no-answer' },
  { label: 'Short Answer', value: 'post-test' },
  { label: 'Paragraph Answer', value: 'text-area' },

  { label: 'Google Forms Link', value: 'post-form' },
  { label: 'NASA TLX', value: 'nasa-tlx' },
  { label: 'System Usability Scale', value: 'sus' },
  { label: 'Situation Awareness Rating Technique', value: 'sart' }
];

const requiredRule = [(v) => !!v || 'Field Required'];

const handleTaskUpdate = (updatedTask) => {
  localTask.value = Task.fromJson({ ...updatedTask });
  emit('update:task', localTask.value);
};

const goToNextStep = () => {
  const currentStepNum = parseInt(step.value);
  if (currentStepNum < 4) {
    step.value = String(currentStepNum + 1);
  }
};

const goToPreviousStep = () => {
  const currentStepNum = parseInt(step.value);
  if (currentStepNum > 1) {
    step.value = String(currentStepNum - 1);
  }
};

const valida = () => {
  const descOk = taskBasicInfoRef.value?.checkDescriptionValidation();
  const nameOk = taskBasicInfoRef.value?.checkTaskNameValidation();

  // trigger visual validator for task name
  taskBasicInfoRef.value?.isValid?.value;

  if (nameOk && descOk) {
    emit('validate', localTask.value);
    return true;
  }

  return false;
};

const resetVal = () => {
  step.value = "1";
  localTask.value = { ...props.task };
};

defineExpose({ valida, resetVal });
</script>

<style scoped>
.stepper-content {
  min-height: 400px;
  padding: 16px;
}

@media (max-width: 600px) {
  .stepper-content {
    padding: 0;
  }
}
</style>
