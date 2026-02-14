<template>
  <div class="waveform-container">
    <v-overlay v-model="loading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">Loading</div>
    </v-overlay>

    <!-- Container da waveform -->
    <div ref="waveform" />

    <v-row align="center" no-gutters class="controls-row">
      <v-col cols="auto">
        <v-btn icon @click="playPause">
          <v-icon>{{ playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn @click="changeSpeed">{{ speedText }}</v-btn>
      </v-col>

      <v-col cols="auto" class="volume-col">
        <v-icon>mdi-volume-high</v-icon>
        <v-slider
          v-model="volume"
          min="0"
          max="1"
          step="0.01"
          hide-details
          class="volume-slider"
          @update:model-value="setVolume"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, watchEffect } from 'vue'
import { getStorage, ref as storageRef, getBlob } from 'firebase/storage'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/plugins/regions'
import TimelinePlugin from 'wavesurfer.js/plugins/timeline'

const props = defineProps({
  file: { type: String, required: false, default: null },
  regions: { type: Array, default: () => [] },
  activeRegion: { type: Object, required: true },
})

const emit = defineEmits(['update:activeRegion'])

const wave_surfer = ref(null)
const waveform = ref(null)
const playing = ref(false)
const volume = ref(1)
const speedText = ref('1x')
const loading = ref(false)
const regionsPlugin = ref(null)
const timelinePlugin = ref(null)
let objectURL = null

// ✅ Cria WaveSurfer apenas quando o container estiver renderizado
const initWaveSurfer = async () => {
  if (!waveform.value) {
    console.warn('Esperando waveform container...')
    await nextTick()
    if (!waveform.value) return
  }

  if (wave_surfer.value) {
    wave_surfer.value.destroy()
  }

  regionsPlugin.value = RegionsPlugin.create()
  timelinePlugin.value = TimelinePlugin.create({ height: 12 })

  wave_surfer.value = WaveSurfer.create({
    container: waveform.value,
    waveColor: 'orange',
    progressColor: '#666',
    cursorColor: '#666',
    barWidth: 2,
    barRadius: 3,
    minPxPerSec: 10,
    dragToSeek: true,
    plugins: [regionsPlugin.value, timelinePlugin.value],
  })

  wave_surfer.value.on('play', () => (playing.value = true))
  wave_surfer.value.on('pause', () => (playing.value = false))
  wave_surfer.value.on('ready', () => {
    loading.value = false
    initializeRegions()
  })

  await loadAudioFile()
}

// 🔊 Carrega o áudio via Firebase SDK
const loadAudioFile = async () => {
  if (!props.file) return

  loading.value = true

  try {
    const storage = getStorage()
    const audioRef = storageRef(storage, props.file)
    const blob = await getBlob(audioRef)

    if (objectURL) URL.revokeObjectURL(objectURL)
    objectURL = URL.createObjectURL(blob)

    if (wave_surfer.value) {
      wave_surfer.value.stop()
      wave_surfer.value.load(objectURL)
    }
  } catch (err) {
    console.error('Erro ao carregar áudio:', err)
  } finally {
    loading.value = false
  }
}

// 🎨 Adiciona regiões
const initializeRegions = () => {
  if (!wave_surfer.value || !regionsPlugin.value) return

  regionsPlugin.value.getRegions().forEach((r) => r.remove())

  props.regions?.forEach((region) => {
    regionsPlugin.value.addRegion({
      start: region.start,
      end: region.end,
      color:
        region.sentiment === 'POS'
          ? 'rgba(0, 255, 0, 0.2)'
          : region.sentiment === 'NEG'
            ? 'rgba(255, 0, 0, 0.2)'
            : region.sentiment === 'NEU'
              ? 'rgba(0, 0, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.2)',
      drag: false,
      resize: false,
    })
  })

  if (props.activeRegion) {
    const r = regionsPlugin.value.addRegion({
      start: props.activeRegion.start,
      end: props.activeRegion.end,
      color: 'rgba(0, 0, 255, 0.1)',
      drag: true,
      resize: true,
    })

    r.on('update-end', () => {
      emit('update:activeRegion', { start: r.start, end: r.end })
    })
  }
}

// ▶️ Controles
const playPause = () => {
  if (!wave_surfer.value) return
  wave_surfer.value.isPlaying()
    ? wave_surfer.value.pause()
    : wave_surfer.value.play()
}

function playSegment(start, end) {
  console.log(`Playing segment from ${start} to ${end}`)
  if (!wave_surfer.value) return
  wave_surfer.value.play(start, end)
}

const changeSpeed = () => {
  if (!wave_surfer.value) return
  const speeds = [0.5, 1, 1.5, 2]
  let idx = speeds.indexOf(wave_surfer.value.getPlaybackRate())
  idx = (idx + 1) % speeds.length
  const newSpeed = speeds[idx]
  wave_surfer.value.setPlaybackRate(newSpeed)
  speedText.value = `${newSpeed}x`
}

const setVolume = () => {
  if (wave_surfer.value) wave_surfer.value.setVolume(volume.value)
}

onMounted(async () => {
  // 🕓 Aguarda o container ficar disponível reativamente
  const stopWatcher = watchEffect(async () => {
    if (waveform.value) {
      await initWaveSurfer()
      stopWatcher() // Para de observar depois que iniciou
    }
  })

  // Recarrega se props mudarem
  watch(
    () => props.file,
    async () => {
      if (wave_surfer.value) await loadAudioFile()
    },
  )

  watch(
    () => props.regions,
    () => {
      if (wave_surfer.value) initializeRegions()
    },
    { deep: true },
  )
})

onUnmounted(() => {
  if (objectURL) URL.revokeObjectURL(objectURL)
  if (wave_surfer.value) wave_surfer.value.destroy()
})

defineExpose({
  playSegment,
})
</script>

<style scoped>
.waveform-container {
  position: relative;
}

.controls-row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.volume-col {
  display: flex;
  align-items: center;
  gap: 5px;
}

.volume-slider {
  width: 100px;
  max-width: 120px;
}

.v-btn {
  min-width: 40px;
  height: 40px;
}

.v-icon {
  font-size: 24px;
}
</style>
