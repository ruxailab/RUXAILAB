<template>
  <v-row>
    <v-col cols="12">
      <video class="video" ref="remoteVideo" muted autoplay playsinline></video>
      <video
        class="video ml-8"
        style="height: 200px"
        ref="localVideo"
        autoplay
        playsinline
      ></video>
      <v-btn @click="toggleMicrophone" class="mt-4" :dark="isMicrophoneMuted" :class="{ 'red': isMicrophoneMuted, 'grey': !isMicrophoneMuted }" fab>
        <v-icon v-if="!isMicrophoneMuted">mdi-microphone</v-icon>
        <v-icon  v-else>mdi-microphone-off</v-icon>
      </v-btn>
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
      isMicrophoneMuted: false, // Variável de dados para controlar o estado do microfone
    };
  },
  mounted() {
    this.setupStreams();
  },

  computed: {
    localStream() {
      return this.$store.getters.localStream;
    },
    remoteStream() {
      return this.$store.getters.remoteStream;
    },
  },
  methods: {
    setupStreams() {
      this.$refs.localVideo.srcObject = this.localStream;
      this.$refs.remoteVideo.srcObject = this.remoteStream;
    },
    toggleMicrophone() {
      const localStream = this.$refs.localVideo.srcObject;
      if (localStream && localStream.getAudioTracks().length > 0) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        this.isMicrophoneMuted = !audioTrack.enabled;
      }
    },
  },
};
</script>

<style scoped>
.video {
  border-radius: 30px;
  height: 500px;
}
</style>
