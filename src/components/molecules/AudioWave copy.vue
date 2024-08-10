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

    <!--  -->
    {{ regionStart }} - {{ regionEnd }}
    <v-btn
      color="#F9A826"
      class="white--text custom-btn"
      @click="analyzeTimeStamp()"
    >
      + Analyze
    </v-btn>



    <v-overlay :value="overlay">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
      <h3>Analyzing ... </h3>
    </v-overlay>

    <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    :timeout="4000"
    >
      {{ snackbar.text }}
      <template v-slot:action>
        <v-btn color="white" text @click="snackbar.visible = false">Close</v-btn>
      </template>
    </v-snackbar>



  </div>
</template>

<script>
import { getStorage, ref, getDownloadURL } from 'firebase/storage'

import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'

import axios from 'axios';

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
      // State Management
      overlay: false,
      snackbar: {
        visible: false,
        text: '',
        color: '' // Use a valid color name or hex code
      },
      
      wave_surfer: null,
      playing: false,
      regions: null,
      regionStart: 0,
      regionEnd: 8,
      url: null,
    }
  },

  watch: {
    // file(newFile) {
    //   // Re-initialize with the new file
    //   this.loadAudioFile()
    // },
  },
  mounted() {
    // Regions
    this.regions = RegionsPlugin.create()

    // Initialize WaveSurfer
    this.initWaveSurfer()

    console.log('Wave Surfer Mounted')

  },
  methods: {
  
    async loadAudioFile() {
      if (!this.wave_surfer){
        console.error('Wave Surfer not initialized')
        return
      }

      if (!this.file) {
        console.error('No audio file provided')
        return
      }

      // // Clear regions
      // if (this.regions) {
      //   this.regions.clearRegions()
      // }

      // Get Audio File URL
      const storage = getStorage()
      const fileRef = ref(storage, this.file)
      getDownloadURL(fileRef)
        .then(async (url) => {
          if (url) {
            console.log('URL:', url)

            // Load the audio file
            this.wave_surfer.load(url)

            // Set the URL
            this.url = url           
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

    // WaveSurfer Initializer
    initWaveSurfer() {
      this.wave_surfer = WaveSurfer.create({
        container: this.$refs.waveform,
        waveColor: 'orange',
        progressColor: '#666',
        cursorColor: '#666',
        barWidth: 2,
        barRadius: 3,
        plugins: [this.regions],
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
      })

      // When the audio has been decoded
      this.wave_surfer.on('decode', () => {
        console.log('Decoded')
      })


      // Load Audio File
      this.loadAudioFile()

      // this.wave_surfer.on('decode', () => {
      //   if (!this.wave_surfer) return
      //   if (!this.regions) return
      //   // Regions
      //   const init_region = this.regions.addRegion({
      //     start: 0,
      //     end: 8,
      //     content: '',
      //     color: 'rgba(252, 162, 42, 0.24)',
      //     drag: true,
      //     resize: true,
      //   })

      //   init_region.on('update-end', () => {
      //     this.regionStart = init_region.start
      //     this.regionEnd = init_region.end
      //   })
      // })
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

    analyzeTimeStamp() {
      // Show the overlay
      this.overlay = !this.overlay

      // Removeee
      this.url='https://firebasestorage.googleapis.com/v0/b/retlab-dev.appspot.com/o/tests%2FavamZbs4K0m6k03WlnGu%2FbyfjeXr4olNzHdnSmF0ibZQZgkH2%2FbyfjeXr4olNzHdnSmF0ibZQZgkH2%2FBasma_sportify_1_Side.mp4?alt=media&token=7f6b01e0-b939-40d7-a25a-225ff84efb04'

      console.log(this.url)

      axios.post('http://localhost:5000/test', 
      {
        url: this.url,
        start_time: 0,
        end_time: 10,
        whisper_model_size:"base",
      }).then((response) => {
        // Hide the overlay
        this.overlay = false

        const utterances_sentiment = response.data.utterances_sentiment
        console.log(utterances_sentiment)

        // Add this to the store
        // this.$store.commit('setAnalysis', response.data)

        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='success'
        this.snackbar['text']='Analysis Completed'
        
      }).catch((error) => {
        // Hide the overlay
        this.overlay = false

        // Log the error
        console.error(error)

        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='error'
        this.snackbar['text']='Analysis Failed'
      })
      
      // Send the audio file to the server
      // axios.post('http://localhost:5000/', audioBlob).then((response) => {


      // Clip Part of the Audio

      // console.log('Analyze')
      // console.log(this.regionStart, this.regionEnd)

      // // Split the Audio
      // console.log(this.regions.regions)


      // const selectedRegion = this.regions.regions[0]
      // console.log(selectedRegion)
      // if (!selectedRegion) {
      //   return
      // }
      // const start = selectedRegion.start;
      // const end = selectedRegion.end;
      
      // // const originalBuffer = this.wave_surfer.backend.buffer;
      // console.log(this.wave_surfer)
      // // const sampleRate = originalBuffer.sampleRate;
      // // const startFrame = Math.floor(start * sampleRate);
      // // const endFrame = Math.floor(end * sampleRate);

      // const newBuffer = originalBuffer.slice(startFrame, endFrame);

      // console.log(newBuffer)

      

      // axios.get('http://localhost:5000/').then((response) => {

  
      //   console.log(response)
      // }).catch((error) => {
      //   console.error(error)
      // })


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
