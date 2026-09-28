<template>
  <div class="thematic-editor">
    <div class="thematic-editor__toolbar d-flex align-center ga-2 mb-4">
      <v-icon icon="mdi-shape-plus-outline" color="primary" size="20" />
      <v-text-field
        v-model="newThemeLabel"
        density="compact"
        variant="outlined"
        hide-details
        :label="$t('focusGroup.answers.newThemeLabel')"
        class="thematic-editor__new-theme-input"
        @keydown.enter="addTheme"
      />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="text-none"
        :disabled="!newThemeLabel.trim()"
        @click="addTheme"
      >
        {{ $t('focusGroup.answers.addTheme') }}
      </v-btn>
    </div>

    <div class="thematic-editor__board">
      <div class="thematic-editor__column">
        <div class="thematic-editor__column-header thematic-editor__column-header--unsorted">
          <v-icon icon="mdi-tray-full" size="16" class="me-1" />
          <span class="text-truncate">{{ $t('focusGroup.answers.unsorted') }}</span>
          <v-chip size="x-small" variant="flat" color="grey-lighten-2" class="ml-1">
            {{ unsorted.length }}
          </v-chip>
        </div>
        <Draggable
          :list="unsorted"
          item-key="key"
          group="theme-responses"
          class="thematic-editor__dropzone"
          ghost-class="thematic-editor__ghost"
          @change="onChange"
        >
          <template #item="{ element }">
            <div class="thematic-editor__card">
              {{ element.excerpt }}
            </div>
          </template>
        </Draggable>
        <p
          v-if="!unsorted.length"
          class="thematic-editor__empty text-caption text-medium-emphasis"
        >
          {{ $t('focusGroup.answers.allSorted') }}
        </p>
      </div>

      <div
        v-for="theme in themes"
        :key="theme.id"
        class="thematic-editor__column"
      >
        <div class="thematic-editor__column-header thematic-editor__column-header--theme">
          <v-icon icon="mdi-tag-outline" size="16" class="me-1" />
          <span class="text-truncate">{{ theme.label }}</span>
          <v-chip size="x-small" variant="flat" color="primary" class="ml-1">
            {{ (buckets[theme.id] || []).length }}
          </v-chip>
          <v-spacer />
          <v-btn
            icon="mdi-delete-outline"
            size="x-small"
            variant="text"
            :aria-label="$t('focusGroup.answers.removeTheme')"
            @click="removeTheme(theme.id)"
          />
        </div>
        <Draggable
          :list="buckets[theme.id] || (buckets[theme.id] = [])"
          item-key="key"
          group="theme-responses"
          class="thematic-editor__dropzone thematic-editor__dropzone--theme"
          ghost-class="thematic-editor__ghost"
          @change="onChange"
        >
          <template #item="{ element }">
            <div class="thematic-editor__card thematic-editor__card--theme">
              {{ element.excerpt }}
            </div>
          </template>
        </Draggable>
        <p
          v-if="!(buckets[theme.id] || []).length"
          class="thematic-editor__empty text-caption text-medium-emphasis"
        >
          {{ $t('focusGroup.answers.dropHere') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import Draggable from 'vuedraggable'
import {
  flattenSessionResponses,
  partitionResponsesByTheme,
  themesFromBuckets,
} from '@/ux/FocusGroup/utils/themeBoard'

const props = defineProps({
  // The currently reviewed session: { sessionId, messages }
  session: { type: Object, required: true },
  // All themes for the study (may include refs from other sessions).
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const newThemeLabel = ref('')
const themes = ref([])
const unsorted = ref([])
const buckets = reactive({})

function rebuildBoard() {
  themes.value = props.modelValue.map((theme) => ({
    id: theme.id,
    label: theme.label,
  }))
  const responses = flattenSessionResponses(props.session)
  const { unsorted: nextUnsorted, buckets: nextBuckets } =
    partitionResponsesByTheme(responses, props.modelValue)

  unsorted.value = nextUnsorted
  Object.keys(buckets).forEach((key) => delete buckets[key])
  Object.entries(nextBuckets).forEach(([id, list]) => {
    buckets[id] = list
  })
}

watch(() => [props.session, props.modelValue], rebuildBoard, {
  immediate: true,
  deep: true,
})

const addTheme = () => {
  const label = newThemeLabel.value.trim()
  if (!label) return
  const nextThemes = themesFromBuckets(themes.value, buckets)
  nextThemes.push({ id: `theme-${Date.now()}`, label, responseRefs: [] })
  newThemeLabel.value = ''
  emit('update:modelValue', nextThemes)
}

const removeTheme = (themeId) => {
  const nextThemes = themesFromBuckets(themes.value, buckets).filter(
    (theme) => theme.id !== themeId,
  )
  emit('update:modelValue', nextThemes)
}

const onChange = () => {
  emit('update:modelValue', themesFromBuckets(themes.value, buckets))
}
</script>

<style scoped>
.thematic-editor__toolbar {
  padding: 12px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.thematic-editor__new-theme-input {
  max-width: 280px;
}

.thematic-editor__board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.thematic-editor__column {
  flex: 0 0 250px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.thematic-editor__column-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px 8px 0 0;
  font-size: 0.8rem;
  font-weight: 600;
}

.thematic-editor__column-header--unsorted {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.thematic-editor__column-header--theme {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.thematic-editor__dropzone {
  flex: 1 1 auto;
  min-height: 120px;
  padding: 8px;
  border-radius: 0 0 8px 8px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px dashed rgba(var(--v-border-color), 0.2);
  border-top: none;
  transition: background-color 0.15s ease;
}

.thematic-editor__dropzone--theme {
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.thematic-editor__card {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-left: 3px solid rgba(var(--v-theme-on-surface), 0.2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  font-size: 0.82rem;
  line-height: 1.4;
  cursor: grab;
  transition: box-shadow 0.15s ease;
}

.thematic-editor__card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.thematic-editor__card--theme {
  border-left-color: rgb(var(--v-theme-primary));
}

.thematic-editor__empty {
  text-align: center;
  padding: 8px;
  margin: 0;
}

.thematic-editor__ghost {
  opacity: 0.4;
}
</style>
