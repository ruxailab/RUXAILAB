<template>
  <div>
    <v-alert
      v-if="!annotations.length"
      type="info"
      variant="tonal"
      density="comfortable"
    >
      {{ $t('analytics.testDetails.noNotes') }}
    </v-alert>

    <template v-else>
      <div class="d-flex flex-wrap align-center ga-2 mb-2">
        <v-chip size="small" variant="tonal" prepend-icon="mdi-map-marker">
          {{
            $t('analytics.testDetails.pointsOfInterestCount', {
              count: markers.length,
            })
          }}
        </v-chip>
        <v-chip size="small" variant="tonal" prepend-icon="mdi-selection-drag">
          {{
            $t('analytics.testDetails.segmentsCount', {
              count: segments.length,
            })
          }}
        </v-chip>
      </div>
      <div class="text-caption text-medium-emphasis mb-3">
        {{ $t('analytics.testDetails.annotationsHint') }}
      </div>

      <div class="annotation-list" data-testid="annotation-list">
        <div
          v-for="annotation in annotations"
          :key="annotation.id"
          class="annotation-item"
          :class="{
            'annotation-item--active': annotation.id === activeId,
            'annotation-item--editing': annotation.id === editingId,
          }"
          :data-testid="`annotation-${annotation.id}`"
          @click="onItemClick(annotation)"
        >
          <span
            class="annotation-icon"
            :style="{ backgroundColor: annotation.color }"
          >
            <v-icon size="14" color="white">{{ annotation.icon }}</v-icon>
          </span>

          <div class="annotation-body">
            <div class="annotation-meta text-caption">
              <span class="annotation-time">{{ annotation.timeLabel }}</span>
              · {{ annotation.typeLabel }} · {{ annotation.authorName }}
            </div>

            <div v-if="annotation.id === editingId" class="mt-1" @click.stop>
              <v-text-field
                ref="editInput"
                v-model="draft"
                density="compact"
                variant="outlined"
                hide-details
                autofocus
                data-testid="annotation-edit-input"
                @keydown.enter.prevent="saveEdit(annotation)"
                @keydown.esc.stop.prevent="cancelEdit"
              />
              <div class="d-flex justify-end ga-2 mt-2">
                <v-btn size="small" variant="text" @click="cancelEdit">
                  {{ $t('analytics.testDetails.cancelEdit') }}
                </v-btn>
                <v-btn
                  size="small"
                  color="#FB5C6C"
                  variant="flat"
                  :disabled="!draft.trim()"
                  data-testid="annotation-edit-save"
                  @click="saveEdit(annotation)"
                >
                  {{ $t('analytics.testDetails.saveAnnotation') }}
                </v-btn>
              </div>
            </div>
            <div v-else class="annotation-comment text-body-2">
              {{ annotation.item.comment }}
            </div>
          </div>

          <div
            v-if="annotation.id !== editingId"
            class="annotation-actions"
            @click.stop
          >
            <v-btn
              icon="mdi-pencil-outline"
              size="x-small"
              variant="text"
              :title="$t('analytics.testDetails.editAnnotation')"
              :aria-label="$t('analytics.testDetails.editAnnotation')"
              :data-testid="`annotation-edit-${annotation.id}`"
              @click="startEdit(annotation)"
            />
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              :title="annotation.deleteLabel"
              :aria-label="annotation.deleteLabel"
              @click="emit('remove', annotation)"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/shared/utils/timeUtils'

const props = defineProps({
  markers: { type: Array, default: () => [] },
  segments: { type: Array, default: () => [] },
  currentTime: { type: Number, default: 0 },
})

const emit = defineEmits(['seek', 'remove', 'update'])
const { t } = useI18n()

const editingId = ref(null)
const draft = ref('')

const ACTIVE_POINT_WINDOW = 1

const annotations = computed(() => {
  const unknown = t('analytics.testDetails.unknownAuthor')
  const points = props.markers.map((marker) => ({
    id: marker.id,
    type: 'marker',
    item: marker,
    start: marker.time,
    end: marker.time,
    icon: 'mdi-map-marker',
    color: marker.color || '#1E88E5',
    authorName: marker.authorName || unknown,
    typeLabel: t('analytics.testDetails.pointOfInterest'),
    timeLabel: formatTime(marker.time),
    deleteLabel: t('analytics.testDetails.deletePoint'),
  }))
  const ranges = props.segments.map((segment) => {
    const start = Math.min(segment.startTime, segment.endTime)
    const end = Math.max(segment.startTime, segment.endTime)
    return {
      id: segment.id,
      type: 'segment',
      item: segment,
      start,
      end,
      icon: 'mdi-selection-drag',
      color: segment.color || '#1E88E5',
      authorName: segment.authorName || unknown,
      typeLabel: t('analytics.testDetails.segment'),
      timeLabel: `${formatTime(start)} – ${formatTime(end)}`,
      deleteLabel: t('analytics.testDetails.deleteSegment'),
    }
  })
  return [...points, ...ranges].sort((a, b) => a.start - b.start)
})

const activeId = computed(() => {
  const time = props.currentTime
  const active = annotations.value.find((annotation) =>
    annotation.type === 'segment'
      ? time >= annotation.start && time <= annotation.end
      : Math.abs(time - annotation.start) < ACTIVE_POINT_WINDOW,
  )
  return active?.id ?? null
})

function onItemClick(annotation) {
  if (annotation.id === editingId.value) return
  emit('seek', annotation.start)
}

function startEdit(annotation) {
  editingId.value = annotation.id
  draft.value = annotation.item.comment || ''
}

function cancelEdit() {
  editingId.value = null
  draft.value = ''
}

function saveEdit(annotation) {
  const comment = draft.value.trim()
  if (!comment) return
  if (comment !== annotation.item.comment) {
    emit('update', { type: annotation.type, item: annotation.item, comment })
  }
  cancelEdit()
}

// Drop an edit in progress if its annotation disappears (task change, delete).
watch(annotations, (list) => {
  if (editingId.value && !list.some((a) => a.id === editingId.value)) {
    cancelEdit()
  }
})
</script>

<style scoped>
.annotation-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.annotation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.annotation-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.annotation-item--active {
  background: rgba(251, 92, 108, 0.12);
  box-shadow: inset 3px 0 0 #fb5c6c;
}

.annotation-item--editing {
  cursor: default;
}

.annotation-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-top: 2px;
  border-radius: 50%;
  flex-shrink: 0;
}

.annotation-body {
  flex: 1 1 auto;
  min-width: 0;
}

.annotation-meta {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.annotation-time {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface));
}

.annotation-comment {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.annotation-actions {
  display: flex;
  flex-shrink: 0;
  opacity: 0.55;
  transition: opacity 0.2s ease;
}

.annotation-item:hover .annotation-actions,
.annotation-item:focus-within .annotation-actions {
  opacity: 1;
}
</style>
