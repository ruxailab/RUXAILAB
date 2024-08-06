<template>
  <div class="waveform-container">
    <h1>Basma</h1>
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
import audioFile from '@/demos/Basma_sportify_1_Side.mp4'

// Components

export default {
  components: {},

  data() {
    return {
      wave_surfer: null,
      fileUrl: '',
    }
  },
  mounted() {
    // this.downloadAudio()
    this.initWaveSurfer()
  },
  methods: {
    async downloadAudio() {
      const storage = getStorage()
      const fileRef = ref(
        storage,
        'tests/avamZbs4K0m6k03WlnGu/byfjeXr4olNzHdnSmF0ibZQZgkH2/byfjeXr4olNzHdnSmF0ibZQZgkH2/video',
      )
      getDownloadURL(fileRef)
        .then((url) => {
          console.log('URL:', url)
          // window.open(url, '_blank')
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
      // console.log('WaveSurfer:', this.wave_surfer)
      // if (this.fileUrl) {
      // console.log('Loading file:', this.fileUrl)
      console.log('Loading file:')
      // this.wave_surfer.load('https://firebasestorage.googleapis.com/v0/b/retlab-dev.appspot.com/o/tests%2FavamZbs4K0m6k03WlnGu%2FbyfjeXr4olNzHdnSmF0ibZQZgkH2%2FbyfjeXr4olNzHdnSmF0ibZQZgkH2%2Fvideo?alt=media&token=cb9e7dc6-e8ee-42aa-8c23-d5ac8baef38b')
      this.wave_surfer.load(
        'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
      )
      console.log('File loaded:')
      // }
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
