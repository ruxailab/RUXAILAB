<template>
  <div class="pa-5 border rounded-lg bg-grey-lighten-5" :class="{ 'position-relative': hasSwitch }">
    <div class="d-flex align-center ga-2 mb-3">
      <v-icon :color="iconColor" size="18">{{ icon }}</v-icon>
      <span class="font-weight-semibold text-subtitle-2 text-grey-darken-4">{{ title }}</span>
    </div>
    <p v-if="description" class="text-caption text-grey-darken-1 mb-4">{{ description }}</p>
    
    <!-- Switch Component -->
    <v-switch 
      v-if="hasSwitch" 
      :model-value="switchValue" 
      @update:model-value="$emit('update:switchValue', $event)"
      color="primary" 
      hide-details 
      inset 
      class="position-absolute"
      style="top: 20px; right: 20px;" 
    />
    
    <!-- Slot for custom content -->
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  hasSwitch: {
    type: Boolean,
    default: false
  },
  switchValue: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:switchValue'])
</script>

<style scoped>
.border {
  border: 1px solid #e5e7eb;
}

.bg-grey-lighten-5 {
  background-color: #f8f9fa;
}
</style>
