<template>
    <div :class="['timeline-bar-fixed', { minimized: !drawer }]" style="height: auto;">
        <!-- Row 0: Botón de dropdown -->

        <v-btn icon @click="playPauseVideo('hiddenVideo')" color="success"
            style="position: absolute; margin-left: 50px">
            <v-icon>{{ playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
        <v-btn icon @click="toggleTimeline" color="primary" style="position: absolute;">
            <v-icon>{{ drawer ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
        </v-btn>
        <v-container class="d-flex align-center justify-center" style="height: 56px;">
            <v-slider v-model="sliderValue" :min="0"
                :max="$refs.hiddenVideo && $refs.hiddenVideo.duration ? $refs.hiddenVideo.duration : 100" step="0.05"
                style="width: 100%;" @update:modelValue="onSliderChange" @end="onSliderChange" />
        </v-container>


        <v-container class="pt-0 ">
            <template v-if="drawer">
                <div class="timeline-row thumbnails-row col-12">
                    <div v-for="(thumb, i) in thumbnails" :key="'webcam' + i" class="timeline-thumb"
                        :class="{ selected: selectedType === 'webcam' && selectedIdx === i }">
                        <img v-if="thumb" :src="thumb" :alt="'Miniatura ' + i" width="64" height="36" />
                        <v-skeleton-loader v-else type="image" width="64px" height="36px" />
                    </div>
                    <div v-if="selectedType === 'webcam'" class="vertical-line"
                        :style="{ left: `calc(${(selectedIdx + 0.5) / thumbnails.length * 100}% - 1px)` }"></div>
                </div>
                <!-- Row 2: Miniaturas pantalla -->
                <div class="timeline-row thumbnails-row col-12">
                    <div v-for="(thumb, i) in thumbnails2" :key="'screen' + i" class="timeline-thumb"
                        :class="{ selected: selectedType === 'screen' && selectedIdx === i }">
                        <img v-if="thumb" :src="thumb" :alt="'Miniatura pantalla ' + i" width="64" height="36" />
                        <v-skeleton-loader v-else type="image" width="64px" height="36px" />
                    </div>
                    <div v-if="selectedType === 'screen'" class="vertical-line"
                        :style="{ left: `calc(${(selectedIdx + 0.5) / thumbnails2.length * 100}% - 1px)` }"></div>
                </div>
                <!-- Row 3: Audio moderador -->
                <div class="timeline-row waveform-row col-12">
                    <div class="waveform-track waveform-bar-style">
                        <span class="waveform-label">Moderador</span>
                        <div class="waveform-bars">
                            <div v-for="i in 100" :key="i"
                                :class="{ selected: selectedType === 'moderador' && selectedIdx === i }" :style="{
                                    height: (Math.random() * 24 + 8) + 'px',
                                    width: '4px',
                                    background: i > 25 && i < 50 ? '#388e3c' : '#ccc',
                                    marginRight: '2px',
                                    display: 'inline-block',
                                    borderRadius: '2px',
                                    opacity: i > 25 && i < 50 ? 0.9 : 0.6,
                                    verticalAlign: 'bottom',
                                    cursor: 'default',
                                }"></div>
                            <div v-if="selectedType === 'moderador'" class="vertical-line"
                                :style="{ left: `calc(${(selectedIdx + 0.5) / 100 * 100}% - 1px)` }"></div>
                        </div>
                    </div>
                </div>
                <!-- Row 4: Audio usuario -->
                <div class="timeline-row waveform-row col-12">
                    <div class="waveform-track waveform-bar-style">
                        <span class="waveform-label">Usuario</span>
                        <div class="waveform-bars">
                            <div v-for="i in 100" :key="i"
                                :class="{ selected: selectedType === 'usuario' && selectedIdx === i }" :style="{
                                    height: (Math.random() * 24 + 8) + 'px',
                                    width: '4px',
                                    background: i > 25 && i < 50 ? '#1976D2' : '#ccc',
                                    marginRight: '2px',
                                    display: 'inline-block',
                                    borderRadius: '2px',
                                    opacity: i > 25 && i < 50 ? 0.9 : 0.6,
                                    verticalAlign: 'bottom',
                                    cursor: 'default',
                                }"></div>
                            <div v-if="selectedType === 'usuario'" class="vertical-line"
                                :style="{ left: `calc(${(selectedIdx + 0.5) / 100 * 100}% - 1px)` }"></div>
                        </div>
                    </div>
                </div>
            </template>
        </v-container>
    </div>
    <video ref="hiddenVideo" :src="require('@/assets/videos/video1.mp4')" style="display:none"
        @loadedmetadata="generateThumbnails" />
    <video ref="hiddenVideo2" :src="require('@/assets/videos/video2.mp4')" style="display:none"
        @loadedmetadata="generateThumbnails2" />
</template>

<script>
export default {
    props: {
        currentTime: {
            type: Number,
            default: 0
        },
        duration: {
            type: Number,
            default: 100
        },
        playing: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        currentTime(newVal) {
            this.sliderValue = newVal;
        },
        duration(newVal) {
            this.sliderMax = newVal;
        }
    },
    // Eliminado mounted con $root.$on
    name: 'SessionTimeline',
    data() {
        return {
            expanded: true,
            drawer: true,
            thumbnails: Array(10).fill(null),
            thumbnails2: Array(10).fill(null),
            generating: false,
            generating2: false,
            selectedIdx: null,
            selectedType: null,
            isPlaying1: false,
            isPlaying2: false,
            sliderValue: 0,
            sliderMax: 100
        }
    },
    methods: {
        onSliderChange(val) {
            console.log('ola');
            console.log('[SessionTimeline] onSliderChange:', val);
            this.selectedIdx = val;
            // Emitir el tiempo absoluto al padre para buscar el video
            console.log('[SessionTimeline] emit timeline-selected:', val);
            this.$emit('timeline-selected', val);
        },
        toggleTimeline() {
            this.drawer = !this.drawer;
        },
        playPauseVideo(refName) {
            this.$emit('play-pause', refName);
        },
        async generateThumbnails() {
            if (this.generating) return;
            this.generating = true;
            const video = this.$refs.hiddenVideo;
            // Emitir la duración real al padre para ajustar el slider
            console.log('[SessionTimeline] Duración real del video:', video.duration);
            this.$emit('video-duration', video.duration);
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 36;
            const ctx = canvas.getContext('2d');
            const duration = video.duration;
            const steps = this.thumbnails.length;
            let thumbs = [...this.thumbnails];
            for (let i = 0; i < steps; i++) {
                const time = (duration / (steps + 1)) * (i + 1);
                await this.seekVideo(video, time);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                thumbs[i] = canvas.toDataURL('image/png');
            }
            this.thumbnails = thumbs;
            this.generating = false;
        },
        async generateThumbnails2() {
            if (this.generating2) return;
            this.generating2 = true;
            const video = this.$refs.hiddenVideo2;
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 36;
            const ctx = canvas.getContext('2d');
            const duration = video.duration;
            const steps = this.thumbnails2.length;
            let thumbs = [...this.thumbnails2];
            for (let i = 0; i < steps; i++) {
                const time = (duration / (steps + 1)) * (i + 1);
                await this.seekVideo(video, time);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                thumbs[i] = canvas.toDataURL('image/png');
            }
            this.thumbnails2 = thumbs;
            this.generating2 = false;
        },
        seekVideo(video, time) {
            return new Promise((resolve) => {
                const handler = () => {
                    video.removeEventListener('seeked', handler);
                    resolve();
                };
                video.addEventListener('seeked', handler);
                video.currentTime = time;
            });
        }
    }
}
</script>

<style scoped>
::v-deep .v-slider-thumb__ripple::after {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    top: 30px;
    transform: translateX(-50%);
    width: 5px;
    height: 250px;
    background: #ff0000;
    border-radius: 2px;
    z-index: 9999999999;
}

/* Línea vertical que sale del thumb del slider */
.v-slider-thumb__ripple {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    width: 3px;
    height: 300px;
    background: #ff0000;
    border-radius: 2px;
    z-index: 2;
}


.session-timeline {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    background: #f5f5f5;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    padding: 8px 0 0 0;
    z-index: 9999;
    transition: height 0.3s;
}

.session-timeline.minimized {
    height: 60px;
    overflow: hidden;
}

.timeline-toggle {
    width: 100%;
    text-align: center;
    cursor: pointer;
    padding-bottom: 4px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.timeline-row {
    display: flex;
    align-items: center;
    margin-bottom: 2px;
    padding-bottom: 0;
    padding-top: 0;
    position: relative;
    background: var(--v-theme-primary);
    border-radius: 8px;
}

.thumbnails-row.col-12 {
    display: flex;
    flex-wrap: nowrap;
    gap: 0;
    padding-left: 0;
    justify-content: stretch;
    border: 2px solid red;
    border-radius: 8px;
}

.timeline-thumb {
    flex: 1 1 0;
    min-width: 0;
    height: 36px;
    border: none;
    border-radius: 0;
    background: #fff;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin: 0;
    padding: 0;
}

.timeline-thumb:first-child {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
}

.timeline-thumb:last-child {
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
}

.timeline-thumb.selected::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    background: red;
    z-index: 10;
}

.timeline-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    border: none;
    background: #eee;
}

.waveform-row {
    width: 100%;
}

.waveform-track {
    width: 100%;
    height: 32px;
    position: relative;
}

.waveform-bar-style {
    display: flex;
    align-items: flex-end;
    height: 40px;
    position: relative;
}

.waveform-bars {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-end;
    height: 40px;
    margin-left: 0;
}

.waveform-bars .vertical-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: red;
    z-index: 10;
}

.waveform-bars>div {
    flex: 1 1 0;
    min-width: 4px;
    max-width: 1fr;
}

.waveform-bars>div.selected {
    box-shadow: 0 0 0 2px red;
}

.waveform-label {
    position: absolute;
    left: 8px;
    top: 2px;
    z-index: 2;
    background: rgba(255, 255, 255, 0.7);
    padding: 0 6px;
    border-radius: 4px;
    font-size: 12px;
}

.timeline-drawer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 260px;
    background: #f5f5f5;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    z-index: 9999;
    transition: transform 0.3s ease;
}

.timeline-drawer .timeline-toggle {
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
}

.timeline-drawer .timeline-row {
    cursor: pointer;
}

.timeline-drawer .timeline-row:hover {
    background: rgba(0, 0, 0, 0.02);
}

.timeline-drawer .thumbnails-row {
    justify-content: flex-start;
}


.timeline-drawer .waveform-label {
    display: none;
}

.timeline-bar-fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    background: #f5f5f5;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    z-index: 9999;
    transition: height 0.3s;
    padding: 8px 0 0 0;
}

.timeline-bar-fixed.minimized {
    height: 60px;
    overflow: hidden;
}

.timeline-bar-fixed .timeline-toggle {
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
}

.timeline-bar-fixed .timeline-row {
    cursor: pointer;
}

.timeline-bar-fixed .timeline-row:hover {
    background: rgba(0, 0, 0, 0.02);
}

.timeline-bar-fixed .thumbnails-row {
    justify-content: flex-start;
}

.timeline-bar-fixed .waveform-label {
    display: none;
}
</style>
