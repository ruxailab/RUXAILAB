<template>
  <v-tooltip location="left">
    <template #activator="{ props }">
      <v-btn :disabled="disabled" size="large" icon class="mr-5 mb-5" position="fixed" location="bottom right"
        color="#F9A826" v-bind="props" @click="emit('click')">
        <v-icon size="large">
          mdi-email
        </v-icon>
      </v-btn>
    </template>
    <span>{{ $t('HeuristicsCooperators.actions.send_invitation') }}</span>
  </v-tooltip>
</template>

<script setup>
// Props
const props = defineProps({
  disabled: Boolean
})

// Emits
const emit = defineEmits(['click'])
</script>
