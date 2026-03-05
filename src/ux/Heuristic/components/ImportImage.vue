<template>
  <div class="input">
    <v-file-input
      :id="`${heuristicId}${questionId}`"
      class="ml-2"
      name="my-image"
      accept="image/gif, image/jpeg, image/png"
      :placeholder="imageUploaded ? $t('common.inputImage') : url"
      :disabled="disable"
      :clearable="false"
      @change="uploadFile"
    />
    <!-- Add the image field to display the inputted image -->
    <v-row v-if="hasSavedImage || imageUploaded" justify="center" class="mt-2">
      <v-img
        :src="displayedImageUrl"
        max-height="225"
        max-width="225"
        cover
        class="mb-2"
      />
      <v-chip v-if="hasSavedImage" color="primary" size="small" class="ma-2">
        <v-icon start size="small">mdi-image</v-icon>
        {{ $t('HeuristicsSettings.actions.update') }}
      </v-chip>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

const url = ref('')
const imageUploaded = ref(false)

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
            return question.answerImageUrl || null
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

const displayedImageUrl = computed(() => {
  if (url.value) return url.value
  return findImageUrl() || ''
})

watch(
  () => currentUserTestAnswer.value,
  () => {
    const imageUrl = findImageUrl()
    if (imageUrl) {
      url.value = imageUrl
      imageUploaded.value = true
    }
  },
  { deep: true },
)

onMounted(() => {
  const imageUrl = findImageUrl()
  if (imageUrl) {
    url.value = imageUrl
    imageUploaded.value = true
  }
})

const uploadFile = async () => {
  try {
    const fileInput = document.getElementById(
      `${props.heuristicId}${props.questionId}`,
    )

    if (!fileInput) {
      return
    }
    const file = fileInput.files?.[0]
    if (!file) {
      return
    }
    const storage = getStorage()
    const storageReference = storageRef(
      storage,
      `tests/${props.testId}/heuristic_${props.heuristicId}/${props.questionId}/${file.name}`,
    )
    await uploadBytes(storageReference, file)
    url.value = await getDownloadURL(storageReference)
    store.dispatch('setCurrentImageUrl', url.value)
    imageUploaded.value = true
    emit('imageUploaded', url.value)
  } catch (error) {
    emit('imageUploaded', null, error)
  }
}
</script>

<style>
.input {
  width: 100%;
}

.image-container {
  width: 100%;
  height: 100%;
}
</style>
