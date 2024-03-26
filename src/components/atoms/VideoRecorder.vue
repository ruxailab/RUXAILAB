<template>
  <div>
    <video
      v-if="recording"
      ref="video"
      class="web-cam mb-2 ml-3"
      height="100"
      autoplay
    />
    <v-btn
      v-if="!recording && recordedVideo == ''"
      class="ml-4 mb-2 xl"
      color="grey lighten-2"
      elevation="0"
      @click="startRecording"
    >
      <v-icon class="mr-2">
        mdi-camera
      </v-icon>
      Start Recording
    </v-btn>
    <v-btn v-if="recording" color="red" icon @click="stopRecording">
      <v-icon dark>
        mdi-stop
      </v-icon>
    </v-btn>
  </div>
</template>

<script>
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
export default {
  props: {
    testId: {
      type: String,
      default: null,
    },
    currentUserTestAnswer: {
      type: Object,
      default: null,
    },
    taskIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      recording: false,
      videoStream: null,
      recordedChunks: [],
      mediaRecorder: null,
      recordedVideo: '',
    }
  },
  methods: {
    async startRecording() {
      this.recording = true
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })
      this.$refs.video.srcObject = this.videoStream

      this.recordedChunks = []
      this.mediaRecorder = new MediaRecorder(this.videoStream)

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(this.recordedChunks, {
          type: 'video/webm',
        })
        const storage = getStorage()
        const storageRef = ref(
          storage,
          `tests/${this.testId}/${this.currentUserTestAnswer.userDocId}/task_${this.taskIndex}/video/${this.recordedVideo}`,
        )
        await uploadBytes(storageRef, videoBlob)

        this.recordedVideo = await getDownloadURL(storageRef)

        this.currentUserTestAnswer.tasks[
          this.taskIndex
        ].webcamRecordURL = this.recordedVideo

        console.log(
          this.currentUserTestAnswer.tasks[this.taskIndex].webcamRecordURL,
        )
      }

      this.mediaRecorder.start()
    },
    stopRecording() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop()
        this.videoStream.getTracks().forEach((track) => track.stop())
        this.recording = false
      }
    },
  },
}
</script>

<style scoped>
.web-cam {
  position: relative;
  text-align: center;
  height: 125px;
  width: 125px;
  border-radius: 50%;
  overflow: hidden;
  mask-image: radial-gradient(circle, white 100%, black 100%);
}
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
