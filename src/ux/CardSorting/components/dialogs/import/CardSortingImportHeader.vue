<template>
  <v-card-title class="d-flex align-start ga-4 pa-6 pb-2">
    <div
      class="import-icon rounded-lg d-flex align-center justify-center"
      :class="isCategory ? 'bg-primary-lighten' : 'bg-orange-lighten'"
    >
      <v-icon :color="isCategory ? 'primary' : 'orange-darken-1'" size="28">
        mdi-import
      </v-icon>
    </div>
    <div class="flex-grow-1">
      <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
        {{ title }}
      </h3>
      <p class="text-body-2 text-grey-darken-1 mb-0">
        {{ hint }}
      </p>
    </div>
    <v-btn
      icon
      variant="text"
      size="small"
      color="grey-darken-1"
      @click="$emit('close')"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-card-title>
</template>

<script setup>
defineProps({
  isCategory: Boolean,
  title: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
    required: true,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.import-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
}

.bg-primary-lighten {
  background: rgba(var(--v-theme-primary), 0.12);
}

.bg-orange-lighten {
  background: rgba(255, 152, 0, 0.14);
}
</style>
