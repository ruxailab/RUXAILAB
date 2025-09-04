<template>
  <div />
</template>

<script setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

const store = useStore()
const toast = useToast()

const toastMessage = computed(() => store.state.toastMessage)
const toastType = computed(() => store.state.toastType)

watch(
  [toastMessage, toastType],
  ([message, type]) => {
    if (message) {
      switch (type) {
        case 'error':
          toast.error(message)
          break
        case 'success':
          toast.success(message)
          break
        case 'info':
          toast.info(message)
          break
        case 'warning':
          toast.warning(message)
          break
        default:
          toast(message)
      }
      store.commit('RESET_TOAST')
    }
  },
  { immediate: true }
)
</script>
