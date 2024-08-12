<template>
  <div class="waveform-container">
    <!-- Wave Reference -->
    <div ref="waveform" />

    {{ file }}

    <!-- Controls -->
    <!-- <v-btn icon @click="playPause"> -->
      <v-btn icon @click="updateRegion">
      <v-icon>
        {{ playing ? 'mdi-pause' : 'mdi-play' }}
      </v-icon>
    </v-btn>

    <h6>{{ this.regions }}</h6>


    <!--  -->
    <!-- {{ regionStart }} - {{ regionEnd }} -->
    


  </div>
</template>

<script>
import { getStorage, ref, getDownloadURL } from 'firebase/storage'

import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'


// Components

export default {
  components: {},
  props: {
    file: {
      type: String,
      required: false, // allowing for the file to be undefined
      default: null,
    },
    regions: {
      type: Array,
      default: () => [],
    },
    newRegion: {
      type: Object,
      default: () => ({ start: 0, end: 10 }),
    }
  },
  data() {
    return {
      wave_surfer: null,
      playing: false,      
    }
  },

  watch: {
    file: 'loadAudioFile',
  },

  mounted() {
    // Regions
    this.regionsPlugin = RegionsPlugin.create()

    // Initialize WaveSurfer
    this.initWaveSurfer()

    console.log('Wave Surfer Mounted')

  },
  methods: {
      // WaveSurfer Initializer
      initWaveSurfer() {
        this.wave_surfer = WaveSurfer.create({
          container: this.$refs.waveform,
          waveColor: 'orange',
          progressColor: '#666',
          cursorColor: '#666',
          barWidth: 2,
          barRadius: 3,
          plugins: [this.regionsPlugin],

        //   renderer: WaveSurfer.CanvasRenderer.extend({
        //   drawBars: function(peaks, channelIndex, start, end) {
        //     const { width, height } = this.params;
        //     const halfH = height / 2;
        //     const length = peaks.length / 2;

        //     const regionStart = 5; // Specify the start of the region (in seconds)
        //     const regionEnd = 10; // Specify the end of the region (in seconds)
        //     const sampleRate = this.wave_surfer.getDuration() / width;

        //     for (let i = start; i < end; i += 1) {
        //       const barHeight = Math.round((peaks[i] * halfH) / 2) || 1;
        //       const offset = Math.round((i / length) * width);
        //       const timestamp = i * sampleRate;

        //       if (timestamp >= regionStart && timestamp <= regionEnd) {
        //         this.fillRect(offset, halfH - barHeight, this.params.barWidth, barHeight * 2, '#00ff00'); // Green bars
        //       } else {
        //         this.fillRect(offset, halfH - barHeight, this.params.barWidth, barHeight * 2, this.params.waveColor); // Default color
        //       }
        //     }
        //   },
        // })
          // cursorWidth: 1,
          // height: 500,
      })

      // Update play/pause state when WaveSurfer's playback state changes
      this.wave_surfer.on('play', () => (this.playing = true))
      this.wave_surfer.on('pause', () => (this.playing = false))


      // When the audio is both decoded and can play
      this.wave_surfer.on('ready', () => {
        // The ready event in WaveSurfer.js is triggered when the audio file has been completely loaded, decoded, and is ready for playback.
        // This means that:
        // - The audio file is fully loaded: The waveform is generated and displayed.
        // - The audio data is decoded: The audio data is processed into a format that can be played back.

        console.log('Ready')

        // Add Regions
        // 1. Initialize any existing regions
        this.regions.forEach(region => {
          this.regionsPlugin.addRegion({
            start: region.start,
            end: region.end,
            color: (region.sentiment == 'POS') 
            ? 'rgba(0, 255, 0, 0.2)' // Green color for positive sentiment
            : (region.sentiment == 'NEG')
            ? 'rgba(255, 0, 0, 0.2)' // Red color for negative sentiment
            : (region.sentiment == 'NEU')
            ? 'rgba(0, 0, 255, 0.2)' // Blue color for neutral sentiment
            : 'rgba(0, 0, 0, 0.2)', // Default color            
            drag: false,
            resize: false,
          });
        });

        // 2. Add a new region [intial region]
        const initialRegion = this.regionsPlugin.addRegion({
          start: this.newRegion.start,
          end: this.newRegion.end,
          // color: 'rgba(0, 123, 255, 0.3)',
          color: 'rgba(0, 0, 255, 0.1)',
          drag: true,
          resize: true,
        });

        // Listen to updates on the region and emit the changes
        initialRegion.on('update-end', () => {
          this.$emit('update:newRegion', {
            start: initialRegion.start,
            end: initialRegion.end,
          });
        });
      })

      // When the audio has been decoded
      this.wave_surfer.on('decode', () => {
        console.log('Decoded')
      })

      // Load Audio File
      this.loadAudioFile()

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

    async loadAudioFile() {
      if (!this.wave_surfer){
        console.error('Wave Surfer not initialized')
        return
      }

      if (!this.file) {
        console.error('No audio file provided')
        return
      }

      // Clear regions
      if (this.regionsPlugin) {
        this.regionsPlugin.clearRegions()
      }

      // Get Audio File URL
      const storage = getStorage()
      const fileRef = ref(storage, this.file)
      getDownloadURL(fileRef)
        .then(async (url) => {
          if (url) {
            console.log('URL:', url)

            // Load the audio file
            this.wave_surfer.load(url)         
          }
        })
        .catch((error) => {
          switch (error.code) {
            case 'storage/object-not-found':
              // File doesn't exist
              console.error('File does not exist')
              break
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              console.error('User does not have permission to access the object')
              break
            case 'storage/canceled':
              // User canceled the upload
              console.error('User canceled the upload')
              break
            case 'storage/unknown':
              // Unknown error occurred, inspect the server response
              console.error('Unknown error occurred, inspect the server response')
              break
          }
          console.error(error)
        })
    },
    // updateRegion(newStart, newEnd) {
      updateRegion() {
      const newStart=0
      const newEnd=8
      this.$emit('update:newRegion', { start: newStart, end: newEnd });
    },
  },
}
</script>

<style scoped>
.custom-btn {
  text-transform: none; /* Preserve the original text case */
}
/* .waveform-container { */
/* height: 100px; */
/* Additional styles can be added here */
/* border: 1px solid #ccc; Example border */
/* background-color: #f9f9f9; Example background color */
/* } */
</style>
