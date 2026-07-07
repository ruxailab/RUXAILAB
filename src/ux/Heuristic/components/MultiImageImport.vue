<template>
  <div class="multi-image-import">
    <v-file-input
      :id="`multi-${heuristicId}-${questionId}`"
      class="ml-2"
      name="my-image"
      accept="image/gif, image/jpeg, image/png"
      :placeholder="$t('common.selectImage')"
      :disabled="disable"
      :clearable="false"
      prepend-icon="mdi-camera-plus"
      @change="uploadFile"
    />

    <v-progress-linear
      v-if="uploading"
      indeterminate
      color="primary"
      class="mb-2"
    />

    <v-alert
      v-if="uploadStatus"
      :type="uploadStatus.type"
      density="compact"
      class="mb-2"
      closable
      @click:close="uploadStatus = null"
    >
      {{ uploadStatus.message }}
    </v-alert>

    <!-- Image Count Info -->
    <div v-if="existingImagesCount > 0" class="text-caption text-grey mb-2">
      <v-icon size="small">mdi-information</v-icon>
      {{
        $t('HeuristicsTable.ImportImage.imagesCount', {
          count: existingImagesCount,
        })
      }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'

const props = defineProps({
  heuristicId: {
    type: String,
    default: '',
    required: true,
  },
  questionId: {
    type: String,
    default: '',
    required: true,
  },
  testId: {
    type: String,
    default: '',
    required: true,
  },
  disable: {
    type: Boolean,
    default: false,
    required: false,
  },
  existingImagesCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['imageUploaded'])

const store = useStore()
const { t } = useI18n()

const uploading = ref(false)
const uploadStatus = ref(null)

const uploadFile = async (_event) => {
  try {
    const fileInput = document.getElementById(
      `multi-${props.heuristicId}-${props.questionId}`,
    )

    if (!fileInput) {
      return
    }

    const file = fileInput.files?.[0]
    if (!file) {
      return
    }

    uploading.value = true
    uploadStatus.value = null

    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}-${file.name}`

    const storage = getStorage()
    const storageReference = storageRef(
      storage,
      `tests/${props.testId}/heuristic_${props.heuristicId}/${props.questionId}/${uniqueFilename}`,
    )

    await uploadBytes(storageReference, file)
    const url = await getDownloadURL(storageReference)

    store.dispatch('setCurrentImageUrl', url)

    uploadStatus.value = {
      type: 'success',
      message: t('HeuristicsTable.ImportImage.uploadSuccess'),
    }

    emit('imageUploaded', url)

    fileInput.value = ''

    setTimeout(() => {
      if (uploadStatus.value?.type === 'success') {
        uploadStatus.value = null
      }
    }, 3000)
  } catch (error) {
    console.error('Image upload failed:', error)
    uploadStatus.value = {
      type: 'error',
      message: t('HeuristicsTable.ImportImage.uploadError'),
    }
    emit('imageUploaded', null, error)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.multi-image-import {
  width: 100%;
}
</style>
