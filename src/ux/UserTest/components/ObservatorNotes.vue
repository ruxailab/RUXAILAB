<template>
  <div>
    <div
      v-if="showHeader"
      class="video-tool-header d-flex align-center justify-space-between"
    >
      <h3 class="text-h6 font-weight-bold display-flex align-center">
        <v-icon class="mr-2">mdi-notebook-edit-outline</v-icon>
        {{ t('observatorNotes.title') }}
      </h3>
      <v-chip size="small" color="white" variant="outlined">
        {{ t('observatorNotes.count', { count: notes.length }) }}
      </v-chip>
      <v-btn
        icon
        size="small"
        variant="text"
        aria-label="Close notes"
        @click="emit('close')"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <div ref="notesList" class="notes-list pa-4">
      <div v-if="notes.length === 0" class="text-center text-grey mt-10">
        <v-icon size="48" class="mb-2 opacity-50"
          >mdi-text-box-plus-outline</v-icon
        >
        <p>{{ t('observatorNotes.empty') }}</p>
        <p class="text-caption">{{ t('observatorNotes.emptyHint') }}</p>
      </div>

      <div
        v-for="(note, index) in reversedNotes"
        :key="index"
        class="note-item mb-3 pa-3 bg-white rounded elevation-1"
      >
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption font-weight-bold text-primary">
            {{ formatTime(note.timestamp) }}
          </span>
          <span v-if="note.taskName" class="text-caption text-grey">
            {{ note.taskName }}
          </span>
        </div>
        <div class="text-body-2" style="white-space: pre-wrap">
          {{ note.text }}
        </div>
      </div>
    </div>

    <div class="input-area pa-3 bg-grey-lighten-4 border-top">
      <v-textarea
        v-model="newNote"
        variant="outlined"
        :placeholder="t('observatorNotes.placeholder')"
        rows="3"
        auto-grow
        hide-details
        density="compact"
        bg-color="white"
        @keydown.enter.prevent="handleEnter"
      >
        <template #append-inner>
          <v-btn
            icon="mdi-send"
            variant="text"
            size="small"
            color="primary"
            class="mb-auto"
            :disabled="!newNote.trim()"
            @click="addNote"
          ></v-btn>
        </template>
      </v-textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Array, // sessionNotes
    default: () => [],
  },
  currentTaskIndex: Number,
  test: Object,
  // Optional label to tag each note with (e.g. a Focus Group topic title). When
  // provided it overrides the moderated-test task-name lookup, letting other
  // modules reuse this component without a `testStructure.userTasks` shape.
  contextLabel: {
    type: String,
    default: '',
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

const newNote = ref('')
const notesList = ref(null)

const notes = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val),
})

const reversedNotes = computed(() => [...notes.value].reverse())

const currentTaskName = computed(() => {
  // A caller-provided label wins, so the component works outside moderated tests.
  if (props.contextLabel) return props.contextLabel
  if (!props.test?.testStructure?.userTasks) return 'General'
  // Check if we are in a task step
  // This logic depends on parent context, but passed taskIndex is a good proxy
  if (
    props.currentTaskIndex != null &&
    props.test.testStructure.userTasks[props.currentTaskIndex]
  ) {
    return (
      props.test.testStructure.userTasks[props.currentTaskIndex].taskName ||
      `Task ${props.currentTaskIndex + 1}`
    )
  }
  return 'General'
})

const formatTime = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const handleEnter = (e) => {
  if (e.metaKey || e.ctrlKey) {
    addNote()
  } else {
    // manual newline
    newNote.value += '\n'
  }
}

const addNote = () => {
  if (!newNote.value.trim()) return

  const note = {
    text: newNote.value.trim(),
    timestamp: Date.now(),
    // Fall back to null: this component is reused outside moderated tests (e.g.
    // Focus Group) where there is no task index, and Realtime Database rejects
    // `undefined` values on write.
    taskIndex: props.currentTaskIndex ?? null,
    taskName: currentTaskName.value,
  }

  // Push to local array
  notes.value.push(note)

  // Emit update/save
  emit('update:modelValue', notes.value)
  emit('save')

  newNote.value = ''

  // Scroll to top of list (since we reverse it for display, new ones are at top? No, reversedNotes puts new ones at top)
  if (notesList.value) {
    notesList.value.scrollTop = 0
  }
}
</script>

<style scoped>
.notes-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.input-area {
  border-top: 1px solid #e0e0e0;
}

.note-item {
  border: 1px solid #eee;
}
</style>
