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
        disabled
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
    <VideoCall ref="VideoCall" />
  </v-row>
</template>

<script>
import VideoCall from './VideoCall.vue'
export default {
  props: {
    isAdmin: {
      type: Boolean,
    },
    index: {
      type: Number,
    },
  },
  components: {
    VideoCall,
  },
  data() {
    return {
      hide: true,
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
    roomTestId() {
      return this.$store.getters.test.id
    },
  },
  methods: {
    async toggleScreen() {
      console.log('toggleScreen')
      if (!this.isSharingScreen) {
        await this.$refs.VideoCall.switchMediaStream()
        this.isSharingScreen = true
        this.setupStreams()
      } else if (this.isSharingScreen) {
        this.isSharingScreen = false
        this.setupStreams()
        this.$refs.VideoCall.joinRoomById(this.roomTestId)
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
