<template>
  <div class="pa-4">
    <!---------------------------------------------------------->
    <!------------------- Media Players ------------------------>
    <!---------------------------------------------------------->
    <div v-if="showMediaPlayers">
      <div v-if="audioUrlEvaluator">
        <h4>🎧 Evaluator Audio</h4>
        <audio :src="audioUrlEvaluator" controls style="width: 100%" />
      </div>

      <div v-if="audioUrlModerator" class="mt-4">
        <h4>🎤 Moderator Audio</h4>
        <audio :src="audioUrlModerator" controls style="width: 100%" />
      </div>
    </div>

    <!---------------------------------------------------------------------->
    <!------------------------ Selectors & Button -------------------------->
    <!---------------------------------------------------------------------->
    <v-sheet
      v-if="audioUrlEvaluator || audioUrlModerator"
      elevation="0"
      class="pa-3 mt-4 mb-4 rounded-lg controls-bar"
      color="white"
    >
      <v-row class="align-center">
        <!-- Provider -->
        <v-col cols="12" md="8" lg="8">
          <v-select
            v-model="selectedProvider"
            label="Provider"
            :items="providers"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-robot-outline"
            hide-details
            :menu-props="{ maxHeight: 260 }"
          />
        </v-col>

        <!-- Button -->
        <v-col cols="12" md="4" lg="4" class="d-flex align-end">
          <v-btn
            block
            color="orange"
            class="text-white"
            height="46"
            :loading="isTranscribing"
            :disabled="isTranscribing || !selectedProvider"
            @click="transcribeSession"
          >
            🎙 Transcribe
          </v-btn>
        </v-col>
      </v-row>
    </v-sheet>

    <!---------------------------------------------------------->
    <!--------------------- Transcription ---------------------->
    <!---------------------------------------------------------->

    <template v-if="showInlineResult">
      <TranscriptionList
        v-if="transcriptSegments.length"
        :transcript-segments="transcriptSegments"
      />

      <v-alert
        v-else-if="showInlineEmptyState"
        type="info"
        variant="tonal"
        density="comfortable"
        class="mb-4"
      >
        No transcriptions yet for this task.
      </v-alert>
    </template>
  </div>

  <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    :timeout="4000"
  >
    {{ snackbar.text }}
    <template #actions>
      <v-btn color="white" variant="text" @click="snackbar.visible = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, computed } from 'vue'

import { transcribeTask } from '@/app/services/transcription/TranscriptionService'
import TranscriptionList from '@/ux/UserTest/components/transcription/TranscriptionList.vue'

const props = defineProps({
  answersDocId: { type: String, default: null },
  userDocId: { type: String, default: null },
  taskId: { type: [String, Number], required: true },
  studyId: { type: String, default: null },
  audioUrlEvaluator: { type: String, default: null },
  audioUrlModerator: { type: String, default: null },
  showMediaPlayers: { type: Boolean, default: true },
  showInlineResult: { type: Boolean, default: true },
  showInlineEmptyState: { type: Boolean, default: true },
})

const emit = defineEmits(['saved'])

const isTranscribing = ref(false)
const transcriptSegments = ref([])

const snackbar = ref({
  visible: false,
  text: '',
  color: '',
})

const selectedProvider = ref('whisper')

const providers = [
  { label: 'Whisper (local)', value: 'whisper' },
  { label: 'OpenAI Whisper API', value: 'openai' },
]

const selectedModel = computed(() =>
  selectedProvider.value === 'openai' ? 'whisper-1' : 'medium',
)

function mergeSegments(evaluator, moderator) {
  const withRole = (segments, role) =>
    (segments ?? []).map((segment) => ({ ...segment, role }))

  return [
    ...withRole(evaluator?.segments, 'evaluator'),
    ...withRole(moderator?.segments, 'moderator'),
  ].sort((a, b) => a.start - b.start)
}

function errorMessage(err) {
  return (
    err?.message ||
    err?.details ||
    err?.code ||
    'Error during transcription. Please try again.'
  )
}

async function transcribeSession() {
  if (!props.audioUrlEvaluator && !props.audioUrlModerator) {
    return
  }
  if (!props.answersDocId || !props.userDocId || props.taskId == null) {
    snackbar.value = {
      visible: true,
      text: 'Missing session identifiers to save the transcription.',
      color: 'red',
    }
    return
  }

  isTranscribing.value = true
  transcriptSegments.value = []

  snackbar.value = {
    visible: true,
    text: 'Transcribing session, please wait...',
    color: 'orange',
  }

  try {
    const result = await transcribeTask({
      answersDocId: props.answersDocId,
      userDocId: props.userDocId,
      taskId: String(props.taskId),
      studyId: props.studyId || undefined,
      provider: selectedProvider.value,
      model: selectedModel.value,
    })

    transcriptSegments.value = mergeSegments(
      result.evaluator,
      result.moderator,
    )

    snackbar.value = {
      visible: true,
      text: 'Transcription saved successfully!',
      color: 'green',
    }

    emit('saved', result)
  } catch (err) {
    snackbar.value = {
      visible: true,
      text: errorMessage(err),
      color: 'red',
    }
  } finally {
    isTranscribing.value = false
  }
}
</script>
