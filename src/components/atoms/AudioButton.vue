<template>
  <v-card>
    <v-row justify="center">
      <v-card-title class="Title">
        <v-icon left>
          mdi-volume-high
        </v-icon>Audio Record
      </v-card-title>
    </v-row>
    <v-row align="center">
      <v-col justify="center">
        <v-btn v-if="!isRunningAudio" color="green" @click="startRecording()">
          <v-icon> mdi-microphone </v-icon>
        </v-btn>
        <v-btn v-if="isRunningAudio" color="blue" @click="stop()">
          <v-icon> mdi-microphone-off </v-icon>
        </v-btn>
      </v-col>
      <v-col justify="center">
        <audio controls :src="recordedAudio" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
      default: function() {
        return {
          taskName: "",
          taskTip: ""
        }
      }
    }
  },
  data: () => ({
    dialog: false,
    isRunningAudio: false,
    recorder: null,
    recordedChunks: [],
    recordedAudio: null,
  }),
  methods: {
    startRecording() {
      this.isRunningAudio = true
      this.recordedChunks = []
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.recorder = new MediaRecorder(stream)
        this.recorder.addEventListener("dataavailable", (event) => {
          this.recordedChunks.push(event.data)
        })
        this.recorder.addEventListener("stop", () => {
          const audioBlob = new Blob(this.recordedChunks, { type: "audio/webm" })
          this.recordedAudio = URL.createObjectURL(audioBlob)
        })
        this.recorder.start()
      })
    },
    stop() {
      this.isRunningAudio = false
      this.recorder.stop()
      this.recorder = null
    },
  }
}
</script>

<style>
  .Title {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  color: #000000;
}

</style>
