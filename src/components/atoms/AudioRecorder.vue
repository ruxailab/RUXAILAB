<template>
  <div>
    <v-col>
      <v-row>
        <v-btn
          v-if="!recordingAudio && recordedAudio == ''"
          @click="startAudioRecording"
          class="ml-4 mb-2 xl"
          color="grey lighten-2"
          elevation="0"
        >
          <v-icon class="mr-2">mdi-microphone</v-icon>Start Recording
        </v-btn>
        <v-btn
          dark
          color="red"
          class="ml-4 mb-2 xl"
          v-if="recordingAudio"
          @click="stopAudioRecording"
        >
          <v-icon left>mdi-stop</v-icon> Stop Recording
        </v-btn>
      </v-row>
    </v-col>
  </div>
</template>

<script>
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
export default {
  props: {
    testId: String,
    currentUserTestAnswer: Object,
    taskIndex: Number,
  },
  data() {
    return {
      recordingAudio: false,
      recordedChunks: [],
      mediaRecorder: null,
      audioStream: null,
      recordedAudio: '',
    }
  },
  methods: {
    async startAudioRecording() {
      this.recordingAudio = true

      try {
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

        this.recordedChunks = []
        this.mediaRecorder = new MediaRecorder(this.audioStream, {
          mimeType: 'audio/webm',
        })

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data)
          }
        }

        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.recordedChunks, {
            type: 'audio/webm',
          })
          const storage = getStorage()
          const storageRef = ref(
            storage,
            'tests/' +
              this.testId +
              '/' +
              this.currentUserTestAnswer.userDocId +
              '/' +
              'task_' +
              this.taskIndex +
              'audio' +
              '/' +
              this.recordedAudio,
          )
          await uploadBytes(storageRef, audioBlob)

          this.recordedAudio = await getDownloadURL(storageRef)

          this.currentUserTestAnswer.tasks[
            this.taskIndex
          ].audioRecordURL = this.recordedAudio

          console.log(
            this.currentUserTestAnswer.tasks[this.taskIndex].audioRecordURL,
          )
        }

        this.mediaRecorder.start()
      } catch (error) {
        console.error('Error accessing audio stream:', error)
        this.recordingAudio = false
      }
    },
    stopAudioRecording() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop()
        this.audioStream.getTracks().forEach((track) => track.stop())
        this.recordingAudio = false
      }
    },
  },
}
</script>
