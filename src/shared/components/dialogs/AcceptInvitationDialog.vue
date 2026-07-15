<template>
  <ConfirmDialog
    :show="modelValue"
    :title="$t('invite.pendingTitle')"
    :subtitle="$t('invite.pendingSubtitle')"
    :message="message || $t('acceptInvitation.message')"
    :confirm-text="submitLabel || $t('acceptInvitation.accept')"
    :cancel-text="cancelLabel || $t('acceptInvitation.reject')"
    confirm-color="primary"
    confirm-icon="mdi-check"
    icon="mdi-email-outline"
    icon-color="primary"
    type="info"
    :loading="loading"
    :third-text="$t('invite.notNow')"
    @update:show="$emit('update:modelValue', $event)"
    @confirm="$emit('submit')"
    @cancel="$emit('cancel')"
    @third="$emit('update:modelValue', false)"
  />
</template>

<script setup>
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  cancelLabel: {
    type: String,
    default: '',
  },
  submitLabel: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue', 'cancel', 'submit'])
</script>
