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

<script>
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js'

export default {
  props: {
    file: { type: String, required: false, default: null },
    regions: { type: Array, default: () => [] },
    activeRegion: { type: Object, required: true }
  },
  emits: ['update:activeRegion'],
  data() {
    return {
      wave_surfer: null,
      playing: false,
      volume: 1,
      speedText: '1x',
      loading: false,
    }
  },
  watch: {
    file: 'loadAudioFile',
    regions: {
      deep: true,
      handler(newRegions) {
        if (!this.wave_surfer) return;

        this.initilzieRegions();
      }
    }
  },
  mounted() {
    this.regionsPlugin = RegionsPlugin.create();
    this.timelinePlugin = TimelinePlugin.create({ height: 12 });

    this.initWaveSurfer();
  },
  methods: {
    initWaveSurfer() {
      console.log("Initializing WaveSurfer...");

      // 1. Delete existing instance if it exists
      if (this.wave_surfer) {
        this.wave_surfer.destroy();
      }

      // 2. Create a new instance of WaveSurfer
      this.wave_surfer = WaveSurfer.create({
        container: this.$refs.waveform,
        waveColor: 'orange',
        progressColor: '#666',
        cursorColor: '#666',
        barWidth: 2,
        barRadius: 3,
        minPxPerSec: 10,
        dragToSeek: true,
        plugins: [this.regionsPlugin, this.timelinePlugin],
      });
      
      // 3. Update play/pause state when WaveSurfer's playback state changes
      this.wave_surfer.on('play', () => (this.playing = true));
      this.wave_surfer.on('pause', () => (this.playing = false));

      this.wave_surfer.on('ready', () => {
        this.loading = false;

        this.initilzieRegions();
      });

      this.loadAudioFile();
    },

    initilzieRegions() {
      // Remove any existing regions
      this.regionsPlugin.getRegions().forEach(region => region.remove());

      // Add Regions
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

      // Add an active region
      const initialRegion = this.regionsPlugin.addRegion({
        start: this.activeRegion.start,
        end: this.activeRegion.end,
        color: 'rgba(0, 0, 255, 0.1)',
        drag: true,
        resize: true,
      });

      // Listen to updates on the region and emit the changes
      initialRegion.on('update-end', () => {
        this.$emit('update:activeRegion', {
          start: initialRegion.start,
          end: initialRegion.end,
        });
      });
    },

    loadAudioFile() {
      if (!this.file) return;

      this.loading = true;

      if (this.wave_surfer) {
        this.wave_surfer.stop();
        this.wave_surfer.load(this.file);
      }
    },

    playPause() {
      if (!this.wave_surfer) return;
      this.wave_surfer.isPlaying() ? this.wave_surfer.pause() : this.wave_surfer.play();
    },

    changeSpeed() {
      const speeds = [0.5, 1, 1.5, 2]
      let currentSpeedIndex = speeds.indexOf(this.wave_surfer.getPlaybackRate())
      currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length
      const newSpeed = speeds[currentSpeedIndex]
      this.wave_surfer.setPlaybackRate(newSpeed)
      this.speedText = `${newSpeed}x`
    },

    setVolume() {
      if (this.wave_surfer) {
        this.wave_surfer.setVolume(this.volume)
      }
    },

    playSegment(start, end) {
      if (!this.wave_surfer) return;
      console.log("playing segment", start, end)

      this.wave_surfer.seekTo(start / this.wave_surfer.getDuration());
      this.wave_surfer.play();
    }
  }
}
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