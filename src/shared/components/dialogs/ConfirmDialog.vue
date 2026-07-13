<template>
  <v-dialog
    :model-value="show"
    max-width="500"
    persistent
    @update:model-value="$emit('update:show', $event)"
  >
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-start ga-4 pa-6 pb-0">
        <div
          :class="[
            'dialog-icon rounded-lg d-flex align-center justify-center',
            iconBackgroundClass,
          ]"
        >
          <v-icon :color="iconColor" size="28">{{ icon }}</v-icon>
        </div>
        <div>
          <h3 class="text-h5 font-weight-bold text-grey-darken-4 mb-1">
            {{ title }}
          </h3>
          <p
            v-if="subtitle"
            class="text-subtitle-2 text-grey-darken-1 dialog-subtitle"
          >
            {{ subtitle }}
          </p>
        </div>
      </v-card-title>
      <v-card-text class="py-4 px-6">
        <p class="text-body-2 text-grey-darken-1">
          {{ message }}
        </p>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0 d-flex justify-end ga-3">
        <!-- Optional third action -->
        <v-btn
          v-if="thirdText"
          variant="text"
          color="primary"
          :disabled="loading"
          class="text-none rounded-lg px-6"
          height="44"
          @click="handleThird"
        >
          <v-icon v-if="thirdIcon" start size="16">
            {{ thirdIcon }}
          </v-icon>

          {{ thirdText }}
        </v-btn>
        <!----->
        <v-btn
          variant="outlined"
          color="grey-darken-2"
          :disabled="loading"
          class="text-none rounded-lg px-6"
          height="44"
          @click="handleCancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          :loading="loading"
          class="text-none rounded-lg px-6"
          height="44"
          @click="handleConfirm"
        >
          <v-icon v-if="confirmIcon" start size="16">{{ confirmIcon }}</v-icon>
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
  thirdText: {
    type: String,
    default: '',
  },
  thirdIcon: {
    type: String,
    default: '',
  },
  confirmColor: {
    type: String,
    default: 'primary',
  },
  confirmIcon: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'mdi-alert-circle-outline',
  },
  iconColor: {
    type: String,
    default: 'warning',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['warning', 'error', 'info'].includes(value),
  },
})

const emit = defineEmits(['update:show', 'confirm', 'cancel', 'third'])

const iconBackgroundClass = computed(() => {
  const classes = {
    warning: 'bg-amber-lighten-5',
    error: 'bg-red-lighten-5',
    info: 'bg-blue-lighten-5',
  }
  return classes[props.type] || classes.warning
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('update:show', false)
  emit('cancel')
}

const handleThird = () => {
  emit('third')
}
</script>

<style scoped>
.dialog-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
}

.dialog-subtitle {
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}
</style>
