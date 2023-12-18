<template>
  <div>
    <v-col>
    <v-row>
      <v-btn
        @click="captureScreen"
        class="ml-4 mb-2 xl"
        v-if="!isCapture"
        color="grey lighten-2"
        elevation="0"
      >
        <v-icon left dark>mdi-monitor-screenshot</v-icon>
        Capture
      </v-btn>
      <v-btn
        class="ml-4 mb-2 xl"
        v-if="isCapture && videoUrl == ''"
        :color="!isRecording ? 'grey lighten-2' : 'red lighten-1'"
        :dark="isRecording"
        prepend-icon="mdi-monitor-screenshot"
        elevation="0"
        @click="recordScreen"
      >
        <v-icon left dark v-if="!isRecording">mdi-monitor-screenshot</v-icon>
        <v-icon left dark v-else>mdi-stop</v-icon>
        {{ isRecording ? 'Stop recording' : 'Start recording' }}
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
      isCapture: false,
      isRecording: false,
      videoUrl: '',
      mediaRecorder: null,
      chunks: [],
    };
  },
  methods: {
    async captureScreen() {
      const videoElem = document.getElementById('vpreview');
      try {
        videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(
          this.displayMediaOptions
        );
        this.isCapture = true;
      } catch (err) {
        console.error(err);
      }
    },
    recordScreen() {
      if (!this.isRecording) {
        const videoElem = document.getElementById('vpreview');
        this.mediaRecorder = new MediaRecorder(videoElem.srcObject);
        this.mediaRecorder.start();
        this.mediaRecorder.ondataavailable = (e) => {
          this.chunks.push(e.data);
        };

        this.mediaRecorder.onstop = async () => {
          const videoBlob = new Blob(this.chunks, { type: 'video/webm' });
          const storage = getStorage();
          const storageRef = ref(
            storage,
            `tests/${this.testId}/${this.currentUserTestAnswer.userDocId}/task_${this.taskIndex}/screen_record/${this.videoUrl}`
          );
          await uploadBytes(storageRef, videoBlob);

          this.videoUrl = await getDownloadURL(storageRef);

          this.currentUserTestAnswer.tasks[
            this.taskIndex
          ].screenRecordURL = this.videoUrl;
        };
        this.isRecording = true;
      } else {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }
    },
  },
};
</script>

<style scoped>
</style>
