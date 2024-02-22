<template>
  <v-row>
    <v-col class="mt-8" cols="12">
      <video class="video" ref="remoteVideo" autoplay playsinline></video>
      <video
        class="video ml-8"
        style="height: 10vw"
        ref="localVideo"
        muted
        autoplay
        playsinline
      ></video>
    </v-col>
    <v-col cols="12">
      <v-row justify="center">
        <v-btn
          v-if="localStream"
          @click="toggleScreen()"
          class="mt-4 mx-2"
          :dark="isSharingScreen"
          :class="{ red: isSharingScreen, ' ': !isSharingScreen }"
          fab
        >
          <v-icon v-if="!isSharingScreen">mdi-monitor-screenshot</v-icon>
          <v-icon v-else>mdi-monitor-off</v-icon>
        </v-btn>
        <v-btn
          v-if="localStream"
          @click="toggleMicrophone"
          class="mt-4 mx-2"
          :dark="isMicrophoneMuted"
          :class="{ red: isMicrophoneMuted, white: !isMicrophoneMuted }"
          fab
        >
          <v-icon v-if="!isMicrophoneMuted">mdi-microphone</v-icon>
          <v-icon v-else>mdi-microphone-off</v-icon>
        </v-btn>
        <v-btn
          v-if="localStream"
          @click="hangUp()"
          class="mt-4 mx-2"
          dark
          color="red"
          fab
        >
          <v-icon>mdi-phone-hangup</v-icon>
        </v-btn>
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
      type: Number,
    },
  },
  data() {
    return {
      isMicrophoneMuted: false,
      isSharingScreen: false,
    }
  },
  mounted() {
    this.setupStreams()
  },

  computed: {
    localStream() {
      return this.$store.getters.localStream
    },
    remoteStream() {
      return this.$store.getters.remoteStream
    },
  },
  methods: {
    async toggleScreen() {
      console.log('toggleScreen');
      if (!this.isSharingScreen) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        this.$store.commit('SET_LOCAL_STREAM', stream)
        this.isSharingScreen = true
        this.setupStreams()
      } else if (this.isSharingScreen) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        this.$store.commit('SET_LOCAL_STREAM', stream)
        this.isSharingScreen = false
        this.setupStreams()
      }
    },
    setupStreams() {
      this.$refs.localVideo.srcObject = this.localStream
      this.$refs.remoteVideo.srcObject = this.remoteStream
    },
    toggleMicrophone() {
      if (this.localStream && this.localStream.getAudioTracks().length > 0) {
        const audioTrack = this.localStream
          .getTracks()
          .find((track) => track.kind == 'audio')
        console.log(audioTrack)
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
  height: 36vw;
}
</style>
