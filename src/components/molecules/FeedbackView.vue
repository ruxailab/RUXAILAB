<template>
  <v-row>
    <v-col class="mt-8" cols="12">
      <video ref="remoteVideo" class="video" autoplay playsinline />
      <video
        ref="localVideo"
        class="video ml-8"
        style="height: 10vw"
        muted
        autoplay
        playsinline
      />
    </v-col>
    <v-col cols="12">
      <v-row justify="center">
        <v-btn
          v-if="localStream"
          disabled
          class="mt-4 mx-2"
          :dark="isSharingScreen"
          :class="{ red: isSharingScreen, ' ': !isSharingScreen }"
          fab
          @click="toggleScreen()"
        >
          <v-icon v-if="!isSharingScreen">
            mdi-monitor-screenshot
          </v-icon>
          <v-icon v-else>
            mdi-monitor-off
          </v-icon>
        </v-btn>
        <v-btn
          v-if="localStream"
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
        <v-btn
          v-if="localStream"
          class="mt-4 mx-2"
          dark
          color="red"
          fab
          @click="hangUp()"
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
  mounted() {
    this.setupStreams()
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
