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

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const audioContext = ref(null)
const analyser = ref(null)
const dataArray = ref(null)
const activeBars = ref(0)
const animationId = ref(null)

const initAudio = async () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  audioContext.value = new AudioContext()
  analyser.value = audioContext.value.createAnalyser()
  analyser.value.fftSize = 32

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })
    const source = audioContext.value.createMediaStreamSource(stream)
    source.connect(analyser.value)

    dataArray.value = new Uint8Array(analyser.value.frequencyBinCount)
    animate()
  } catch (error) {
    console.error('Error accessing the microphone', error)
  }
}

const animate = () => {
  analyser.value.getByteFrequencyData(dataArray.value)
  const sum = dataArray.value.reduce((a, b) => a + b, 0)
  const average = sum / dataArray.value.length
  activeBars.value = Math.min(Math.floor(average / 20), 15) // Adjust sensitivity here

  animationId.value = requestAnimationFrame(animate)
}

const cleanup = () => {
  if (audioContext.value) {
    audioContext.value.close()
  }
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
}

onMounted(() => {
  initAudio()
})

onBeforeUnmount(() => {
  cleanup()
})
</script>