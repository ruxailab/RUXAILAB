<template>
  <div class="mr-auto ml-2">
    <v-row>
    <v-btn
      color="green"
      class="ml-4 mr-auto white--text"
      variant="tonal"
      @click="startTimer"
      v-if="!timerRunning"
    >
      <v-icon left> mdi-play </v-icon>
      Start
    </v-btn>
    <v-btn
      color="red"
      class="ml-4 mr-auto white--text"
      variant="tonal"
      @click="stopTimer"
      v-if="timerRunning"
    >
      <v-icon left> mdi-stop </v-icon>
      Stop</v-btn
    >
    <p class="font-weight-bold ml-3 mr-auto" style="margin-top: 7px">{{ formatTime(elapsedTime) }}</p>
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
      startTime: null,
      elapsedTime: 0,
    }
  },
  methods: {
    startTimer() {
      this.timerRunning = true
      this.startTime = new Date()

      this.timerInterval = setInterval(() => {
        this.elapsedTime = new Date() - this.startTime
      }, 1000)
    },
    stopTimer() {
      this.timerRunning = false
      clearInterval(this.timerInterval)

      this.$emit('timerStopped', this.elapsedTime, this.taskIndex)
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
