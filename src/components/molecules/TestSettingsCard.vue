<template>
  <v-card :class="cardClass" elevation="0">
    <div class="d-flex align-start ga-3 pa-6 pb-0">
      <div class="header-icon rounded-lg d-flex align-center justify-center" :class="iconBgClass">
        <v-icon :color="iconColor" size="20">{{ icon }}</v-icon>
      </div>
      <div>
        <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">{{ title }}</h3>
        <p class="text-caption text-grey-darken-1">{{ subtitle }}</p>
      </div>
    </div>
    <v-card-text class="py-6">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  iconBgClass: {
    type: String,
    default: 'bg-grey-lighten-4'
  },
  cardClass: {
    type: String,
    default: 'settings-card'
  }
})
</script>

<style scoped>
.settings-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.settings-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-icon {
  width: 40px;
  height: 40px;
}
</style>
