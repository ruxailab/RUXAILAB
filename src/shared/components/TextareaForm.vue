<template>
  <v-row justify="center">
    <v-col lg="12" class="px-0 py-5">
      <v-card class="elevation-2 rounded-lg pa-md-6" width="100%">
        <v-row class="pa-4 pa-0">
          <v-col>
            <v-card-title
              class="text-h5 font-weight-bold pa-0"
              :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
            >
              {{ title }}
            </v-card-title>

            <p class="text-body-1" style="color: #4b5563">
              {{ subtitle }}
            </p>
          </v-col>
        </v-row>

        <v-card-text>
          <quill-editor
            v-model:value="value"
            :options="editorOptions"
            class="editor-container"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
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

const editorOptions = computed(() => ({
  theme: 'snow',
  placeholder: t('common.enterTextHere'),
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  },
}))
</script>

<style scoped>
.editor-container {
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

:deep(.ql-container) {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  border-radius: 0 0 8px 8px;
}

:deep(.ql-toolbar) {
  border-radius: 8px 8px 0 0;
  border: 1px solid #e5e7eb;
  background-color: #f8fafc;
}

:deep(.ql-editor) {
  padding: 16px;
}
</style>
