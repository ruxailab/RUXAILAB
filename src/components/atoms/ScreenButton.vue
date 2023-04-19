<template>
  <v-card>
    <v-row justify="center">
      <v-card-title class="Title">
        <v-icon left>
          mdi-laptop
        </v-icon>Screen Record
      </v-card-title>
    </v-row>
    <v-row align="center">
      <v-col justify="center">
        <v-btn v-if="!isRunningScreen" color="green" @click="start()">
          <v-icon> mdi-camcorder </v-icon>
        </v-btn>
        <v-btn v-if="isRunningScreen" color="blue" @click="stop()">
          <v-icon> mdi-camcorder-off </v-icon>
        </v-btn>
      </v-col>
      <v-col v-if="media_recorder == null" justify="center">
        Please, click the button to start screen recording!
      </v-col>
      <v-col v-else justify="center">
        <video controls :src="media_recorder" style="width: 360px" />
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
    isRunningScreen: false,
    recorder: null,
    media_recorder: null,
    blobs_recorded: []
  }),
  methods: {
    async start() {
      this.isRunningScreen = true
      this.blobs_recorded = []
      navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: "screen" } }).then((stream) => {
        this.recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
        this.recorder.addEventListener("dataavailable", (event) => {
          this.blobs_recorded.push(event.data)
        })
        this.recorder.addEventListener("stop", () => {
          const videoBlob = new Blob(this.blobs_recorded, { type: "video/webm" })
          this.media_recorder = URL.createObjectURL(videoBlob)
        })
        this.recorder.start()
      })
    },
    stop() {
      this.isRunningScreen=false
      this.recorder.stop()
      this.recorder = null
    },

    }
}
</script>
