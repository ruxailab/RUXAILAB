<template>
  <v-card
    v-if="timeline && timeline.length > 0"
    variant="outlined"
    elevation="2"
    rounded="xl"
    class="pa-4 mt-4"
  >
    <!-- Header -->
    <v-row align="center" class="mb-3">
      <v-col cols="auto">
        <h4 class="text-subtitle-1 font-weight-medium">Emotion Timeline</h4>
        <div class="text-body-2 text-grey">
          Dominant emotion across each time segment
        </div>
      </v-col>
      <v-spacer />
      <!-- Legend -->
      <v-col cols="auto">
        <div class="d-flex flex-wrap gap-2 justify-end">
          <v-chip
            v-for="(color, emotion) in EMOTION_COLORS"
            :key="emotion"
            size="x-small"
            :color="color"
            variant="flat"
            class="text-white font-weight-medium"
          >
            {{ emotion }}
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <!-- Timeline Bar -->
    <div class="timeline-track-wrapper">
      <div
        v-for="segment in normalizedSegments"
        :key="segment.id"
        class="timeline-segment"
        :style="{
          width: segment.widthPercent + '%',
          backgroundColor: getSegmentColor(segment.emotion),
        }"
        @mouseenter="showTooltip($event, segment)"
        @mouseleave="hideTooltip"
      >
        <!-- Inner label: only render when segment is wide enough to fit text -->
        <span v-if="segment.widthPercent > 8" class="segment-label">
          {{ segment.emotion }}
        </span>
      </div>
    </div>

    <!-- Time axis labels -->
    <div class="d-flex justify-space-between mt-1">
      <span class="text-caption text-grey">{{ timelineStart }}</span>
      <span class="text-caption text-grey">{{ timelineEnd }}</span>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="emotion-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-emotion">{{ tooltip.emotion }}</div>
      <div class="tooltip-time">
        {{ tooltip.startTime }} – {{ tooltip.endTime }}
      </div>
      <div class="tooltip-value">Intensity: {{ tooltip.value }}</div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

// ---------------------------------------------------------------------------
// Centralized emotion color mapping (UPPERCASE keys matching API contract)
// ---------------------------------------------------------------------------
const EMOTION_COLORS = {
  HAPPY: '#66BB6A', // green
  SAD: '#EF5350', // red
  ANGRY: '#D32F2F', // deep red
  SURPRISED: '#FFA726', // amber
  NEUTRAL: '#78909C', // blue-grey
  DISGUSTED: '#8D6E63', // brown
  FEARFUL: '#5C6BC0', // indigo
}

const DEFAULT_COLOR = '#BDBDBD'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
const props = defineProps({
  /**
   * Array of timeline segments returned by the Sentiment Analysis API.
   * Each item: { id, starting_time, ending_time, emotion, value }
   * Accepts null / undefined gracefully.
   */
  timeline: {
    type: Array,
    default: null,
  },
})

// ---------------------------------------------------------------------------
// Tooltip state
// ---------------------------------------------------------------------------
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  emotion: '',
  startTime: '',
  endTime: '',
  value: 0,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert "MM:SS" string to total seconds.
 */
function timeToSeconds(timeStr) {
  if (!timeStr) return 0
  const parts = timeStr.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

function getSegmentColor(emotion) {
  return EMOTION_COLORS[emotion?.toUpperCase()] ?? DEFAULT_COLOR
}

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

const normalizedSegments = computed(() => {
  if (!props.timeline || props.timeline.length === 0) return []

  const totalStart = timeToSeconds(props.timeline[0].starting_time)
  const totalEnd = timeToSeconds(
    props.timeline[props.timeline.length - 1].ending_time,
  )
  const totalDuration = totalEnd - totalStart

  if (totalDuration <= 0) return []

  return props.timeline.map((seg) => {
    const segStart = timeToSeconds(seg.starting_time)
    const segEnd = timeToSeconds(seg.ending_time)
    const duration = segEnd - segStart
    const widthPercent = (duration / totalDuration) * 100

    return {
      id: seg.id,
      emotion: (seg.emotion ?? '').toUpperCase(),
      startTime: seg.starting_time,
      endTime: seg.ending_time,
      value: seg.value,
      widthPercent,
    }
  })
})

const timelineStart = computed(() => props.timeline?.[0]?.starting_time ?? '')
const timelineEnd = computed(
  () => props.timeline?.[props.timeline.length - 1]?.ending_time ?? '',
)

// ---------------------------------------------------------------------------
// Tooltip handlers
// ---------------------------------------------------------------------------

function showTooltip(event, segment) {
  const rect = event.currentTarget.getBoundingClientRect()
  const wrapperRect = event.currentTarget
    .closest('.timeline-track-wrapper')
    .getBoundingClientRect()

  tooltip.value = {
    visible: true,
    // Position relative to the wrapper so the tooltip stays within the card
    x: rect.left - wrapperRect.left + rect.width / 2,
    y: rect.top - wrapperRect.top - 72, // above the bar
    emotion: segment.emotion,
    startTime: segment.startTime,
    endTime: segment.endTime,
    value: segment.value,
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}
</script>

<style scoped>
.timeline-track-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  height: 40px;
  border-radius: 8px;
  overflow: visible;
  border: 1px solid #e0e0e0;
}

.timeline-segment {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.15s ease;
  overflow: hidden;
}

.timeline-segment:first-child {
  border-radius: 8px 0 0 8px;
}

.timeline-segment:last-child {
  border-radius: 0 8px 8px 0;
}

.timeline-segment:only-child {
  border-radius: 8px;
}

.timeline-segment:hover {
  filter: brightness(1.15);
  z-index: 1;
}

.segment-label {
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
  pointer-events: none;
  user-select: none;
}

.emotion-tooltip {
  position: absolute;
  z-index: 100;
  background: rgba(33, 33, 33, 0.92);
  color: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
  transform: translateX(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tooltip-emotion {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 2px;
}

.tooltip-time {
  color: #bdbdbd;
  margin-bottom: 2px;
}

.tooltip-value {
  color: #ffe082;
  font-weight: 500;
}
</style>
