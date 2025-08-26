<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="rounded-xl">
      <v-card-title class="bg-error text-white text-h6 align-center">
        <v-icon start>
          mdi-alert-circle
        </v-icon>
        {{ title }}
      </v-card-title>
      <v-card-text class="pa-6 text-body-1">
        {{ message }}
      </v-card-text>
      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="$emit('cancel')"
        >
          {{ cancelLabel }}
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          @click="$emit('submit')"
        >
          {{ submitLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: {
      type: String,
      default: ''
  },
  message: {
      type: String,
      default: ''
  },
  cancelLabel: {
      type: String,
      default: 'Cancel'
  },
  submitLabel: {
      type: String,
      default: 'Submit'
  }
});

const emit = defineEmits(['update:modelValue', 'cancel', 'submit'])
</script>
