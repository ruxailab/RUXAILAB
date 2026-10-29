<template>
  <div
    class="file-drop rounded-lg pa-8 text-center"
    :class="{ 'file-drop--active': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <v-icon size="40" color="grey-darken-1">
      mdi-file-delimited-outline
    </v-icon>
    <p class="text-body-1 font-weight-medium text-grey-darken-3 mt-3 mb-1">
      {{ $t('CardSorting.importFileDrop') }}
    </p>
    <p class="text-body-2 text-grey-darken-1 mb-4">
      {{ $t('CardSorting.importFileHint') }}
    </p>
    <div class="d-flex justify-center flex-wrap ga-3">
      <v-btn
        color="primary"
        variant="outlined"
        class="text-none rounded-lg"
        @click="openFilePicker"
      >
        {{ $t('CardSorting.importFileBrowse') }}
      </v-btn>
      <v-btn
        color="grey-darken-2"
        variant="outlined"
        class="text-none rounded-lg example-csv-btn"
        @click="downloadExampleCsv"
      >
        <v-icon start size="18">mdi-download</v-icon>
        {{ $t('CardSorting.importFileExample') }}
      </v-btn>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept=".csv,.txt,text/csv,text/plain"
      class="file-input"
      @change="onNativeFile"
    />
    <p v-if="fileName" class="text-body-2 text-grey-darken-3 mt-4 mb-0">
      <v-icon size="16" color="success" class="mr-1">
        mdi-check-circle-outline
      </v-icon>
      {{ fileName }}
    </p>
    <p v-if="fileError" class="text-body-2 text-error mt-4 mb-0">
      {{ fileError }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  buildImportExampleCsv,
  isAllowedImportFile,
} from '../../../utils/parseImportLines'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'card',
    validator: (value) => ['category', 'card'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const fileInput = ref(null)
const fileName = ref('')
const fileError = ref('')
const isDragging = ref(false)

const resetFileState = () => {
  fileName.value = ''
  fileError.value = ''
  isDragging.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const readFileText = (file) => {
  if (typeof file?.text === 'function') {
    return file.text()
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

const applyFile = async (file) => {
  fileError.value = ''
  if (!isAllowedImportFile(file)) {
    fileName.value = ''
    emit('update:modelValue', '')
    fileError.value = t('CardSorting.importFileError')
    return
  }

  fileName.value = file.name
  try {
    emit('update:modelValue', await readFileText(file))
  } catch {
    emit('update:modelValue', '')
    fileError.value = t('CardSorting.importFileReadError')
  }
}

const openFilePicker = () => {
  fileInput.value?.click()
}

const downloadExampleCsv = () => {
  const { csv, filename } = buildImportExampleCsv(props.type)
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

const onNativeFile = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    applyFile(file)
  }
  event.target.value = ''
}

const onDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    applyFile(file)
  }
}

defineExpose({ applyFile, resetFileState })
</script>

<style scoped>
.file-drop {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.file-drop--active {
  background: #fff7ed;
  border-color: #fca326;
}

.file-input {
  display: none;
}
</style>
