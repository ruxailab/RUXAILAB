<template>
  <div class="waveform-container">
    <v-overlay v-model="loading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        Loading
      </div>
    </v-overlay>

    <!-- Wave Reference -->
    <!-- <div ref="waveform" v-show="!loading" /> -->
    <div ref="waveform"  />

    <!-- Controls -->
    <v-row align="center" no-gutters class="controls-row" >
      <v-col cols="auto">
        <v-btn icon @click="playPause">
          <v-icon>{{ playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn @click="changeSpeed">
          {{ speedText }}
        </v-btn>
      </v-col>

      <v-col cols="auto" class="volume-col">
        <v-icon> mdi-volume-high</v-icon>
        <v-slider
          v-model="volume"
          min="0"
          max="1"
          step="0.01"
          hide-details
          @change="setVolume"
          class="volume-slider"
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
    newRegion: { type: Object, default: () => ({ start: 0, end: 10 }) }
  },
  data() {
    return {
      wave_surfer: null,
      playing: false,
      volume: 1,
      speedText: '1x',
      loading: false, // <-- Add loading state
    }
  },
  watch: {
    file: 'loadAudioFile',
  },
  mounted() {
    this.regionsPlugin = RegionsPlugin.create();
    this.timelinePlugin = TimelinePlugin.create({ height: 12 });

    this.initWaveSurfer();
  },
  methods: {
    initWaveSurfer() {
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

      this.wave_surfer.on('play', () => (this.playing = true));
      this.wave_surfer.on('pause', () => (this.playing = false));

      this.wave_surfer.on('ready', () => {
        this.loading = false; // <-- Hide loading when audio is ready
      });

      this.loadAudioFile();
    },

    loadAudioFile() {
      if (!this.file) return;

      this.loading = true; // <-- Show loading while file is loading

      if (this.wave_surfer) {
        this.wave_surfer.stop(); // Stop playback
      }

      this.wave_surfer.load(this.file);
    },

    playPause() {
      if (!this.wave_surfer) return;
      this.wave_surfer.isPlaying() ? this.wave_surfer.pause() : this.wave_surfer.play();
    },

    changeSpeed() {
      const speeds = [0.5,1, 1.5, 2]
      let currentSpeedIndex = speeds.indexOf(this.wave_surfer.getPlaybackRate())
      currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length
      const newSpeed = speeds[currentSpeedIndex]
      this.wave_surfer.setPlaybackRate(newSpeed)
      this.speedText = `${newSpeed}x` // Update the speed display text
    },

    setVolume() {
      if (this.wave_surfer) {
        this.wave_surfer.setVolume(this.volume)
      }
    },
  
  }
}
</script>

<style scoped>
.waveform-container {
  position: relative;
}

.controls-row {
    display: flex;
    /* align-items: center; */
    /* justify-content: center; */
    gap: 10px; /* Adds spacing between buttons */
    margin-top: 10px;
  }

  .volume-col {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .volume-slider {
    width: 100px; /* Adjust slider width */
    max-width: 120px;
  }

  .v-btn {
    min-width: 40px; /* Ensures buttons are square */
    height: 40px;
  }

  .v-icon {
    font-size: 24px;
  }
</style>
