<template>
  <div class="thematic-editor">
    <section v-if="suggestions.length" class="thematic-editor__suggestions mb-5">
      <div class="d-flex align-center ga-2 mb-3">
        <v-icon icon="mdi-lightbulb-on-outline" color="secondary" size="20" />
        <div>
          <div class="text-subtitle-1 font-weight-medium">
            {{ $t('focusGroup.answers.themeSuggestionsTitle') }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ $t('focusGroup.answers.themeSuggestionsHint') }}
          </div>
        </div>
      </div>
      <div class="thematic-editor__suggestion-list">
        <v-card
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          variant="outlined"
          rounded="lg"
          class="pa-3"
        >
          <div class="d-flex align-start justify-space-between ga-3">
            <div class="min-width-0">
              <div class="text-body-1 font-weight-medium">{{ suggestion.label }}</div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ $t('focusGroup.answers.suggestionResponseCount', { count: suggestion.responseRefs?.length ?? 0 }) }}
              </div>
              <div v-if="suggestion.keywords?.length" class="d-flex flex-wrap ga-1 mt-2">
                <v-chip
                  v-for="keyword in suggestion.keywords"
                  :key="keyword"
                  size="x-small"
                  variant="tonal"
                  color="secondary"
                >
                  {{ keyword }}
                </v-chip>
              </div>
            </div>
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              class="text-none flex-shrink-0"
              :disabled="isSuggestionAdded(suggestion)"
              @click="addSuggestion(suggestion)"
            >
              {{ $t(isSuggestionAdded(suggestion) ? 'focusGroup.answers.suggestionAdded' : 'focusGroup.answers.useSuggestion') }}
            </v-btn>
          </div>
        </v-card>
      </div>
    </section>

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
  // NLP suggestions are kept separate until a facilitator explicitly adopts one.
  suggestions: { type: Array, default: () => [] },
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
    responseRefs: theme.responseRefs ?? [],
    keywords: theme.keywords ?? [],
    frequency: theme.frequency ?? 0,
    source: theme.source ?? 'manual',
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
  const nextThemes = themesFromBuckets(themes.value, buckets, props.session.sessionId)
  nextThemes.push({ id: `theme-${Date.now()}`, label, responseRefs: [] })
  newThemeLabel.value = ''
  emit('update:modelValue', nextThemes)
}

const isSuggestionAdded = (suggestion) =>
  themes.value.some((theme) => theme.id === suggestion.id)

const addSuggestion = (suggestion) => {
  if (isSuggestionAdded(suggestion)) return
  const nextThemes = themesFromBuckets(themes.value, buckets, props.session.sessionId)
  nextThemes.push({
    id: suggestion.id,
    label: suggestion.label,
    source: 'manual',
    keywords: suggestion.keywords ?? [],
    responseRefs: (suggestion.responseRefs ?? []).filter(
      (ref) => ref.sessionId === props.session.sessionId,
    ),
  })
  emit('update:modelValue', nextThemes)
}

const removeTheme = (themeId) => {
  const nextThemes = themesFromBuckets(themes.value, buckets, props.session.sessionId).filter(
    (theme) => theme.id !== themeId,
  )
  emit('update:modelValue', nextThemes)
}

const onChange = () => {
  emit(
    'update:modelValue',
    themesFromBuckets(themes.value, buckets, props.session.sessionId),
  )
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 16px;
  padding-bottom: 8px;
}

.thematic-editor__column {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.thematic-editor__suggestion-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 12px;
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
