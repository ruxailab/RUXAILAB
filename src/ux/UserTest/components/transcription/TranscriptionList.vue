<template>
  <v-sheet
    v-if="transcriptSegments.length"
    class="pa-4 mt-4 rounded-lg"
    color="#fffef5"
  >
    <v-timeline side="end" density="comfortable">
      <v-timeline-item
        v-for="segment in transcriptSegments"
        :key="segment.id"
        :dot-color="
          segment.role === 'moderator' ? 'blue-darken-2' : 'orange-darken-2'
        "
        :icon="
          segment.role === 'moderator'
            ? 'mdi-account-tie'
            : 'mdi-laptop-account'
        "
        size="small"
      >
        <div class="text-grey-darken-2 font-weight-medium">
          <span class="font-weight-bold"
            >{{ formatTime(segment.start) }}–{{ formatTime(segment.end) }}</span
          >
          &nbsp; {{ segment.text }}
        </div>
      </v-timeline-item>
    </v-timeline>
  </v-sheet>
</template>

<script setup>
// JS props (no types)
const props = defineProps({
  transcriptSegments: {
    type: Array,
    required: true,
    default: () => [],
  },
})

function formatTime(seconds) {
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${min}:${sec}`
}
</script>
