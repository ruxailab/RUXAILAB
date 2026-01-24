<template>
  <div class="text-center mb-6">
    <v-avatar :size="size" class="avatar-transition bg-ternary">
      <v-img :src="previewImage || currentImage" alt="No Image" />
    </v-avatar>
    <div class="d-flex justify-center align-center gap-2 mt-3">
      <v-btn icon size="small" color="primary" @click="selectImage">
        <v-icon>mdi-camera</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ $t('profile.uploadProfilePicture') }}
        </v-tooltip>
      </v-btn>
      <v-btn
        v-if="previewImage || currentImage"
        icon
        size="small"
        color="error"
        @click="removeImage"
      >
        <v-icon>mdi-delete</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ $t('profile.removeProfilePicture') }}
        </v-tooltip>
      </v-btn>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  currentImage: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 100,
  },
})

const emit = defineEmits(['image-selected', 'image-removed'])

const fileInput = ref(null)
const previewImage = ref('')
const selectedFile = ref(null)

const selectImage = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
    fileInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const file = event?.target?.files?.[0]
  if (!file) return

  try {
    const previewUrl = URL.createObjectURL(file)

    selectedFile.value = file
    previewImage.value = previewUrl

    emit('image-selected', {
      file: file,
      previewUrl: previewUrl,
    })

    if (fileInput.value) fileInput.value.value = ''
  } catch (error) {
    emit('image-selected', {
      file: null,
      previewUrl: null,
      error: error,
    })
  }
}

const removeImage = () => {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value)
  }
  previewImage.value = ''
  selectedFile.value = null
  emit('image-removed')
  if (fileInput.value) fileInput.value.value = ''
}

onBeforeUnmount(() => {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value)
  }
})

watch(
  () => props.currentImage,
  (newVal) => {
    if (!newVal && previewImage.value) {
      URL.revokeObjectURL(previewImage.value)
      previewImage.value = ''
    }
  },
)
</script>
