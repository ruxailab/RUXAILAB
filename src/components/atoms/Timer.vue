<template>
  <div class="mr-auto ml-8 mt-3">
    <v-row>
      <v-icon class="mr-2 my-4" style="cursor: pointer" @click="toggleTimer">
        {{ timerRunning ? 'mdi-clock' : 'mdi-clock-outline' }}
      </v-icon>
      <p v-if="timerVisible" class="font-weight-bold mr-2 my-5">
        {{ formatTime(elapsedTime) }}
      </p>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    taskIndex: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      timerRunning: false,
      timerVisible: false,
      startTime: null,
      elapsedTime: 0,
    }
  },
  beforeMount() {
    this.startTimer()
  },
  methods: {
    startTimer() {
      this.startTime = new Date()
      this.timerInterval = setInterval(() => {
        this.elapsedTime = new Date() - this.startTime
      }, 1000)
    },
    stopTimer() {
      clearInterval(this.timerInterval)
      this.timerRunning = false
      this.$emit('timerStopped', this.elapsedTime, this.taskIndex)
    },
    toggleTimer() {
      if (!this.timerVisible) {
        this.timerVisible = true
      } else {
        this.timerVisible = !this.timerVisible
      }
    },
    formatTime(time) {
      const seconds = Math.floor(time / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
    },
  },
}
</script>
