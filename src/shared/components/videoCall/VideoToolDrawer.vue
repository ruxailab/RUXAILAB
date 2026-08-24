<template>
  <v-navigation-drawer
    v-if="modelValue"
    location="right"
    width="400"
    elevation="3"
    class="video-tool-drawer"
  >
    <div class="video-tool-header d-flex align-center justify-space-between">
      <h3>{{ title }}</h3>
      <slot name="header-actions" />
      <v-btn
        icon
        size="small"
        variant="text"
        class="close-btn"
        :aria-label="closeLabel"
        @click.stop="close"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <slot />
  </v-navigation-drawer>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    required: true,
  },
  closeLabel: {
    type: String,
    default: 'Close panel',
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped src="./videoCallShared.css"></style>
