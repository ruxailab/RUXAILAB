<template>
  <div />
</template>

<script setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { showSuccess, showError, showInfo, showWarning, showToast } from '../../../shared/utils/toast';

const store = useStore()

const toastMessage = computed(() => store.state.toastMessage)
const toastType = computed(() => store.state.toastType)

const toastHelpers = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  default: showToast,
}

watch(
  [toastMessage, toastType],
  ([message, type]) => {
    if (message) {
      const helper = toastHelpers[type] || showToast
      helper(message)
      store.commit('RESET_TOAST')
    }
  },
  { immediate: true }
)
</script>