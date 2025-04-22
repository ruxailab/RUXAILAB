<template>
  <v-container>
    <v-row>
      <v-col>
        <div>
          <div>
            <v-row no-gutters>
              <v-col
                v-for="index in 5"
                :key="index"
                cols="auto"
                class="mx-1"
              >
                <v-sheet
                  :color="index <= activeBars ? 'green' : 'grey lighten-1'"
                  height="21"
                  width="8"
                  rounded="pill"
                />
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
  
  <script>
    export default {
      data() {
        return {
          audioContext: null,
          analyser: null,
          dataArray: null,
          activeBars: 0,
          animationId: null,
        }
      },
      mounted() {
        this.initAudio()
      },
      beforeUnmount() {
        this.cleanup()
      },
      methods: {
        async initAudio() {
          const AudioContext = window.AudioContext || window.webkitAudioContext
          this.audioContext = new AudioContext()
          this.analyser = this.audioContext.createAnalyser()
          this.analyser.fftSize = 32
  
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            })
            const source = this.audioContext.createMediaStreamSource(stream)
            source.connect(this.analyser)
  
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
            this.animate()
          } catch (error) {
            console.error('Error accessing the microphone', error)
          }
        },
        animate() {
          this.analyser.getByteFrequencyData(this.dataArray)
          const sum = this.dataArray.reduce((a, b) => a + b, 0)
          const average = sum / this.dataArray.length
          this.activeBars = Math.min(Math.floor(average / 20), 15) // Adjust sensitivity here
  
          this.animationId = requestAnimationFrame(this.animate)
        },
        cleanup() {
          if (this.audioContext) {
            this.audioContext.close()
          }
          if (this.animationId) {
            cancelAnimationFrame(this.animationId)
          }
        },
      },
    }
  </script>
  