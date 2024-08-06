<template>
  <div class="waveform-container">
    file:{{ file }}
    <!-- Wave Reference -->
    <div ref="waveform" />

    <!-- Controls -->
    <button @click="playPause">
      Play/Pause
    </button>
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
    }
  },

  watch: {
    file(newFile) {
      // Destroy the previous WaveSurfer instance if it exists
      if (this.wave_surfer) {
        this.wave_surfer.destroy()
      }
      // Re-initialize with the new file
      this.initialize()
    },
  },
  mounted() {
    this.initialize()
  },
  methods: {
    async initialize() {
      if (!this.file) return
      // Get Audio File URL
      const storage = getStorage()
      const fileRef = ref(storage, this.file)
      getDownloadURL(fileRef)
        .then((url) => {
          this.initWaveSurfer(url)
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
    initWaveSurfer(url) {
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
      if (url) {
        this.wave_surfer.load(
          url,
          // 'https://firebasestorage.googleapis.com/v0/b/retlab-dev.appspot.com/o/tests%2FavamZbs4K0m6k03WlnGu%2FbyfjeXr4olNzHdnSmF0ibZQZgkH2%2FbyfjeXr4olNzHdnSmF0ibZQZgkH2%2FBasma_sportify_1_Side.mp4?alt=media&token=7f6b01e0-b939-40d7-a25a-225ff84efb04',
        )
        // this.wave_surfer.load(
        //   'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
        // )
      }
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
