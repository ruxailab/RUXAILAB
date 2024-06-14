<template>
  <v-row>
    <v-col class="mt-8" cols="12">
      <video ref="remoteMedia" class="video" autoplay playsinline />
      <video ref="localMedia" class="video" muted autoplay playsinline />
    </v-col>
    <v-col cols="12">
      <v-row justify="center">
        <v-btn
          v-if="localCameraStream"
          class="mt-4 mx-2"
          :dark="isMicrophoneMuted"
          :class="{ red: isMicrophoneMuted, white: !isMicrophoneMuted }"
          fab
          @click="toggleMicrophone"
        >
          <v-icon v-if="!isMicrophoneMuted">
            mdi-microphone
          </v-icon>
          <v-icon v-else>
            mdi-microphone-off
          </v-icon>
        </v-btn>
        <v-btn @click="toggleCameraScreen()" color="blue" block depressed
          >TOGGLE CAMERA/SCREEN</v-btn
        >
      </v-row>
    </v-col>
    <VideoCall ref="VideoCall" />
  </v-row>
</template>

<script>
import VideoCall from './VideoCall.vue'
export default {
  components: {
    VideoCall,
  },
  props: {
    isAdmin: {
      type: Boolean,
    },
    index: {
      default: 0,
      type: Number,
    },
  },
  data() {
    return {
      hide: true,
      isMicrophoneMuted: false,
      isSharingScreen: false,
    }
  },
  computed: {
    localCameraStream() {
      return this.$store.getters.localCameraStream
    },
    remoteCameraStream() {
      return this.$store.getters.remoteCameraStream
    },
    roomTestId() {
      return this.$store.getters.test.id
    },
  },
  mounted() {
    this.setupStreams()
  },
  watch: {
    localCameraStream(newVal) {
      this.setupStreams()
    },
    remoteCameraStream(newVal) {
      this.setupStreams()
    },
  },
  methods: {
    setupStreams() {
      this.$refs.localMedia.srcObject = this.localCameraStream
      this.$refs.remoteMedia.srcObject = this.remoteCameraStream
    },
    toggleMicrophone() {
      if (
        this.localCameraStream &&
        this.localCameraStream.getAudioTracks().length > 0
      ) {
        const audioTrack = this.localCameraStream
          .getTracks()
          .find((track) => track.kind == 'audio')
        audioTrack.enabled = !audioTrack.enabled
        this.isMicrophoneMuted = !audioTrack.enabled
      }
    },
    hangUp() {
      this.$router.push('/testslist')
    },
  },
}
</script>

<style scoped>
.video {
  border-radius: 30px;
  width: 50vw;
}
</style>
