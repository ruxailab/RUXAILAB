<template>
  <div>
    <v-col>
      <v-row>
        <v-tooltip
          v-if="!recordingAudio"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              elevation="0"
              icon
              class="ml-4 my-2 mr-auto"
              v-bind="props"
              @click="startAudioRecording"
            >
              <v-icon>mdi-microphone</v-icon>
            </v-btn>
          </template>
          <span>Start Audio Record</span>
        </v-tooltip>
        <v-tooltip
          v-if="recordingAudio"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              color="red"
              elevation="0"
              icon
              class="ml-4 my-2 mr-auto xl"
              v-bind="props"
              @click="stopAudioRecording"
            >
              <v-icon>mdi-stop</v-icon>
            </v-btn>
          </template>
          <span>Stop Audio Record</span>
        </v-tooltip>
      </v-row>
    </v-col>
  </div>
</template>

<script>
import i18n from '@/i18n'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  props: {
    testId: {
      type: String,
      default: '',
    },
    taskIndex: {
      type: Number,
      default: 0,
    },
    showVisualizer: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['recordingStarted', 'showLoading', 'stopShowLoading'],
  data() {
    return {
      recordingAudio: false,
      recordedChunks: [],
      mediaRecorder: null,
      audioStream: null,
      recordedAudio: '',
    }
  },
  computed: {
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer
    },
  },
  methods: {
    async startAudioRecording() {
      this.recordingAudio = true
      this.$emit('recordingStarted', true)
      
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
          this.$emit('showLoading')
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

          this.audioStream.getTracks().forEach((track) => track.stop())
          this.audioStream = null
          this.recordingAudio = false
          this.$emit('recordingStarted', false)
          this.$emit('stopShowLoading')
          this.$toast.success(i18n.$t('alerts.genericSuccess'))
          this.recordingAudio = false
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
      }
    },
  },
}
</script>