<template>
  <v-stepper-vertical
    v-if="xs"
    :model-value="currentStep"
    :mandatory="false"
    hide-actions
    non-linear
    class="elevation-0 bg-transparent"
    @update:model-value="onStepValueChange"
  >
    <v-stepper-vertical-item
      v-for="step in steps"
      :key="step.value"
      :title="step.title"
      :value="step.value"
      :editable="isStepEnabled(step) && step.value !== currentStep"
      :class="[
        'stepper-header__item',
        { 'stepper-header__item--disabled': !isStepEnabled(step) },
      ]"
      @click="onStepClick(step)"
    >
      <div />
    </v-stepper-vertical-item>
  </v-stepper-vertical>

  <v-stepper
    v-else
    alt-labels
    :model-value="currentStep"
    non-linear
    class="elevation-0 bg-transparent"
    @update:model-value="onStepValueChange"
  >
    <v-stepper-header class="elevation-0">
      <template v-for="(step, index) in steps" :key="step.value">
        <v-stepper-item
          :complete="step.complete"
          :value="step.value"
          :title="resolvedTitle(step)"
          :editable="isStepEnabled(step) && step.value !== currentStep"
          :color="
            step.complete
              ? 'success'
              : step.value === currentStep
                ? 'primary'
                : ''
          "
          :class="[
            'stepper-header__item',
            { 'stepper-header__item--disabled': !isStepEnabled(step) },
          ]"
          @click="onStepClick(step)"
        />
        <v-divider v-if="index < steps.length - 1" />
      </template>
    </v-stepper-header>
  </v-stepper>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const emit = defineEmits(['step-click'])

const props = defineProps({
  steps: Array,
  currentStep: Number,
})

const { xs } = useDisplay()

const resolvedTitle = (step) =>
  xs.value && step.value !== props.currentStep ? '' : step.title

const isStepEnabled = (step) => step?.enabled !== false

const onStepClick = (step) => {
  if (!step || !isStepEnabled(step) || step.value === props.currentStep) return
  emit('step-click', step)
}

const onStepValueChange = (value) => {
  const step = props.steps?.find((item) => item.value === value)
  if (!step || !isStepEnabled(step) || step.value === props.currentStep) return
  emit('step-click', step)
}
</script>

<style scoped>
.stepper-header__item {
  cursor: pointer;
}

.stepper-header__item--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
