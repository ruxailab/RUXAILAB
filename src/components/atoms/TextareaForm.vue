<template>
  <v-container
    fluid
    class="pa-0 bg-grey-lighten-5"
    width="100%"
  >
    <v-row justify="center">
      <v-col
        cols="12"
        md="10"
        lg="12"
      >
        <v-card
          class="elevation-2 rounded-lg pa-6"
          width="100%"
        >
          <v-card-title class="text-h5 font-weight-bold mb-4 bg-on-surface">
            {{ title }}
          </v-card-title>
          <v-card-text>
            <p
              class="text-body-1 mb-6"
              style="color: #4B5563;"
            >
              {{ subtitle }}
            </p>
            <quill-editor
              v-model:value="value"
              :options="editorOptions"
              class="editor-container"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})

const value = defineModel({ type: String, default: '' })

const emit = defineEmits(['update:value', 'update:modelValue'])
// const value = ref('')

watch(() => props.modelValue, (newVal) => {
  value.value = newVal
})

watch(value, (newValue) => {
  emit('update:value', newValue)
})

const editorOptions = {
  theme: 'snow',
  placeholder: 'Enter consent text here...',
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
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

:deep(.ql-container) {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.5;
  color: #1F2937;
  border-radius: 0 0 8px 8px;
}

:deep(.ql-toolbar) {
  border-radius: 8px 8px 0 0;
  border: 1px solid #E5E7EB;
  background-color: #F8FAFC;
}

:deep(.ql-editor) {
  padding: 16px;
}

:deep(.ql-editor:focus) {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.v-btn {
  text-transform: none;
  letter-spacing: 0;
}
</style>
