<template>
  <v-card class="timeline-wrapper rounded-t-xl" elevation="8">
    <!-- Botão Play/Pause -->
    <v-btn
      icon
      color="#FB5C6C"
      variant="tonal"
      size="small"
      :title="$t('analytics.testDetails.timeline.togglePlay')"
      :aria-label="$t('analytics.testDetails.timeline.togglePlay')"
      @click="$emit('togglePlay')"
    >
      <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
    </v-btn>

    <!-- Linha de progresso -->
    <div
      ref="bar"
      class="timeline-bar"
      @click="seek($event)"
      @mousedown="startDrag"
    >
      <div class="timeline-track" :style="{ width: progress + '%' }" />

      <!-- Silences detected from the transcription -->
      <v-tooltip
        v-for="silence in silences"
        :key="`silence-${silence.start}`"
        location="top"
      >
        <template #activator="{ props: tooltipProps }">
          <button
            v-bind="tooltipProps"
            type="button"
            class="timeline-silence"
            data-testid="timeline-silence"
            :aria-label="
              $t('analytics.testDetails.timeline.silence', {
                duration: formatDuration(silence),
              })
            "
            :style="{
              left: segmentPosition(silence.start) + '%',
              width:
                segmentWidth({
                  startTime: silence.start,
                  endTime: silence.end,
                }) + '%',
            }"
            @click.stop="$emit('seek', silence.start)"
          />
        </template>
        <div class="marker-tooltip">
          <div class="d-flex align-center ga-1 font-weight-bold">
            <v-icon size="14">mdi-volume-off</v-icon>
            {{
              $t('analytics.testDetails.timeline.silence', {
                duration: formatDuration(silence),
              })
            }}
          </div>
          <div>
            {{
              $t('analytics.testDetails.timeline.silenceHint', {
                start: formatTime(silence.start),
                end: formatTime(silence.end),
              })
            }}
          </div>
        </div>
      </v-tooltip>

      <!-- Segments (tramos) -->
      <v-tooltip v-for="segment in segments" :key="segment.id" location="top">
        <template #activator="{ props: tooltipProps }">
          <button
            v-bind="tooltipProps"
            type="button"
            class="timeline-segment"
            :style="{
              left: segmentPosition(segment.startTime) + '%',
              width: segmentWidth(segment) + '%',
              backgroundColor: segment.color || '#1E88E5',
            }"
            @click.stop="$emit('seek', segment.startTime)"
          />
        </template>
        <div class="marker-tooltip">
          <div class="d-flex align-center ga-1 font-weight-bold">
            <span
              class="marker-author-dot"
              :style="{ backgroundColor: segment.color || '#1E88E5' }"
            />
            {{
              segment.authorName || $t('analytics.testDetails.unknownAuthor')
            }}
            · {{ formatTime(segment.startTime) }} -
            {{ formatTime(segment.endTime) }}
          </div>
          <div>{{ segment.comment }}</div>
        </div>
      </v-tooltip>

      <!-- In-progress segment being marked -->
      <div
        v-if="segmentDraftStart !== null"
        class="timeline-segment timeline-segment-draft"
        :style="{
          left: segmentPosition(segmentDraftStart) + '%',
          width:
            segmentWidth({
              startTime: segmentDraftStart,
              endTime: currentTime,
            }) + '%',
        }"
      />

      <div class="timeline-thumb" :style="{ left: progress + '%' }" />

      <!-- Points of interest -->
      <v-tooltip v-for="marker in markers" :key="marker.id" location="top">
        <template #activator="{ props: tooltipProps }">
          <button
            v-bind="tooltipProps"
            type="button"
            class="timeline-marker"
            :style="{
              left: markerPosition(marker) + '%',
              backgroundColor: marker.color || '#1E88E5',
            }"
            @click.stop="$emit('seek', marker.time)"
          >
            <v-icon size="14" color="white">mdi-map-marker</v-icon>
          </button>
        </template>
        <div class="marker-tooltip">
          <div class="d-flex align-center ga-1 font-weight-bold">
            <span
              class="marker-author-dot"
              :style="{ backgroundColor: marker.color || '#1E88E5' }"
            />
            {{ marker.authorName || $t('analytics.testDetails.unknownAuthor') }}
            · {{ formatTime(marker.time) }}
          </div>
          <div>{{ marker.comment }}</div>
        </div>
      </v-tooltip>
    </div>

    <!-- Duração -->
    <span class="timeline-time">
      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
    </span>

    <!-- Add point of interest -->
    <v-menu
      v-model="addMenuOpen"
      :close-on-content-click="false"
      location="top"
      @after-enter="focusMarkerComment"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          icon
          variant="tonal"
          size="small"
          color="grey-darken-1"
          :title="$t('analytics.testDetails.timeline.addPoint')"
          @click="openAddMenu"
        >
          <v-icon size="18">mdi-map-marker-plus-outline</v-icon>
        </v-btn>
      </template>
      <v-card min-width="280" class="pa-3">
        <div class="text-caption font-weight-medium mb-2">
          {{
            $t('analytics.testDetails.timeline.addPointAt', {
              time: formatTime(currentTime),
            })
          }}
        </div>
        <v-textarea
          ref="markerCommentInput"
          v-model="newMarkerComment"
          rows="2"
          density="compact"
          variant="outlined"
          hide-details
          autofocus
          :placeholder="$t('analytics.testDetails.timeline.commentPlaceholder')"
          @keydown.enter.exact.prevent="confirmAddMarker"
        />
        <div class="d-flex justify-end mt-2 ga-2">
          <v-btn size="small" variant="text" @click="addMenuOpen = false">
            {{ $t('analytics.testDetails.timeline.cancel') }}
          </v-btn>
          <v-btn
            size="small"
            color="#FB5C6C"
            variant="flat"
            :disabled="!newMarkerComment.trim()"
            @click="confirmAddMarker"
          >
            {{ $t('analytics.testDetails.timeline.add') }}
          </v-btn>
        </div>
      </v-card>
    </v-menu>

    <!-- Mark a segment (tramo) -->
    <div class="segment-controls">
      <v-btn
        v-if="segmentDraftStart === null"
        color="#FB5C6C"
        variant="tonal"
        size="small"
        prepend-icon="mdi-selection-drag"
        @click="setSegmentStart"
      >
        {{ $t('analytics.testDetails.timeline.startSegment') }}
      </v-btn>

      <template v-else>
        <v-chip size="small" color="#FB5C6C" variant="tonal">
          {{ formatTime(segmentDraftStart) }} - {{ formatTime(currentTime) }}
        </v-chip>
        <v-text-field
          ref="segmentCommentInput"
          v-model="newSegmentComment"
          density="compact"
          variant="outlined"
          hide-details
          :placeholder="$t('analytics.testDetails.timeline.segmentPlaceholder')"
          class="segment-comment-input"
          @keydown.enter.prevent="confirmAddSegment"
          @keydown.esc.stop="cancelSegmentMarking"
        />
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          :title="$t('analytics.testDetails.timeline.cancelSegment')"
          @click="cancelSegmentMarking"
        />
        <v-btn
          color="#FB5C6C"
          variant="flat"
          size="small"
          :disabled="!newSegmentComment.trim()"
          @click="confirmAddSegment"
        >
          {{ $t('analytics.testDetails.timeline.saveSegment') }}
        </v-btn>
      </template>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { formatTime } from '@/shared/utils/timeUtils'

const props = defineProps({
  duration: { type: Number, required: true },
  currentTime: { type: Number, required: true },
  isPlaying: { type: Boolean, default: false },
  markers: { type: Array, default: () => [] },
  segments: { type: Array, default: () => [] },
  // [{ start, end }] in seconds, on the same clock as `currentTime`.
  silences: { type: Array, default: () => [] },
})

const emit = defineEmits(['seek', 'togglePlay', 'add-marker', 'add-segment'])
const bar = ref(null)
const dragging = ref(false)
const addMenuOpen = ref(false)
const newMarkerComment = ref('')
const newSegmentComment = ref('')
const segmentDraftStart = ref(null)
const markerCommentInput = ref(null)
const segmentCommentInput = ref(null)

const progress = computed(() => {
  if (!props.duration || props.duration === 0) return 0
  return Math.min((props.currentTime / props.duration) * 100, 100)
})

const markerPosition = (marker) => {
  if (!props.duration || props.duration === 0) return 0
  return Math.min((marker.time / props.duration) * 100, 100)
}

const segmentPosition = (startTime) => {
  if (!props.duration || props.duration === 0) return 0
  return Math.min((startTime / props.duration) * 100, 100)
}

const segmentWidth = (segment) => {
  if (!props.duration || props.duration === 0) return 0
  const start = Math.min(segment.startTime, segment.endTime)
  const end = Math.max(segment.startTime, segment.endTime)
  return Math.min(
    ((end - start) / props.duration) * 100,
    100 - segmentPosition(start),
  )
}

const formatDuration = ({ start, end }) => `${Math.round(end - start)} s`

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
function drag(event) {
  if (dragging.value) seek(event)
}
function stopDrag() {
  dragging.value = false
  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', stopDrag)
}

function openAddMenu() {
  newMarkerComment.value = ''
  addMenuOpen.value = true
  focusMarkerComment()
}

function focusMarkerComment() {
  nextTick(() => markerCommentInput.value?.focus())
}

function confirmAddMarker() {
  if (!newMarkerComment.value.trim()) return
  emit('add-marker', {
    time: props.currentTime,
    comment: newMarkerComment.value.trim(),
  })
  addMenuOpen.value = false
}

function setSegmentStart() {
  segmentDraftStart.value = props.currentTime
  newSegmentComment.value = ''
  nextTick(() => segmentCommentInput.value?.focus())
}

function cancelSegmentMarking() {
  segmentDraftStart.value = null
  newSegmentComment.value = ''
}

function confirmAddSegment() {
  if (!newSegmentComment.value.trim() || segmentDraftStart.value === null)
    return
  emit('add-segment', {
    startTime: Math.min(segmentDraftStart.value, props.currentTime),
    endTime: Math.max(segmentDraftStart.value, props.currentTime),
    comment: newSegmentComment.value.trim(),
  })
  segmentDraftStart.value = null
  newSegmentComment.value = ''
}

defineExpose({ openAddMenu, setSegmentStart })
</script>

<style scoped>
.timeline-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background-color: #ffffff;
}

.timeline-time {
  width: 96px;
  text-align: right;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.segment-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
}

.segment-comment-input {
  width: 220px;
}

.timeline-bar {
  flex-grow: 1;
  height: 6px;
  background-color: #e4e7ec;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.timeline-track {
  position: absolute;
  height: 100%;
  background-color: #fb5c6c;
  border-radius: 4px;
  top: 0;
}

.timeline-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #fb5c6c;
  box-shadow: 0 0 0 3px rgba(251, 92, 108, 0.2);
  pointer-events: none;
}

.timeline-segment {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 4px;
  opacity: 0.45;
  cursor: pointer;
  border: none;
  padding: 0;
  z-index: 1;
}

.timeline-segment:hover {
  opacity: 0.65;
}

.timeline-silence {
  position: absolute;
  top: 0;
  height: 100%;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: repeating-linear-gradient(
    -45deg,
    rgba(71, 84, 103, 0.55) 0 3px,
    rgba(71, 84, 103, 0.15) 3px 6px
  );
  cursor: pointer;
  z-index: 1;
}

.timeline-silence:hover {
  background: rgba(71, 84, 103, 0.7);
}

.timeline-segment-draft {
  background-color: #fb5c6c;
  opacity: 0.3;
  pointer-events: none;
}

.timeline-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 18px;
  height: 18px;
  border-radius: 50% 50% 50% 0;
  transform: translate(-50%, -70%) rotate(-45deg);
  background-color: #1e88e5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.timeline-marker :deep(.v-icon) {
  transform: rotate(45deg);
}

.marker-tooltip {
  max-width: 220px;
}

.marker-author-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
