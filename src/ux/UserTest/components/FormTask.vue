<template>
  <v-stepper v-model="step" class="pa-sm-6" non-linear>
    <v-stepper-header>
      <v-stepper-item
        :complete="step > 1"
        :step="1"
        value="1"
        editable
        :title="$t('CreateTask.stepper.basicInfo')"
        @click="step = '1'"
      />
      <v-divider />
      <v-stepper-item
        :complete="step > 2"
        :step="2"
        value="2"
        editable
        :title="$t('CreateTask.stepper.configuration')"
        @click="step = '2'"
      />
      <v-divider />
      <v-stepper-item
        :complete="step > 3"
        :step="3"
        value="3"
        editable
        :title="$t('CreateTask.stepper.advanced')"
        @click="step = '3'"
      />
      <v-divider />
      <v-stepper-item
        :complete="step > 4"
        :step="4"
        value="4"
        editable
        :title="$t('CreateTask.stepper.preview')"
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
      :prev-text="$t('buttons.previous')"
      :next-text="$t('buttons.next')"
      @click:prev="goToPreviousStep"
      @click:next="goToNextStep"
    />
  </v-stepper>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskBasicInfo from './task-steps/TaskBasicInfo.vue'
import TaskConfiguration from './task-steps/TaskConfiguration.vue'
import TaskAdvancedOptions from './task-steps/TaskAdvancedOptions.vue'
import TaskPreview from './task-steps/TaskPreview.vue'
import Task from '../models/Task'

const { t } = useI18n()

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const taskBasicInfoRef = ref(null)

const emit = defineEmits(['validate', 'update:task', 'complete'])

const step = ref('1')
const localTask = ref({ ...props.task })

// Required props for the step components - using computed for i18n reactivity
const selectItems = computed(() => [
  { label: t('CreateTask.selectItems.noAnswer'), value: 'no-answer' },
  { label: t('CreateTask.selectItems.shortAnswer'), value: 'post-test' },
  { label: t('CreateTask.selectItems.paragraphAnswer'), value: 'text-area' },
  { label: t('CreateTask.selectItems.googleFormsLink'), value: 'post-form' },
  { label: t('CreateTask.selectItems.nasaTlx'), value: 'nasa-tlx' },
  { label: t('CreateTask.selectItems.sus'), value: 'sus' },
  { label: t('CreateTask.selectItems.tam1'), value: 'tam-1' },
  { label: t('CreateTask.selectItems.tam2'), value: 'tam-2' },
  { label: t('CreateTask.selectItems.tam3'), value: 'tam-3' },
  { label: t('CreateTask.selectItems.sart'), value: 'sart' },
])

const requiredRule = computed(() => [
  (v) => !!v || t('CreateTask.validation.fieldRequired'),
])

const handleTaskUpdate = (updatedTask) => {
  localTask.value = Task.fromJson({ ...updatedTask })
  emit('update:task', localTask.value)
}

const goToNextStep = () => {
  const currentStepNum = Number.parseInt(step.value, 10)
  if (currentStepNum < 4) {
    step.value = String(currentStepNum + 1)
  }
}

const goToPreviousStep = () => {
  const currentStepNum = Number.parseInt(step.value, 10)
  if (currentStepNum > 1) {
    step.value = String(currentStepNum - 1)
  }
}

const valida = () => {
  const descOk = taskBasicInfoRef.value?.checkDescriptionValidation()
  const nameOk = taskBasicInfoRef.value?.checkTaskNameValidation()

  // trigger visual validator for task name
  const _ = taskBasicInfoRef.value?.isValid?.value // eslint-disable-line no-unused-vars

  if (nameOk && descOk) {
    emit('validate', localTask.value)
    return true
  }

  return false
}

const resetVal = () => {
  step.value = '1'
  localTask.value = { ...props.task }
}

defineExpose({ valida, resetVal })
</script>

<style scoped>
.stepper-content {
  min-height: 400px;
  padding: 16px;
}
</style>
