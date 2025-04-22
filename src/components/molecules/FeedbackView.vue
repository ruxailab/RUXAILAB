<template>
  <v-row>
    <v-col
      class="mt-8"
      cols="8"
    >
      <video
        ref="remoteMedia"
        class="video"
        muted
        autoplay
        playsinline
      />
    </v-col>
    <v-col
      class="mt-8"
      cols="4"
    >
      <video
        ref="localMedia"
        class="video"
        muted
        autoplay
        playsinline
      />
    </v-col>
    <v-col cols="12">
      <v-row justify="center">
        <v-card
          class="pa-2 buttonCard"
          depressed
        >
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-if="localCameraStream"
                class="mx-3"
                :class="{ red: isMicrophoneMuted, white: !isMicrophoneMuted }"
                icon
                variant="flat"
                v-bind="props"
               
                @click="toggleMicrophone"
              >
                <v-icon v-if="!isMicrophoneMuted">
                  mdi-microphone
                </v-icon>
                <v-icon v-else>
                  mdi-microphone-off
                </v-icon>
              </v-btn>
            </template>
            <span>{{
              isMicrophoneMuted ? 'Unmute microphone' : 'Mute microphone'
            }}</span>
          </v-tooltip>
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                class="mx-3"
                :class="{ red: isSharingScreen, white: !isSharingScreen }"
                variant="flat"
                icon
                v-bind="props"
                @click="toggleCameraScreen"
              >
                <v-icon v-if="!isSharingScreen">
                  mdi-monitor-screenshot
                </v-icon>
                <v-icon v-else>
                  mdi-monitor-off
                </v-icon>
              </v-btn>
            </template>
            <span>{{
              isSharingScreen ? 'Stop screen sharing' : 'Share screen'
            }}</span>
          </v-tooltip>
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                class="mx-3 bg-white"
                variant="flat"
                icon
                v-bind="props"
                @click="redirect()"
              >
                <v-icon>
                  mdi-link
                </v-icon>
              </v-btn>
            </template>
            <span>Open link</span>
          </v-tooltip>
        </v-card>
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
    test() {
      return this.$store.getters.test
    },
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
  watch: {
    localCameraStream(newVal) {
      this.setupStreams()
    },
    remoteCameraStream(newVal) {
      this.setupStreams()
    },
  },
  mounted() {
    this.setupStreams()
  },
  methods: {
    redirect() {
      if(this.test.testStructure.landingPage.trim() == '') {
        this.$toast.error(i18n.t(errors.globalError))
        return
      }
      console.log(this.test.testStructure.landingPage)
      window.open(this.test.testStructure.landingPage)
    },
    setupStreams() {
      console.log('setupStreams')
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
          this.isSharingScreen = !this.isSharingScreen
          this.usingCamera = !this.usingCamera
        }
      } catch (e) {
        this.$toast.error(i18n.t(errors.globalError))
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
  margin-top: 5vh;
}
.buttonCard {
  background: rgb(77, 77, 77);
  background: linear-gradient(
    180deg,
    rgb(190, 190, 190) 0%,
    rgb(170, 170, 170) 100%
  );
  border-radius: 20px;
  margin-top: 10vh;
}
</style>
