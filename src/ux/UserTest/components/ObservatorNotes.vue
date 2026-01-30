<template>
  <div class="observator-notes-container">
    <div
      class="header pa-4 bg-grey-lighten-4 d-flex align-center justify-space-between"
    >
      <h3 class="text-h6 font-weight-bold display-flex align-center">
        <v-icon class="mr-2">mdi-notebook-edit-outline</v-icon>
        Session Notes
      </h3>
      <v-chip size="small" color="primary" variant="outlined"
        >{{ notes.length }} notes</v-chip
      >
    </div>

    <div ref="notesList" class="notes-list pa-4">
      <div v-if="notes.length === 0" class="text-center text-grey mt-10">
        <v-icon size="48" class="mb-2 opacity-50"
          >mdi-text-box-plus-outline</v-icon
        >
        <p>No notes taken yet.</p>
        <p class="text-caption">Start typing below to record observations.</p>
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
        placeholder="Type observation... (Cmd+Enter to save)"
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

const props = defineProps({
  modelValue: {
    type: Array, // sessionNotes
    default: () => [],
  },
  currentTaskIndex: Number,
  test: Object,
})

const emit = defineEmits(['update:modelValue', 'save'])

const newNote = ref('')
const notesList = ref(null)

const notes = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val),
})

const reversedNotes = computed(() => [...notes.value].reverse())

const currentTaskName = computed(() => {
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
    taskIndex: props.currentTaskIndex,
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
.observator-notes-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-left: 1px solid #e0e0e0;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
}

.input-area {
  border-top: 1px solid #e0e0e0;
}

.note-item {
  border: 1px solid #eee;
}
</style>
