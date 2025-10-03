<template>
  <v-stepper
    alt-labels
    :model-value="currentStep"
    class="elevation-0 bg-transparent"
  >
    <v-stepper-header class="elevation-0">
      <template
        v-for="(step, index) in steps"
        :key="step.value"
      >
        <v-stepper-item
          :complete="step.complete"
          :value="step.value"
          :title="step.title"
          :color="step.complete ? 'success' : step.value === currentStep ? 'primary' : ''"
        />
        <v-divider v-if="index < steps.length - 1" />
      </template>
    </v-stepper-header>
  </v-stepper>
</template>

<script setup>
defineProps({
  steps: Array,
  currentStep: Number
})
</script>