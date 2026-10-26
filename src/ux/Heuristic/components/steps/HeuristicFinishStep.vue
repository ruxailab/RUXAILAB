<template>
  <FinishStep
    :final-message="$t('finishTest.finalMessage')"
    :congratulations="$t('finishTest.congratulations')"
    :submit-message="$t('finishTest.submitMessage')"
    :submit-btn="$t('finishTest.submitButton')"
    @submit="$emit('submit')"
  />
</template>

<script setup>
import FinishStep from '@/ux/UserTest/components/steps/FinishStep.vue'

defineEmits(['submit'])
</script>
