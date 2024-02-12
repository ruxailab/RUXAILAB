<template>
  <v-row justify="center">
    <v-col cols="12">
      <v-row justify="center">
        <video ref="localVideo" muted autoplay playsinline></video>
      </v-row>
      <v-row justify="center">
        <video ref="remoteVideo" autoplay playsinline></video>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
export default {
  mounted() {
    this.setupStreams();
  },
  watch: {
    index() {
      this.setupStreams();
    }
  },
  methods: {
    setupStreams() {
      // Verifica se os elementos de vídeo estão disponíveis no DOM antes de definir srcObject
      if (this.$refs.localVideo && this.$refs.remoteVideo) {

          this.$refs.localVideo.srcObject = this.$store.state.localStream;


          this.$refs.remoteVideo.srcObject = this.$store.state.remoteStream;
      }
    }
  },
}
</script>
