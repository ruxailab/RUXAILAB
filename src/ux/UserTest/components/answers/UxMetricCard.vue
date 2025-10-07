<template>
  <v-card :class="['pa-6', 'elevation-3', 'rounded-xl', 'h-100', 'ux-metric-card', { 'disabled-card': disabled }]">
    <div class="d-flex align-center mb-4 position-relative">
      <v-avatar
        :color="disabled ? 'grey-lighten-1' : color"
        size="56"
        class="me-4"
      >
        <v-icon
          color="white"
          size="28"
        >
          {{ icon }}
        </v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <div :class="['text-h4', 'font-weight-bold', disabled ? 'text-grey' : `text-${color}`]">
          <slot name="value">
            {{ value }}
          </slot>
        </div>
        <p :class="['text-body-1', 'font-weight-medium', 'mb-0', disabled ? 'text-grey-lighten-1' : '']">
          <slot name="label">
            {{ label }}
          </slot>
        </p>
      </div>
      <v-chip
        v-if="comingSoon || disabled"
        color="warning"
        size="small"
        variant="outlined"
        class="position-absolute coming-soon-chip"
        style="top: 8px; right: 8px; z-index: 1;"
      >
        {{ comingSoon ? comingSoonText : 'Coming Soon' }}
      </v-chip>
    </div>
    <p :class="['text-body-2', disabled ? 'text-grey-lighten-1' : 'text-medium-emphasis']">
      <slot name="description">
        {{ description }}
      </slot>
    </p>
    <v-progress-linear
      :model-value="progress"
      :color="disabled ? 'grey-lighten-2' : color"
      height="8"
      rounded
      class="mt-3"
    />
  </v-card>
</template>

<script setup>
const props = defineProps({
    value: { type: [String, Number], required: true },
    label: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, default: '' },
    progress: { type: Number, default: 0 },
    comingSoon: { type: Boolean, default: false },
    comingSoonText: { type: String, default: 'Coming Soon' },
    disabled: { type: Boolean, default: false },
});
</script>

<style scoped>
.disabled-card {
  position: relative;
  opacity: 0.6;
  filter: grayscale(0.3);
}

.disabled-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: inherit;
  z-index: 2;
  pointer-events: none;
}

.disabled-card:hover {
  transform: none !important;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08) !important;
}

.coming-soon-chip {
  z-index: 1 !important;
}

.disabled-card .position-relative {
  z-index: 3;
}
</style>
