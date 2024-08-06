<template>
  <div class="waveform-container">
    <!-- Wave Reference -->
    <div ref="waveform" />

    <!-- Controls -->
    <!-- Controls -->
    <v-btn icon @click="playPause">
      <v-icon>
        {{ playing ? 'mdi-pause' : 'mdi-play' }}
      </v-icon>
    </v-btn>
  </div>
</template>

<script>
import { getStorage, ref, getDownloadURL } from 'firebase/storage'

import WaveSurfer from 'wavesurfer.js'

// Components

export default {
  components: {},
  props: {
    file: {
      type: String,
      required: false, // allowing for the file to be undefined
      default: null,
    },
  },
  data() {
    return {
      wave_surfer: null,
      playing: false,
    }
  },

  watch: {
    file(newFile) {
      // Re-initialize with the new file
      this.loadAudioFile()
    },
  },
  mounted() {
    // Initialize WaveSurfer
    this.initWaveSurfer()

    // Update play/pause state when WaveSurfer's playback state changes
    this.wave_surfer.on('play', () => (this.playing = true))
    this.wave_surfer.on('pause', () => (this.playing = false))
  },
  methods: {
    async loadAudioFile() {
      if (!this.wave_surfer) return

      if (!this.file) return
      // Get Audio File URL
      const storage = getStorage()
      const fileRef = ref(storage, this.file)
      getDownloadURL(fileRef)
        .then((url) => {
          if (url) {
            this.wave_surfer.load(url)
          }
        })
        .catch((error) => {
          switch (error.code) {
            case 'storage/object-not-found':
              // File doesn't exist
              break
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break
            case 'storage/canceled':
              // User canceled the upload
              break
            case 'storage/unknown':
              // Unknown error occurred, inspect the server response
              break
          }
        })
    },

    // WaveSurfer Initializer
    initWaveSurfer() {
      this.wave_surfer = WaveSurfer.create({
        container: this.$refs.waveform,
        waveColor: 'orange',
        progressColor: '#666',
        cursorColor: '#666',
        barWidth: 2,
        barRadius: 3,
        // cursorWidth: 1,
        // height: 500,
      })
    },

    // Play/Pause
    playPause() {
      if (!this.wave_surfer) return

      if (this.wave_surfer.isPlaying()) {
        this.wave_surfer.pause()
      } else {
        this.wave_surfer.play()
      }
    },
  },
}
</script>

<style scoped>
/* .waveform-container { */
/* height: 100px; */
/* Additional styles can be added here */
/* border: 1px solid #ccc; Example border */
/* background-color: #f9f9f9; Example background color */
/* } */
</style>
