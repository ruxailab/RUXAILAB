<template>
  <div>
    <v-col>
      <v-row>
        <v-tooltip bottom v-if="!isCapture">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              @click="captureScreen"
              class="ml-4 my-2 mr-auto"
              elevation="0"
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-monitor-screenshot</v-icon>
            </v-btn>
          </template>
          <span>Capture Screen</span>
        </v-tooltip>
        <v-tooltip bottom v-if="isCapture">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              @click="recordScreen"
              class="ml-4 my-2 mr-auto"
              :color="!isRecording ? 'grey-darken-1' : 'red lighten-1'"
              :dark="isRecording"
              elevation="0"
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>{{
                isRecording ? 'mdi-stop' : 'mdi-monitor-screenshot'
              }}</v-icon>
            </v-btn>
          </template>
          <span>{{ isRecording ? 'Stop Recording' : 'Record Screen' }}</span>
        </v-tooltip>
      </v-row>
    </v-col>
  </div>
</template>

<script>
import Vue from 'vue'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
export default {
  props: {
    testId: String,
    taskIndex: Number,
  },
  data() {
    return {
      isCapture: false,
      isRecording: false,
      videoUrl: '',
      videoStream: null,
      mediaRecorder: null,
      chunks: [],
    }
  },
  computed: {
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer
    },
  },
  methods: {
    async captureScreen() {
      try {
        this.videoStream = await navigator.mediaDevices.getDisplayMedia({
          cursor: true,
        })
        this.isCapture = true
        this.recordScreen()
      } catch (err) {
        console.error(err)
      }
    },
    recordScreen() {
      if (!this.isRecording) {
        this.mediaRecorder = new MediaRecorder(this.videoStream)
        this.mediaRecorder.start()
        this.mediaRecorder.ondataavailable = (e) => {
          this.chunks.push(e.data)
        }

        this.mediaRecorder.onstop = async () => {
          this.$emit('showLoading')
          const videoBlob = new Blob(this.chunks, { type: 'video/webm' })
          const storage = getStorage()
          const storageRef = ref(
            storage,
            `tests/${this.testId}/${this.currentUserTestAnswer.userDocId}/task_${this.taskIndex}/screen_record/${this.videoUrl}`,
          )
          await uploadBytes(storageRef, videoBlob)

          this.videoUrl = await getDownloadURL(storageRef)

          this.currentUserTestAnswer.tasks[
            this.taskIndex
          ].screenRecordURL = this.videoUrl
          this.videoStream = null
          this.isRecording = false
          this.$emit('stopShowLoading')
          Vue.$toast.success('Screen record saved!')
        }
        this.isRecording = true
      } else {
        this.mediaRecorder.stop()
        this.videoStream.getTracks().forEach((track) => track.stop())
        this.isRecording = false
      }
    },
  },
}
</script>

<style scoped></style>
