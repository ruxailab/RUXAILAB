<template>
  <div />
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'

const props = defineProps({
  taskIndex: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['timerStopped'])

const timerRunning = ref(false)
const timerVisible = ref(false)
const startTime = ref(null)
const elapsedTime = ref(0)
let timerInterval = null // Non-reactive interval reference

const startTimer = () => {
  startTime.value = new Date()
  timerInterval = setInterval(() => {
    elapsedTime.value = new Date() - startTime.value
  }, 1000)
  timerRunning.value = true
}

const stopTimer = () => {
  clearInterval(timerInterval)
  timerRunning.value = false
  emit('timerStopped', elapsedTime.value, props.taskIndex)
}

const toggleTimer = () => {
  if (!timerVisible.value) {
    timerVisible.value = true
  } else {
    timerVisible.value = !timerVisible.value
  }
}

const formatTime = (time) => {
  const seconds = Math.floor(time / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

onBeforeMount(() => {
  startTimer()
})

defineExpose({
  startTimer,
  stopTimer
})
</script>