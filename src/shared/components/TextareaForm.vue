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
              {{ props.title }}
            </v-card-title>

            <p class="text-body-1" style="color: #4b5563">
              {{ props.subtitle }}
            </p>
          </v-col>
        </v-row>

        <v-card-text>
          <quill-editor
            ref="quillRef"
            v-model:value="value"
            :options="editorOptions"
            :class="['editor-container', { 'editor-readonly': props.readonly }]"
            @ready="applyReadonlyAttributes"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { watch, computed, nextTick, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const value = defineModel({ type: String, default: '' })
const emit = defineEmits(['update:value'])
const quillRef = ref(null)

watch(value, (newValue) => {
  emit('update:value', newValue)
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const editorOptions = computed(() => ({
  theme: 'snow',
  readOnly: props.readonly,
  placeholder: t('common.enterTextHere'),
  modules: {
    toolbar: props.readonly
      ? false
      : [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean'],
        ],
  },
}))

const applyReadonlyAttributes = async () => {
  await nextTick()
  const root = quillRef.value?.$el || quillRef.value
  const editor = root?.querySelector?.('.ql-editor')
  if (!editor) return

  if (props.readonly) {
    editor.setAttribute('contenteditable', 'false')
    editor.setAttribute('tabindex', '-1')
  } else {
    editor.setAttribute('contenteditable', 'true')
    editor.removeAttribute('tabindex')
  }
}

watch(
  () => props.readonly,
  () => {
    applyReadonlyAttributes()
  },
)

onMounted(() => {
  applyReadonlyAttributes()
})
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

.editor-readonly :deep(.ql-editor) {
  pointer-events: none;
}
</style>
