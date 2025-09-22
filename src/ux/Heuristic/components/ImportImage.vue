<template>
  <div class="input">
    <v-file-input
      :id="`${heuristicId}${questionId}`"
      class="ml-2"
      name="my-image"
      accept="image/gif, image/jpeg, image/png"
      :placeholder="imageUploaded
        ? $t('common.inputImage')
        : url
      "
      @change="uploadFile"
      :disabled="disable"
    />
    <!-- Add the image field to display the inputted image -->
    <v-row justify="center">
      <v-img
        v-if="imageUploaded"
        max-height="225"
        :src="url"
        cover
      />
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const props = defineProps({
  heuristicId: {
    type: String,
    default: '',
    required: true
  },
  questionId: {
    type: String,
    default: '',
    required: true
  },
  testId: {
    type: String,
    default: '',
    required: true
  },
  disable: {
    type: Boolean,
    default: false,
    required: false
  }
})

const emit = defineEmits(['imageUploaded'])

const store = useStore()

const url = ref('')
const object = ref({})
const imageUploaded = ref(false)

const test = computed(() => store.state.Tests.Test)
const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer)
const hasExistingImage = computed(() => 
  currentUserTestAnswer.value?.heuristicQuestions?.[props.heuristicId]?.heuristicQuestions?.[props.questionId]?.answerImageUrl
)

onMounted(() => {
  if (hasExistingImage.value) {
    url.value = hasExistingImage.value
    imageUploaded.value = true
  }
})

const uploadFile = async () => {
  const fileInput = document.getElementById(
    `${props.heuristicId}${props.questionId}`
  )

  const storage = getStorage()
  const file = fileInput.files[0]

  const storageReference = storageRef(
    storage,
    `tests/${props.testId}/heuristic_${props.heuristicId}/${props.questionId}/${file.name}`
  )
  await uploadBytes(storageReference, file)
  url.value = await getDownloadURL(storageReference)
  
  store.dispatch('setCurrentImageUrl', url.value)
  imageUploaded.value = true
  emit('imageUploaded', url.value)
};
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