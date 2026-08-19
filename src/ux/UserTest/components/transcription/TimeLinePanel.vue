<template>
  <div class="pa-4">
    <!---------------------------------------------------------->
    <!-------------------------- Debug ------------------------->
    <!---------------------------------------------------------->
    <!-- <div>Answer Doc ID: {{ answersDocId }}</div>
    <div>User Doc ID: {{ userDocId }}</div>
    <div>Task ID: {{ taskId }}</div> -->
    <!-- <h3>Timeline</h3>
    <div>Task ID: {{ taskId }}</div>
    <div>Task Key: {{ taskKey }}</div>
    <div>Evaluator Audio URL: {{ audioUrlEvaluator }}</div>
    <div>Moderator Audio URL: {{ audioUrlModerator }}</div>
    <div v-else>No transcription selected yet.</div> -->
    <!-- fetch/use the transcription doc by id here -->
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
        v-else
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

// Services
import { transcribe } from '@/app/services/transcription/TranscriptionService'

// JS props (no types)
const props = defineProps({
  answersDocId: { type: String, default: null },
  userDocId: { type: String, default: null },
  taskId: { type: [String, Number], required: true },
  audioUrlEvaluator: { type: String, default: null },
  audioUrlModerator: { type: String, default: null },
  showMediaPlayers: { type: Boolean, default: true },
  showInlineResult: { type: Boolean, default: true },
})

const emit = defineEmits(['saved'])

const isTranscribing = ref(false)
const transcriptSegments = ref([])

const snackbar = ref({
  visible: false,
  text: '',
  color: '', // Use a valid color name or hex code
})

// UI selections
const selectedProvider = ref('whisper') // default

const providers = [
  { label: 'Whisper (local)', value: 'whisper' },
  { label: 'OpenAI Whisper API', value: 'openai' },
]

const selectedModel = computed(() =>
  selectedProvider.value === 'openai' ? 'whisper-1' : 'medium',
)

import TranscriptionList from '@/ux/UserTest/components/transcription/TranscriptionList.vue'

// Controllers
import TranscriptionController from '@/ai/transcriptions/TranscriptionController'
const transcriptionController = new TranscriptionController()

import AnswerController from '@/shared/controllers/AnswerController'
const answerController = new AnswerController()

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

  // const provider = 'whisper'
  // const model = 'tiny' // You can change the model as needed
  // const provider = "openai"
  // const model = "whisper-1"
  const provider = selectedProvider.value
  const model = selectedModel.value

  try {
    // Show snackbar notificationz
    snackbar.value = {
      visible: true,
      text: 'Transcribing session, please wait...',
      color: 'orange',
    }

    // Clear previous segments
    transcriptSegments.value = []

    const [evaluator, moderator] = await Promise.all([
      transcribeAudio(provider, model, props.audioUrlEvaluator, 'evaluator'),
      transcribeAudio(provider, model, props.audioUrlModerator, 'moderator'),
    ])
    const evaluatorSegs = evaluator.segments ?? []
    const moderatorSegs = moderator.segments ?? []

    // Combine and sort segments by start time
    transcriptSegments.value = [...evaluatorSegs, ...moderatorSegs].sort(
      (a, b) => a.start - b.start,
    )

    snackbar.value = {
      visible: true,
      text: 'Transcription completed successfully!',
      color: 'green',
    }

    // TODO: Save transcription to backend and get a transcription ID
    const result = await transcriptionController.create({
      answersDocId: props.answersDocId,
      userDocId: props.userDocId,
      taskId: String(props.taskId),
      provider,
      model,
      evaluator: {
        language: evaluator.language,
        transcript: evaluator.transcript,
        segments: evaluatorSegs.map((seg) => ({
          start: seg.start,
          end: seg.end,
          text: seg.text,
        })),
      },
      moderator: {
        language: moderator.language,
        transcript: moderator.transcript,
        segments: moderatorSegs.map((seg) => ({
          start: seg.start,
          end: seg.end,
          text: seg.text,
        })),
      },
    })

    // result.id should be the new transcription id
    await answerController.updateTaskTranscriptionMeta({
      answersDocId: props.answersDocId,
      userDocId: props.userDocId,
      taskId: String(props.taskId),
      latestId: result.id,
    })

    snackbar.value = {
      visible: true,
      text: 'Transcription saved successfully!',
      color: 'green',
    }

    emit('saved', result)
  } catch {
    snackbar.value = {
      visible: true,
      text: 'Error during transcription. Please try again.',
      color: 'red',
    }
  } finally {
    isTranscribing.value = false
  }
}

async function transcribeAudio(provider, model, audioUrl, role) {
  try {
    if (!audioUrl) return { language: null, segments: [], transcript: '' }

    const data = await transcribe({ audio_url: audioUrl, provider, model })

    if (data.status !== 'success' || !data.segments) {
      throw new Error(
        `Transcription failed for ${role}: ${
          data.message || 'No segments found'
        }`,
      )
    }

    const segments = data.segments.map((segment) => ({
      ...segment,
      role,
    }))

    return { language: data.language, segments, transcript: data.transcript }
  } catch {
    return { language: null, segments: [], transcript: '' }
  }
}

// You can now use props.transcriptionId to load timeline data for the selected task
</script>
