<template>
  <div />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

const store = useStore()
const toast = useToast()

// Reactive state for tracking previous error
const previousErrorMessage = ref('')
const previousErrorCode = ref('')

// Computed property for error state from Vuex
const error = computed(() => store.state.error)

// Watch for error changes
watch(
  error,
  (newError) => {
    if (
      newError &&
      (newError.message || newError.errorCode) &&
      (newError.message !== previousErrorMessage.value ||
        newError.errorCode !== previousErrorCode.value)
    ) {
      toast.error(`${newError.errorCode}: ${newError.message}`)
      previousErrorMessage.value = newError.message
      previousErrorCode.value = newError.errorCode
      store.commit('clearError')
    }
  },
  {
    immediate: true,
    deep: true,
  }
)
</script>