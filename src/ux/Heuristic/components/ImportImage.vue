<template>
  <div class="input">
    <label
      :for="inputId"
      :class="['image-drop-zone', { disabled: disable }]"
      @dragover.prevent
      @drop.prevent="uploadDroppedFile"
    >
      <span class="image-drop-heading">
        <v-icon size="22">mdi-image-multiple-outline</v-icon>
        <strong>{{ $t('HeuristicsTestView.answer.imageEvidence') }}</strong>
      </span>

      <span class="image-drop-icon">
        <v-icon size="38">mdi-file-image-plus-outline</v-icon>
      </span>

      <span class="image-drop-title">
        {{ $t('HeuristicsTable.ImportImage.dropImage') }}
      </span>
      <span class="image-drop-hint">
        {{ $t('HeuristicsTable.ImportImage.imageFormats') }}
      </span>

      <v-chip v-if="hasSavedImage" color="primary" size="small" class="mt-3">
        <v-icon start size="small">mdi-image</v-icon>
        {{ $t('HeuristicsSettings.actions.update') }}
      </v-chip>
    </label>

    <input
      :id="inputId"
      name="my-image"
      type="file"
      multiple
      accept="image/gif, image/jpeg, image/png, video/mp4, video/webm, video/quicktime"
      :disabled="disable"
      class="image-native-input"
      @change="uploadFile"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
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
  questionIndex: {
    type: Number,
    default: 0,
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
})

const emit = defineEmits(['imageUploaded'])

const store = useStore()

const inputId = computed(
  () => `image-evidence-${props.heuristicId}-${props.questionId}`,
)

const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)

const findImageUrl = () => {
  if (!currentUserTestAnswer.value?.heuristicQuestions?.length) {
    return null
  }

  // Convert heuristicId to number for comparison
  const targetHeuristicId = parseInt(props.heuristicId)
  const targetQuestionId = props.questionId

  // Search through all heuristics
  for (const heuristic of currentUserTestAnswer.value.heuristicQuestions) {
    if (
      heuristic?.heuristicQuestions &&
      Array.isArray(heuristic.heuristicQuestions)
    ) {
      // Check if this heuristic matches
      if (heuristic.heuristicId === targetHeuristicId) {
        // Search through all questions in this heuristic
        for (const question of heuristic.heuristicQuestions) {
          // Check if this question matches our questionId
          if (question.heuristicId === targetQuestionId) {
            const firstMedia = Array.isArray(question.images)
              ? question.images[0]
              : null
            return firstMedia?.url || question.answerImageUrl || null
          }
        }
      }
    }
  }

  return null
}

const hasSavedImage = computed(() => {
  const imageUrl = findImageUrl()
  return imageUrl && imageUrl !== ''
})

const uniqueStorageName = (file, index = 0) => {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^\w.-]/g, '_')
  return `${timestamp}-${index}-${safeName}`
}

const uploadSelectedFile = async (file, index = 0) => {
  try {
    const sourceHeuristicIndex = parseInt(props.heuristicId)
    const sourceQuestionIndex = props.questionIndex
    if (!file) {
      return
    }
    const storage = getStorage()
    const storagePath = `tests/${props.testId}/heuristic_${props.heuristicId}/${props.questionId}/${uniqueStorageName(file, index)}`
    const storageReference = storageRef(storage, storagePath)
    await uploadBytes(storageReference, file)
    const downloadUrl = await getDownloadURL(storageReference)
    store.dispatch('setCurrentImageUrl', downloadUrl)
    emit(
      'imageUploaded',
      downloadUrl,
      {
        name: file.name,
        size: file.size,
        type: file.type,
        storagePath,
      },
      sourceHeuristicIndex,
      sourceQuestionIndex,
    )
  } catch (error) {
    emit('imageUploaded', null, error)
  }
}

const uploadSelectedFiles = async (files) => {
  const fileList = Array.from(files || [])
  if (!fileList.length) return

  for (const [index, file] of fileList.entries()) {
    await uploadSelectedFile(file, index)
  }
}

const uploadFile = (event) => {
  uploadSelectedFiles(event.target.files)
  event.target.value = ''
}

const uploadDroppedFile = (event) => {
  if (props.disable) return
  uploadSelectedFiles(event.dataTransfer.files)
}
</script>

<style scoped>
.input {
  width: 100%;
}

.image-native-input {
  display: none;
}

.image-drop-zone {
  display: flex;
  min-height: 270px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.35rem;
  border: 2px dashed #b8c6dc;
  border-radius: 8px;
  color: #405166;
  background:
    linear-gradient(135deg, rgba(223, 232, 251, 0.82), rgba(255, 255, 255, 0.94)),
    radial-gradient(circle at 16% 18%, rgba(0, 33, 63, 0.08), transparent 34%);
  cursor: pointer;
  text-align: center;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.image-drop-zone:hover {
  border-color: #00213f;
  box-shadow: 0 12px 26px rgba(0, 33, 63, 0.09);
  transform: translateY(-1px);
}

.image-drop-zone.disabled {
  cursor: not-allowed;
  opacity: 0.66;
  transform: none;
}

.image-drop-heading {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1rem;
  color: #00213f;
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.image-drop-icon {
  display: inline-flex;
  width: 4.1rem;
  height: 4.1rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
  border-radius: 999px;
  color: #00213f;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: inset 0 0 0 1px rgba(0, 33, 63, 0.12);
}

.image-drop-title {
  color: #35465a;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.image-drop-hint {
  margin-top: 0.35rem;
  color: #697386;
  font-size: 0.84rem;
}

</style>
