<template>
  <div class="pa-4">Transcriptions Panel Component</div>

  <div v-if="transcriptionsArray && transcriptionsArray.length">
    <pre>{{ JSON.stringify(transcriptionsArray, null, 2) }}</pre>
    <!-- <ul>
      <li v-for="transcription in transcriptionsArray" :key="transcription.id">
        {{ transcription.text }}
      </li>
    </ul> -->
  </div>
</template>

<script setup>
import { watch, ref } from 'vue'

// JS props (no types)
const props = defineProps({
  answerDocId: {
    type: String,
    required: true,
  },
  userDocId: {
    type: String,
    required: true,
  },
  taskId: {
    type: String,
    required: true,
  },
  latestTranscriptionId: {
    type: String,
    required: false,
    default: null,
  },
})

const loading = ref(true)
const transcriptionsArray = ref([])

// Controllers
import TranscriptionController from '@/ai/transcriptions/TranscriptionController'
const transcriptionController = new TranscriptionController()

watch(
  () => [props.answerDocId, props.userDocId, props.taskId],
  async () => {
    await fetchSelectedTaskTranscriptions()
  },
  { immediate: true },
)

async function fetchSelectedTaskTranscriptions() {
  if (!props.answerDocId || !props.userDocId || !props.taskId) return

  loading.value = true
  try {
    const transcriptions =
      await transcriptionController.getByAnswerDocIdandUserDocIdandTaskId(
        props.answerDocId,
        props.userDocId,
        props.taskId,
      )

    console.log('Fetched transcriptions:', transcriptions)
    transcriptionsArray.value = transcriptions
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
  } finally {
    loading.value = false
  }
}
</script>
