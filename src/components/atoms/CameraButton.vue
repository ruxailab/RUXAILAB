<template>
  <v-card>
    <v-row justify="center">
      <v-card-title class="Title">
        <v-icon left>
          mdi-camera
        </v-icon>Camera Record
      </v-card-title>
    </v-row>
    <v-row align="center">
      <v-col justify="center">
        <v-btn v-if="!isRunningCamera" color="green" @click="start()">
          <v-icon> mdi-camera </v-icon>
        </v-btn>
        <v-btn v-if="isRunningCamera" color="blue" @click="stop()">
          <v-icon> mdi-camera-off </v-icon>
        </v-btn>
      </v-col>
      <v-col v-if="media_recorder==null" justify="center">
        Please, click the button to record the video!
      </v-col>
      <v-col v-else justify="center">
        <video controls :src="media_recorder" />
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
    isRunningCamera: false,
    mediaStream: null,
    videoPlayer: null,
    recorder: null,
    media_recorder: null,
    blobs_recorded: []
  }),
  created() {
    this.device = navigator.mediaDevices.getUserMedia({ video: true })
  },
  methods: {
    async start() {
      this.isRunningCamera = true
      this.blobs_recorded = []
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
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
      this.isRunningCamera = false
      this.recorder.stop()
      this.recorder = null
    },

    }
}
</script>
