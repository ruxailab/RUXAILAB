<template>
  <v-row>
    <v-col class="mt-8" cols="8">
      <video ref="remoteMedia" class="video" autoplay playsinline />
    </v-col>
    <v-col class="mt-8" cols="4">
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
        <v-btn class="mt-4 mx-2 white" fab @click="toggleCameraScreen">
          <v-icon v-if="!isMicrophoneMuted">
            monitor-screenshot
          </v-icon></v-btn
        >
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
export default {
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
      usingCamera: true,
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
    peerConnection() {
      return this.$store.getters.peerConnection
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
    async toggleCameraScreen() {
      try {
        let stream

        if (this.usingCamera) {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          })
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          })
        }

        if (stream) {
          await this.$store.dispatch('changeTrack', stream)
          this.usingCamera = !this.usingCamera
        }
      } catch (e) {
        this.$toast.error('Error in toggling camera/screen: ' + e.message)
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
  width: 100%;
  object-fit: contain;
}
</style>
