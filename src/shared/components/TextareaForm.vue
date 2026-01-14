<template>
  <v-row justify="center">
    <v-col lg="12" class="px-0 py-5">
      <v-card class="elevation-2 rounded-lg pa-md-6" width="100%">
        <v-row class="pa-4 pa-0">
          <v-col>

            <v-card-title class="text-h5 font-weight-bold pa-0"
              :style="{ color: $vuetify.theme.current.colors['on-surface'] }">
              {{ title }}
            </v-card-title>

            <p class="text-body-1 text-medium-emphasis">
              {{ subtitle }}
            </p>
          </v-col>
        </v-row>

        <v-card-text>
          <quill-editor v-model:value="value" :options="editorOptions" class="editor-container" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const value = defineModel({ type: String, default: '' })
const emit = defineEmits(['update:value'])

watch(value, (newValue) => {
  emit('update:value', newValue)
})

const editorOptions = {
  theme: 'snow',
  placeholder: 'Enter text here...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean'],
    ],
  },
}
</script>

<style scoped>
.editor-container {
  background-color: rgb(var(--v-theme-surface));
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  transition: all 0.2s ease;
}

@media (prefers-color-scheme: dark) {
  .editor-container {
    background-color: rgb(var(--v-theme-surface));
    border-color: rgba(var(--v-theme-on-surface), 0.24);
  }
}

/* using Vuetify theme classes */
:global(.v-theme--dark) .editor-container {
  background-color: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-theme-on-surface), 0.24);
}

:deep(.ql-container) {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.5;
  color: rgb(var(--v-theme-on-surface));
  border-radius: 0 0 8px 8px;
  border: none;
  font-family: inherit;
}

:deep(.ql-toolbar) {
  border-radius: 8px 8px 0 0;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  border-bottom: none;
}

:deep(.ql-editor) {
  padding: 16px;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.ql-editor.ql-blank::before) {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: normal;
}

/* Quill tool buttons styling */
:deep(.ql-toolbar button),
:deep(.ql-toolbar .ql-picker-label),
:deep(.ql-toolbar .ql-picker-item) {
  color: rgb(var(--v-theme-on-surface));
}

:deep(.ql-toolbar button:hover),
:deep(.ql-toolbar .ql-picker-label:hover),
:deep(.ql-toolbar .ql-picker-item:hover) {
  color: rgb(var(--v-theme-primary));
}

:deep(.ql-toolbar button.ql-active) {
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
}

:deep(.ql-toolbar .ql-picker.ql-expanded .ql-picker-label) {
  color: rgb(var(--v-theme-on-surface));
}

:deep(.ql-toolbar .ql-picker-options) {
  background-color: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-theme-on-surface), 0.12);
}

/* Dark mode specific adjustments for Quill */
@media (prefers-color-scheme: dark) {
  :deep(.ql-snow .ql-stroke) {
    stroke: rgb(var(--v-theme-on-surface));
  }
  
  :deep(.ql-snow .ql-fill) {
    fill: rgb(var(--v-theme-on-surface));
  }
  
  :deep(.ql-snow .ql-picker) {
    color: rgb(var(--v-theme-on-surface));
  }
  
  :deep(.ql-toolbar) {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
  }
}

:global(.v-theme--dark) {
  :deep(.ql-snow .ql-stroke) {
    stroke: rgb(var(--v-theme-on-surface));
  }
  
  :deep(.ql-snow .ql-fill) {
    fill: rgb(var(--v-theme-on-surface));
  }
  
  :deep(.ql-snow .ql-picker) {
    color: rgb(var(--v-theme-on-surface));
  }
  
  :deep(.ql-toolbar) {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
  }
}

.text-body-1 {
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
}

.editor-container:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

:deep(.ql-container:focus-within) {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.2);
}
</style>
