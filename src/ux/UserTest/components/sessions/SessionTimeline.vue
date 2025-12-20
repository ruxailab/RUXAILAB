<template>
    <v-card class="timeline-wrapper rounded-t-xl border-t-lg">
        <!-- Botão Play/Pause -->
        <v-btn icon color="green" @click="$emit('togglePlay')">
            <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>

        <!-- Linha de progresso -->
        <div class="timeline-bar" @click="seek($event)" @mousedown="startDrag" ref="bar">
            <div class="timeline-track" :style="{ width: progress + '%' }"></div>
            <div class="timeline-thumb" :style="{ left: progress + '%' }"></div>
        </div>

        <!-- Duração -->
        <span style="width: 60px; text-align: right;">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>
    </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    duration: { type: Number, required: true },
    currentTime: { type: Number, required: true },
    isPlaying: { type: Boolean, default: false }
})

const emit = defineEmits(['seek', 'togglePlay'])
const bar = ref(null)
const dragging = ref(false)

const progress = computed(() => {
    if (!props.duration || props.duration === 0) return 0
    return Math.min((props.currentTime / props.duration) * 100, 100)
})

const seek = (event) => {
    const rect = bar.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const ratio = Math.min(Math.max(x / rect.width, 0), 1)
    emit('seek', ratio * props.duration)
}

function startDrag(event) {
    dragging.value = true
    seek(event)
    window.addEventListener('mousemove', drag)
    window.addEventListener('mouseup', stopDrag)
}
function drag(event) { if (dragging.value) seek(event) }
function stopDrag() {
    dragging.value = false
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('mouseup', stopDrag)
}

function formatTime(sec) {
    if (!sec) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.timeline-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 100px;
    background-color: #f7f7f7;
}

.timeline-bar {
    flex-grow: 1;
    height: 8px;
    background-color: #cfd8dc;
    border-radius: 4px;
    position: relative;
    cursor: pointer;
}

.timeline-track {
    position: absolute;
    height: 100%;
    background-color: #64b5f6;
    border-radius: 4px;
    top: 0;
    display: flex;
}

.timeline-thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #1e88e5;
    pointer-events: none;
}
</style>
