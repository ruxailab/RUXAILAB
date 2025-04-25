<template>
  <div class="waveform-container">
    <v-overlay
      v-model="loading"
      class="text-center"
    >
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      />
      <div class="white-text mt-3">
        Loading
      </div>
    </v-overlay>

    <!-- Wave Reference -->
    <div ref="waveform" />

    <!-- Controls -->
    <v-row
      align="center"
      no-gutters
      class="controls-row"
    >
      <v-col cols="auto">
        <v-btn
          icon
          @click="playPause"
        >
          <v-icon>{{ playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn @click="changeSpeed">
          {{ speedText }}
        </v-btn>
      </v-col>

      <v-col
        cols="auto"
        class="volume-col"
      >
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
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';

// Define props
const props = defineProps({
  file: {
    type: String,
    required: false,
    default: null,
  },
  regions: {
    type: Array,
    default: () => [],
  },
  activeRegion: {
    type: Object,
    required: true,
  },
});

// Define emits
const emit = defineEmits(['update:activeRegion']);

// Reactive state
const wave_surfer = ref(null);
const playing = ref(false);
const volume = ref(1);
const speedText = ref('1x');
const loading = ref(false);
const waveform = ref(null);
const regionsPlugin = ref(null);
const timelinePlugin = ref(null);

// Initialize plugins
regionsPlugin.value = RegionsPlugin.create();
timelinePlugin.value = TimelinePlugin.create({ height: 12 });

// Methods
const initWaveSurfer = () => {
  console.log('Initializing WaveSurfer...');

  // 1. Delete existing instance if it exists
  if (wave_surfer.value) {
    wave_surfer.value.destroy();
  }

  // 2. Create a new instance of WaveSurfer
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
  });

  // 3. Update play/pause state when WaveSurfer's playback state changes
  wave_surfer.value.on('play', () => (playing.value = true));
  wave_surfer.value.on('pause', () => (playing.value = false));

  wave_surfer.value.on('ready', () => {
    loading.value = false;
    initializeRegions();
  });

  loadAudioFile();
};

const initializeRegions = () => {
  if (!wave_surfer.value) return;

  // Remove any existing regions
  regionsPlugin.value.getRegions().forEach((region) => region.remove());

  // Add Regions
  props.regions.forEach((region) => {
    regionsPlugin.value.addRegion({
      start: region.start,
      end: region.end,
      color:
        region.sentiment === 'POS'
          ? 'rgba(0, 255, 0, 0.2)' // Green color for positive sentiment
          : region.sentiment === 'NEG'
          ? 'rgba(255, 0, 0, 0.2)' // Red color for negative sentiment
          : region.sentiment === 'NEU'
          ? 'rgba(0, 0, 255, 0.2)' // Blue color for neutral sentiment
          : 'rgba(0, 0, 0, 0.2)', // Default color
      drag: false,
      resize: false,
    });
  });

  // Add an active region
  const initialRegion = regionsPlugin.value.addRegion({
    start: props.activeRegion.start,
    end: props.activeRegion.end,
    color: 'rgba(0, 0, 255, 0.1)',
    drag: true,
    resize: true,
  });

  // Listen to updates on the region and emit the changes
  initialRegion.on('update-end', () => {
    emit('update:activeRegion', {
      start: initialRegion.start,
      end: initialRegion.end,
    });
  });
};

const loadAudioFile = () => {
  if (!props.file) return;

  loading.value = true;

  if (wave_surfer.value) {
    wave_surfer.value.stop();
    wave_surfer.value.load(props.file);
  }
};

const playPause = () => {
  if (!wave_surfer.value) return;
  wave_surfer.value.isPlaying() ? wave_surfer.value.pause() : wave_surfer.value.play();
};

const changeSpeed = () => {
  const speeds = [0.5, 1, 1.5, 2];
  let currentSpeedIndex = speeds.indexOf(wave_surfer.value.getPlaybackRate());
  currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
  const newSpeed = speeds[currentSpeedIndex];
  wave_surfer.value.setPlaybackRate(newSpeed);
  speedText.value = `${newSpeed}x`;
};

const setVolume = () => {
  if (wave_surfer.value) {
    wave_surfer.value.setVolume(volume.value);
  }
};

const playSegment = (start, end) => {
  if (!wave_surfer.value) return;
  console.log('playing segment', start, end);

  wave_surfer.value.seekTo(start / wave_surfer.value.getDuration());
  wave_surfer.value.play();
};

// Watchers
watch(
  () => props.file,
  () => loadAudioFile()
);

watch(
  () => props.regions,
  () => {
    if (!wave_surfer.value) return;
    initializeRegions();
  },
  { deep: true }
);

// Lifecycle hooks
onMounted(() => {
  initWaveSurfer();
});
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