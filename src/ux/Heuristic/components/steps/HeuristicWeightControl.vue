<template>
  <v-select
    class="weight-control"
    :model-value="validWeight(modelValue) ? modelValue : null"
    :items="weights"
    variant="outlined"
    color="primary"
    :label="$t('HeuristicsTestView.answer.weight')"
    :disabled="disabled"
    :error-messages="
      modelValue != null && !validWeight(modelValue)
        ? [$t('HeuristicsTestView.answer.invalidWeight')]
        : []
    "
    hide-details="auto"
    @update:model-value="selectWeight"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: null },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
const weights = Array.from({ length: 10 }, (_, index) => index + 1)
const validWeight = (value) =>
  Number.isInteger(value) && value >= 1 && value <= 10
const selectWeight = (value) => {
  if (!props.disabled && validWeight(value)) emit('update:modelValue', value)
}
</script>

<style scoped>
.weight-control {
  max-width: 440px;
}
.weight-control :deep(.v-field) {
  border-radius: 10px;
  background: #f8fbff;
}
</style>
