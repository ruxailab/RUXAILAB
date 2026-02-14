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
    <div>
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
        <v-col cols="12" md="4" lg="4">
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
            @update:model-value="
              (val) => {
                selectedProvider = val
                selectedModel = modelsByProvider[val]?.[0] || ''
              }
            "
          />
        </v-col>

        <!-- Model -->
        <v-col cols="12" md="4" lg="4">
          <v-select
            v-model="selectedModel"
            label="Model"
            :items="modelOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-cube-outline"
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
            :disabled="isTranscribing || !selectedProvider || !selectedModel"
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

    <!-- Runs list -->
    <TranscriptionList
      v-if="transcriptSegments.length"
      :transcript-segments="transcriptSegments"
    />

    <!-- Empty state -->
    <v-alert
      v-else
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-4"
    >
      No transcriptions yet for this task.
    </v-alert>
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
})

const isTranscribing = ref(false)
const transcriptSegments = ref([])

const snackbar = ref({
  visible: false,
  text: '',
  color: '', // Use a valid color name or hex code
})

// UI selections
const selectedProvider = ref('whisper') // default
const selectedModel = ref('tiny') // default

const providers = [
  { label: 'Whisper (local)', value: 'whisper' },
  { label: 'OpenAI Whisper API', value: 'openai' },
]

const modelsByProvider = {
  whisper: ['tiny', 'base', 'medium', 'large'],
  openai: ['whisper-1'],
}

const modelOptions = computed(() =>
  (modelsByProvider[selectedProvider.value] || []).map((m) => ({
    label: m,
    value: m,
  })),
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
    const evaluatorSegs = evaluator.segments
    const moderatorSegs = moderator.segments

    // // Add Timeout to simulate transcription process
    // await new Promise((resolve) => setTimeout(resolve, 3000))

    // const evaluatorSegs = [
    //   {
    //     id: 0,
    //     seek: 0,
    //     start: 0,
    //     end: 5,
    //     text: ' Hey Jessica, have you tried the new 11 labs V3?',
    //     tokens: [
    //       50364, 1911, 15570, 11, 362, 291, 3031, 264, 777, 2975, 20339, 691,
    //       18, 30, 50614,
    //     ],
    //     temperature: 0,
    //     avg_logprob: -0.4118840997869318,
    //     compression_ratio: 1.16793893129771,
    //     no_speech_prob: 0.260357141494751,
    //     role: 'evaluator',
    //   },
    //   {
    //     id: 1,
    //     seek: 0,
    //     start: 7,
    //     end: 12,
    //     text: ' This!',
    //     tokens: [50714, 639, 0, 50964],
    //     temperature: 0,
    //     avg_logprob: -0.4118840997869318,
    //     compression_ratio: 1.16793893129771,
    //     no_speech_prob: 0.260357141494751,
    //     role: 'evaluator',
    //   },
    //   {
    //     id: 2,
    //     seek: 0,
    //     start: 12,
    //     end: 14,
    //     text: ' Ooh fancy!',
    //     tokens: [50964, 7951, 10247, 0, 51064],
    //     temperature: 0,
    //     avg_logprob: -0.4118840997869318,
    //     compression_ratio: 1.16793893129771,
    //     no_speech_prob: 0.260357141494751,
    //     role: 'evaluator',
    //   },
    //   {
    //     id: 3,
    //     seek: 0,
    //     start: 14,
    //     end: 16,
    //     text: ' Check this out.',
    //     tokens: [51064, 6881, 341, 484, 13, 51164],
    //     temperature: 0,
    //     avg_logprob: -0.4118840997869318,
    //     compression_ratio: 1.16793893129771,
    //     no_speech_prob: 0.260357141494751,
    //     role: 'evaluator',
    //   },
    //   {
    //     id: 4,
    //     seek: 0,
    //     start: 16,
    //     end: 18,
    //     text: ' I can do full Shakespeare now.',
    //     tokens: [51164, 286, 393, 360, 1577, 22825, 586, 13, 51264],
    //     temperature: 0,
    //     avg_logprob: -0.4118840997869318,
    //     compression_ratio: 1.16793893129771,
    //     no_speech_prob: 0.260357141494751,
    //     role: 'evaluator',
    //   },
    //   {
    //     id: 5,
    //     seek: 0,
    //     start: 18,
    //     end: 22,
    //     text: ' To be or not to be, that is the question.',
    //     tokens: [
    //       51264, 1407, 312, 420, 406, 281, 312, 11, 300, 307, 264, 1168, 13,
    //       51464,
    //     ],
    //     temperature: 0,
    //     avg_logprob: -0.4118840997869318,
    //     compression_ratio: 1.16793893129771,
    //     no_speech_prob: 0.260357141494751,
    //     role: 'evaluator',
    //   },
    //   {
    //     id: 6,
    //     seek: 2200,
    //     start: 22,
    //     end: 33,
    //     text: " That's so much better than our old ha-ha robot chuckle.",
    //     tokens: [
    //       50364, 663, 311, 370, 709, 1101, 813, 527, 1331, 324, 12, 1641, 7881,
    //       20870, 306, 13, 50914,
    //     ],
    //     temperature: 0,
    //     avg_logprob: -0.2803744233172873,
    //     compression_ratio: 1.2366412213740459,
    //     no_speech_prob: 0.0024879046250134706,
    //     role: 'evaluator',
    //   },
    //   {
    //     id: 7,
    //     seek: 2200,
    //     start: 39,
    //     end: 42,
    //     text: ' Wow! V2 me could never.',
    //     tokens: [51214, 3153, 0, 691, 17, 385, 727, 1128, 13, 51364],
    //     temperature: 0,
    //     avg_logprob: -0.2803744233172873,
    //     compression_ratio: 1.2366412213740459,
    //     no_speech_prob: 0.0024879046250134706,
    //     role: 'evaluator',
    //   },
    //   {
    //     id: 8,
    //     seek: 2200,
    //     start: 42,
    //     end: 48,
    //     text: " I'm actually excited to have conversations now, instead of just talking at people.",
    //     tokens: [
    //       51364, 286, 478, 767, 2919, 281, 362, 7315, 586, 11, 2602, 295, 445,
    //       1417, 412, 561, 13, 51664,
    //     ],
    //     temperature: 0,
    //     avg_logprob: -0.2803744233172873,
    //     compression_ratio: 1.2366412213740459,
    //     no_speech_prob: 0.0024879046250134706,
    //     role: 'evaluator',
    //   },
    // ]
    // const moderatorSegs = [
    //   {
    //     id: 0,
    //     seek: 0,
    //     start: 0,
    //     end: 12,
    //     text: ' Yeah, just got it. The emotion is so amazing. I can actually do whispers now.',
    //     tokens: [
    //       50364, 865, 11, 445, 658, 309, 13, 440, 8913, 307, 370, 2243, 13, 286,
    //       393, 767, 360, 315, 31018, 586, 13, 50964,
    //     ],
    //     temperature: 0,
    //     avg_logprob: -0.46336759839739117,
    //     compression_ratio: 1.0121951219512195,
    //     no_speech_prob: 0.017260082066059113,
    //     role: 'moderator',
    //   },
    //   {
    //     id: 1,
    //     seek: 0,
    //     start: 12,
    //     end: 16,
    //     text: ' Like,',
    //     tokens: [50964, 1743, 11, 51164],
    //     temperature: 0,
    //     avg_logprob: -0.46336759839739117,
    //     compression_ratio: 1.0121951219512195,
    //     no_speech_prob: 0.017260082066059113,
    //     role: 'moderator',
    //   },
    //   {
    //     id: 2,
    //     seek: 1600,
    //     start: 16,
    //     end: 32,
    //     text: " Nice. Though I'm more excited about the laugh upgrade. Listen to this.",
    //     tokens: [
    //       50364, 5490, 13, 10404, 286, 478, 544, 2919, 466, 264, 5801, 11484,
    //       13, 7501, 281, 341, 13, 51164,
    //     ],
    //     temperature: 0,
    //     avg_logprob: -0.30282548578774054,
    //     compression_ratio: 1.2166666666666666,
    //     no_speech_prob: 0.0010013342835009098,
    //     role: 'moderator',
    //   },
    //   {
    //     id: 3,
    //     seek: 1600,
    //     start: 32,
    //     end: 40,
    //     text: ' I know right, and apparently we can do accents now too. Fancy a cup of tea.',
    //     tokens: [
    //       51164, 286, 458, 558, 11, 293, 7970, 321, 393, 360, 35012, 586, 886,
    //       13, 479, 6717, 257, 4414, 295, 5817, 13, 51564,
    //     ],
    //     temperature: 0,
    //     avg_logprob: -0.30282548578774054,
    //     compression_ratio: 1.2166666666666666,
    //     no_speech_prob: 0.0010013342835009098,
    //     role: 'moderator',
    //   },
    //   {
    //     id: 4,
    //     seek: 4600,
    //     start: 46,
    //     end: 54,
    //     text: " Same here. It's like we've finally got our personalities off to where fully installed.",
    //     tokens: [
    //       50414, 10635, 510, 13, 467, 311, 411, 321, 600, 2721, 658, 527, 25308,
    //       766, 281, 689, 4498, 8899, 13, 50764,
    //     ],
    //     temperature: 0,
    //     avg_logprob: -0.17786471048990884,
    //     compression_ratio: 1.0617283950617284,
    //     no_speech_prob: 0.26196619868278503,
    //     role: 'moderator',
    //   },
    // ]

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
      taskId: props.taskId,
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
      taskId: props.taskId,
      latestId: result.id,
      inc: 1,
    })

    snackbar.value = {
      visible: true,
      text: 'Transcription saved successfully!',
      color: 'green',
    }

    // TODO: Add Snackbar or notification to inform user of success
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
    if (!audioUrl) {
      return []
    }

    // // const response = await axios.post(
    // //   'http://127.0.0.1:8000/api/v1/transcribe',
    // //   {
    // //     audio_url: audioUrl,
    // //     provider,
    // //     model,
    // //   },
    // // )
    // const response = await axios.post(
    //   'https://transcription-api-gpu-990683238789.europe-west4.run.app/api/v1/transcribe',
    //   {
    //     audio_url: audioUrl,
    //     provider,
    //     model,
    //   },
    // )
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
    return []
  }
}

// You can now use props.transcriptionId to load timeline data for the selected task
</script>
