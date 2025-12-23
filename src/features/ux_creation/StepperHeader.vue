<template>
  <v-stepper
    alt-labels
    :model-value="currentStep"
    class="elevation-0 bg-transparent mb-6 mb-sm-8 stepper-custom"
  >
    <v-stepper-header class="elevation-0">
      <template
        v-for="(step, index) in steps"
        :key="step.value"
      >
        <v-stepper-item
          :complete="step.complete"
          :value="step.value"
          :editable="step.value <= currentStep"
          :color="step.value === currentStep ? 'primary' : 'grey-lighten-1'"
          class="stepper-item-custom"
        >
          <!-- Custom icon with number -->
          <template #icon="{ complete }">
            <v-avatar
              :size="mobile ? 32 : 40"
              :color="getStepColor(step)"
              class="transition-all"
            >
              <v-icon
                v-if="complete"
                :size="mobile ? 16 : 20"
                color="white"
              >
                mdi-check
              </v-icon>
              <span
                v-else
                class="text-white font-weight-medium"
                :class="mobile ? 'text-body-2' : 'text-body-1'"
              >
                {{ step.value }}
              </span>
            </v-avatar>
          </template>

          <template #title>
            <span class="font-weight-medium">
              {{ step.title }}
            </span>
          </template>
        </v-stepper-item>
        <v-divider v-if="index < steps.length - 1" />
      </template>
    </v-stepper-header>
  </v-stepper>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  steps: Array,
  currentStep: Number
})

const mobile = computed(() => window.innerWidth < 600)

const getStepColor = (step) => {
  if (step.complete) return 'success'
  if (step.value === props.currentStep) return 'primary'
  return 'grey-lighten-1'
}
</script>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}
.stepper-custom :deep(.v-stepper-item--selected .v-avatar) {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}
@media (max-width: 600px) {
  .stepper-custom :deep(.v-stepper-item__title) {
    display: none !important;
  }
}
.stepper-custom :deep(.v-stepper-item) {
  min-width: 80px;
}
.stepper-custom :deep(.v-stepper-item__title) {
  margin-top: 8px;
}
</style>