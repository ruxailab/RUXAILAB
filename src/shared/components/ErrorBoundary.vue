<template>
  <slot v-if="!hasError" />
  <ErrorFallback
    v-else
    :error="error"
    :error-info="errorInfo"
    :error-route="errorRoute"
    :error-component="errorComponent"
    :error-timestamp="errorTimestamp"
    @retry="handleRetry"
  />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRoute } from 'vue-router'
import ErrorFallback from './ErrorFallback.vue'

const hasError = ref(false)
const error = ref(null)
const errorInfo = ref('')
const errorRoute = ref('')
const errorComponent = ref('')
const errorTimestamp = ref('')

const route = useRoute()

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  error.value = err
  errorInfo.value = info || 'unknown'
  errorRoute.value = route?.fullPath || 'unknown'
  errorComponent.value = instance?.$options?.name || 'Anonymous'
  errorTimestamp.value = new Date().toISOString()

  console.error('[ErrorBoundary] Caught error:', {
    message: err.message,
    stack: err.stack,
    route: route?.fullPath,
    component: instance?.$options?.name || 'Anonymous',
    info,
    timestamp: new Date().toISOString(),
  })

  // Prevent the error from propagating further
  return false
})

function handleRetry() {
  hasError.value = false
  error.value = null
  errorInfo.value = ''
  errorRoute.value = ''
  errorComponent.value = ''
  errorTimestamp.value = ''
}
</script>
