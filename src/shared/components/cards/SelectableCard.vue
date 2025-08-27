<template>
  <v-card
    :variant="selected ? 'tonal' : 'flat'"
    :color="selected ? 'primary' : undefined"
    :disabled="disabled"
    class="h-100 cursor-pointer transition-all position-relative custom-card"
    hover
    elevation="4"
    @click="handleClick"
  >
    <v-chip
      v-if="badge"
      :color="badge.color"
      variant="flat"
      size="small"
      class="position-absolute"
      style="top: 16px; right: 16px; z-index: 1;"
    >
      {{ badge.text }}
    </v-chip>

    <v-card-text :class="textClass">
      <v-avatar
        :color="color"
        :size="avatarSize"
        class="mb-4"
      >
        <v-icon
          :icon="icon"
          size="32"
          color="white"
        />
      </v-avatar>

      <h3 class="text-h5 font-weight-medium mb-3">
        {{ title }}
      </h3>
      <p class="text-body-1 text-grey-darken-1 mb-4">
        {{ description }}
      </p>

      <slot name="extra" />
    </v-card-text>

    <v-icon
      v-if="selected"
      icon="mdi-check-circle"
      color="primary"
      size="large"
      class="position-absolute"
      style="bottom: 16px; right: 16px;"
    />
  </v-card>
</template>

<script setup>
const props = defineProps({
  selected: Boolean,
  icon: String,
  title: String,
  description: String,
  color: String,
  badge: Object,
  avatarSize: {
    type: [String, Number],
    default: 64
  },
  disabled: Boolean,
  textClass: {
    type: String,
    default: 'pa-8 text-center',
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (!props.disabled) emit('click')
}
</script>

<style scoped>
.custom-card {
  border-radius: 20px !important;
  border: 2px solid transparent !important;
  &:hover:not(.v-card--disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    border-color: #2196F3 !important;
  }
}
</style>