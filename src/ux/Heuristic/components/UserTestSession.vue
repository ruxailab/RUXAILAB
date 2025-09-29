<template>
    <v-container fluid class="py-6" style="height: 100%; background-color: white;">
        <!-- TOP TITLE -->
        <!------------------------------------------------------------------------------------------------------------------------->
        <!----------------------------------------------------- Title ------------------------------------------------------------->
        <!------------------------------------------------------------------------------------------------------------------------->
        <v-row class="mb-6">
            <v-col cols="12" class="text-center">
                <h1 class="text-h4 font-weight-bold d-flex align-center justify-center">
                    <v-icon class="mr-2" color="success">mdi-video-account</v-icon>
                    Session Analytics
                </h1>
            </v-col>
        </v-row>
        selectedUserID : {{ selectedUserID }}

        <v-card flat v-if="usersID">
            <v-row class="ma-0 pa-0">
                <!------------------------------------------------------------------------------------------------------------------------->
                <!--------------------------------------------- Answers List [Left] ------------------------------------------------------->
                <!------------------------------------------------------------------------------------------------------------------------->
                <v-col class="ma-0 pa-0 task-list" cols="3">
                    <v-list density="compact" class="list-scroll">
                        <v-list-subheader>Evaluators</v-list-subheader>
                        <v-divider />
                        <v-list dense nav>
                            <v-list-item v-for="(item, i) in usersID" :key="i" @click="selectedUserID = item"
                                :class="selectedUserID === item ? 'selected-user' : ''" class="rounded">
                                <v-list-item-title>
                                    {{ getCooperatorEmail(item) }}
                                    <!-- {{ item }} -->
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-list>
                </v-col>


                <!------------------------------------------------------------------------------------------------------------------------->
                <!--------------------------------------------- Vertical Line [Split] ----------------------------------------------------->
                <!------------------------------------------------------------------------------------------------------------------------->
                <v-divider vertical inset />

                <!------------------------------------------------------------------------------------------------------------------------->
                <!--------------------------------------------- Session Content [Right] --------------------------------------------------->
                <!------------------------------------------------------------------------------------------------------------------------->
                <v-col class="ma-0 pa-1 answer-list" cols="9">
                    <v-tabs v-model="tab" color="orange" class="mb-4">
                        <v-tab>Transcription</v-tab>
                        <v-tab>Timeline</v-tab>
                        <v-tab>Export</v-tab>
                    </v-tabs>

                    <v-sheet elevation="0" class="pa-6 rounded-lg" color="#FAFAFA" v-if="selectedUserID">
                        <!-- TAB 0: Transcription -->
                        <template v-if="tab === 0">

                            <div class="mb-4">
                                <div v-if="selectedAnswerDocument?.audioUrlEvaluator">
                                    <h4>🎧 Evaluator Audio</h4>
                                    <audio :src="selectedAnswerDocument.audioUrlEvaluator" controls
                                        style="width: 100%;" />
                                </div>

                                <div v-if="selectedAnswerDocument?.audioUrlModerator" class="mt-4">
                                    <h4>🎤 Moderator Audio</h4>
                                    <audio :src="selectedAnswerDocument.audioUrlModerator" controls
                                        style="width: 100%;" />
                                </div>
                            </div>

                            <!-- Align button to right -->
                            <div v-if="selectedAnswerDocument?.audioUrlEvaluator || selectedAnswerDocument?.audioUrlModerator"
                                class="d-flex justify-end">
                                <v-btn :loading="isTranscribing" :disabled="isTranscribing" color="orange"
                                    class="mb-4 text-white" @click="transcribeSession">
                                    🎙 Transcribe
                                </v-btn>
                            </div>

                            <v-sheet v-if="transcriptSegments.length" class="pa-4 mt-4 rounded-lg" color="#fffef5">
                                <v-timeline side="end" density="comfortable">
                                    <v-timeline-item v-for="segment in transcriptSegments" :key="segment.id"
                                        :dot-color="segment.role === 'moderator' ? 'blue-darken-2' : 'orange-darken-2'"
                                        :icon="segment.role === 'moderator' ? 'mdi-account-tie' : 'mdi-laptop-account'"
                                        size="small">
                                        <div class="text-grey-darken-2 font-weight-medium">
                                            <span class="font-weight-bold">{{ formatTime(segment.start) }}–{{
                                                formatTime(segment.end) }}</span>
                                            &nbsp; {{ segment.text }}
                                        </div>
                                    </v-timeline-item>
                                </v-timeline>
                            </v-sheet>

                            <!-- <v-sheet v-if="transcriptSegments.length" class="pa-4 mt-4 rounded-lg" color="#fffef5">
                                <v-timeline side="end" density="comfortable">
                                    <v-timeline-item v-for="segment in transcriptSegments" :key="segment.id"
                                        :dot-color="segment.role === 'moderator' ? 'blue-darken-2' : 'orange-darken-2'"
                                        :icon="segment.role === 'moderator' ? 'mdi-teach' : 'mdi-laptop-account'"
                                        size="small">
                                        <div :class="segment.role === 'moderator' ? 'text-blue-darken-2' : 'text-orange-darken-2'"
                                            class="font-weight-medium">
                                            <span class="text-grey-darken-2">
                                                {{ formatTime(segment.start) }}–{{ formatTime(segment.end) }}
                                            </span>
                                            &nbsp;
                                            <strong>
                                                {{ segment.role === 'moderator' ? '🧑‍🏫 Moderator' : '🧑‍💻 Evaluator'
                                                }}:
                                            </strong>
                                            <span class="ml-1">{{ segment.text }}</span>
                                        </div>
                                    </v-timeline-item>
                                </v-timeline>
                            </v-sheet> -->

                            <!-- <v-sheet v-if="transcriptSegments.length" class="pa-4 mt-4 rounded-lg" color="#fffef5">
                                <v-timeline side="end" density="comfortable">
                                    <v-timeline-item v-for="segment in transcriptSegments" :key="segment.id"
                                        :dot-color="segment.role === 'moderator' ? 'blue-darken-2' : 'orange-darken-2'"
                                        :icon="segment.role === 'moderator' ? 'mdi-teach' : 'mdi-laptop-account'"
                                        size="small">
                                        <template #opposite>
                                            <span class="text-grey-darken-2 font-weight-bold">
                                                {{ formatTime(segment.start) }}–{{ formatTime(segment.end) }}
                                            </span>
                                        </template>

<div :class="segment.role === 'moderator' ? 'text-blue-darken-2' : 'text-orange-darken-2'">
    <strong>
        {{ segment.role === 'moderator' ? '🧑‍🏫 Moderator' : '🧑‍💻 Evaluator'
        }}:
    </strong>
    <span class="ml-1">{{ segment.text }}</span>
</div>
</v-timeline-item>
</v-timeline>
</v-sheet>
<v-sheet v-if="transcriptSegments.length" class="pa-4 mt-4" color="#fff8e1">
    <v-row v-for="segment in transcriptSegments" :key="segment.id" class="py-2">
        <v-col cols="3" class="font-weight-bold text-grey-darken-2">
            ⏱ {{ formatTime(segment.start) }}–{{ formatTime(segment.end) }}
        </v-col>
        <v-col cols="9">
            <div :class="segment.role === 'moderator' ? 'text-blue-darken-2' : 'text-orange-darken-2'">
                <strong>{{ segment.role === 'moderator' ? '🧑‍🏫\ Moderator' :
                    '🧑‍💻\ Evaluator' }}:</strong>
                {{ segment.text }}
            </div>
        </v-col>
    </v-row>
</v-sheet> -->

                            <!-- <v-btn class="mb-2" color="primary">Transcribe Evaluator</v-btn>
                            <v-btn class="mb-2 ml-2" color="primary">Transcribe Moderator</v-btn> -->

                            <!-- <v-sheet class="mt-4 pa-4" color="#fff8e1" style="min-height: 200px;">
                                <p style="color: grey;">(Transcript will appear here...)</p>
                            </v-sheet> -->
                        </template>

                        <!-- TAB 1: Timeline -->
                        <template v-else-if="tab === 1">
                            <p>⏱️ Timeline data will be shown here...</p>
                        </template>

                        <!-- TAB 2: Export -->
                        <template v-else-if="tab === 2">
                            <v-btn class="mt-2" color="success">💾 Save to Firestore</v-btn>
                            <v-btn class="mt-2 ml-2" color="blue">📄 Export as PDF</v-btn>
                        </template>
                    </v-sheet>
                </v-col>
            </v-row>
        </v-card>
    </v-container>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" :timeout="4000">
        {{ snackbar.text }}
        <template #actions>
            <v-btn color="white" variant="text" @click="snackbar.visible = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>


<script>
// External Libraries
import axios from 'axios'

// import { QuillEditor } from '@vueup/vue-quill'
// import '@vueup/vue-quill/dist/vue-quill.snow.css'

// Components


// Controllers


export default {
    components: {
        // QuillEditor,
    },
    data() {
        return {
            selectedUserID: null, // Will store the selected user ID

            tab: 0, // ← active tab index
            isTranscribing: false, // ✅ classic boolean
            transcriptSegments: [], // ← segments of the transcript

            // State Management
            snackbar: {
                visible: false,
                text: '',
                color: '', // Use a valid color name or hex code
            },
        }
    },
    computed: {
        testDocument() {
            return this.$store.getters.test; // Derived state
        },
        testAnswerDocument() {
            return this.$store.getters.testAnswerDocument.taskAnswers; // Access the store getter
        },
        usersID() {
            return Object.values(this.testAnswerDocument).map(answer => answer.userDocId);
        },
        // Compute selectedAnswerDocument based on selectedUserID
        selectedAnswerDocument() {
            return this.testAnswerDocument[this.selectedUserID] || null;
        },
    },
    watch: {
        selectedUserID: {
            immediate: true, // Runs when the component is mounted
            async handler(newUserId) {
                if (!newUserId) return;
                // TODO Fetch Previous Results :D (Cached Before)
                // this.fetchSelectedAnswerSentiment();
            },
        },
    },
    mounted() {
        console.log('Component is mounted!');
    },
    methods: {
        getCooperatorEmail(userDocId) {
            let cooperatorEmail = null;
            if (this.testDocument.cooperators && Array.isArray(this.testDocument.cooperators)) {
                for (const element of this.testDocument.cooperators) {
                    if (element && element.email && element.userDocId === userDocId) {
                        cooperatorEmail = element.email;
                    }
                }
            }
            return cooperatorEmail;
        },
        async transcribeAudio(audioUrl, role) {
            try {
                if (!audioUrl) {
                    console.warn(`⚠️ No audio URL provided for ${role}. Skipping transcription.`)
                    return []
                }

                // const response = await axios.post('http://127.0.0.1:8000/api/v1/transcribe', {
                //     audio_url: audioUrl,
                //     provider: "openai",
                //     model: "whisper-1"
                // })
                const response = await axios.post('http://127.0.0.1:8000/api/v1/transcribe', {
                    audio_url: audioUrl,
                    provider: "whisper",
                    model: "tiny"
                })

                const data = response.data

                if (data.status !== 'success' || !data.segments) {
                    throw new Error(`Transcription failed for ${role}: ${data.message || 'No segments found'}`)
                }

                const segments = data.segments.map(segment => ({
                    ...segment,
                    role
                }))

                return segments

            } catch (error) {
                console.error(`❌ Error during ${role} transcription:`, error)
                return []
            }
        },
        async transcribeSession() {
            this.isTranscribing = true // ✅ no .value needed

            this.snackbar = {
                visible: true,
                text: 'Transcribing session, please wait...',
                color: 'orange',
            }
            try {
                // Clear previous segments
                this.transcriptSegments = []

                // const [evaluatorSegs, moderatorSegs] = await Promise.all([
                //     this.transcribeAudio(this.selectedAnswerDocument.audioUrlEvaluator, 'evaluator'),
                //     this.transcribeAudio(this.selectedAnswerDocument.audioUrlModerator, 'moderator')
                // ])
                // console.log('Evaluator Segments:', evaluatorSegs)
                // console.log('Moderator Segments:', moderatorSegs)

                const evaluatorSegs = [
                    {
                        "id": 0,
                        "seek": 0,
                        "start": 0,
                        "end": 5,
                        "text": " Hey Jessica, have you tried the new 11 labs V3?",
                        "tokens": [
                            50364,
                            1911,
                            15570,
                            11,
                            362,
                            291,
                            3031,
                            264,
                            777,
                            2975,
                            20339,
                            691,
                            18,
                            30,
                            50614
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.4118840997869318,
                        "compression_ratio": 1.16793893129771,
                        "no_speech_prob": 0.260357141494751,
                        "role": "evaluator"
                    },
                    {
                        "id": 1,
                        "seek": 0,
                        "start": 7,
                        "end": 12,
                        "text": " This!",
                        "tokens": [
                            50714,
                            639,
                            0,
                            50964
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.4118840997869318,
                        "compression_ratio": 1.16793893129771,
                        "no_speech_prob": 0.260357141494751,
                        "role": "evaluator"
                    },
                    {
                        "id": 2,
                        "seek": 0,
                        "start": 12,
                        "end": 14,
                        "text": " Ooh fancy!",
                        "tokens": [
                            50964,
                            7951,
                            10247,
                            0,
                            51064
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.4118840997869318,
                        "compression_ratio": 1.16793893129771,
                        "no_speech_prob": 0.260357141494751,
                        "role": "evaluator"
                    },
                    {
                        "id": 3,
                        "seek": 0,
                        "start": 14,
                        "end": 16,
                        "text": " Check this out.",
                        "tokens": [
                            51064,
                            6881,
                            341,
                            484,
                            13,
                            51164
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.4118840997869318,
                        "compression_ratio": 1.16793893129771,
                        "no_speech_prob": 0.260357141494751,
                        "role": "evaluator"
                    },
                    {
                        "id": 4,
                        "seek": 0,
                        "start": 16,
                        "end": 18,
                        "text": " I can do full Shakespeare now.",
                        "tokens": [
                            51164,
                            286,
                            393,
                            360,
                            1577,
                            22825,
                            586,
                            13,
                            51264
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.4118840997869318,
                        "compression_ratio": 1.16793893129771,
                        "no_speech_prob": 0.260357141494751,
                        "role": "evaluator"
                    },
                    {
                        "id": 5,
                        "seek": 0,
                        "start": 18,
                        "end": 22,
                        "text": " To be or not to be, that is the question.",
                        "tokens": [
                            51264,
                            1407,
                            312,
                            420,
                            406,
                            281,
                            312,
                            11,
                            300,
                            307,
                            264,
                            1168,
                            13,
                            51464
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.4118840997869318,
                        "compression_ratio": 1.16793893129771,
                        "no_speech_prob": 0.260357141494751,
                        "role": "evaluator"
                    },
                    {
                        "id": 6,
                        "seek": 2200,
                        "start": 22,
                        "end": 33,
                        "text": " That's so much better than our old ha-ha robot chuckle.",
                        "tokens": [
                            50364,
                            663,
                            311,
                            370,
                            709,
                            1101,
                            813,
                            527,
                            1331,
                            324,
                            12,
                            1641,
                            7881,
                            20870,
                            306,
                            13,
                            50914
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.2803744233172873,
                        "compression_ratio": 1.2366412213740459,
                        "no_speech_prob": 0.0024879046250134706,
                        "role": "evaluator"
                    },
                    {
                        "id": 7,
                        "seek": 2200,
                        "start": 39,
                        "end": 42,
                        "text": " Wow! V2 me could never.",
                        "tokens": [
                            51214,
                            3153,
                            0,
                            691,
                            17,
                            385,
                            727,
                            1128,
                            13,
                            51364
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.2803744233172873,
                        "compression_ratio": 1.2366412213740459,
                        "no_speech_prob": 0.0024879046250134706,
                        "role": "evaluator"
                    },
                    {
                        "id": 8,
                        "seek": 2200,
                        "start": 42,
                        "end": 48,
                        "text": " I'm actually excited to have conversations now, instead of just talking at people.",
                        "tokens": [
                            51364,
                            286,
                            478,
                            767,
                            2919,
                            281,
                            362,
                            7315,
                            586,
                            11,
                            2602,
                            295,
                            445,
                            1417,
                            412,
                            561,
                            13,
                            51664
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.2803744233172873,
                        "compression_ratio": 1.2366412213740459,
                        "no_speech_prob": 0.0024879046250134706,
                        "role": "evaluator"
                    }
                ]
                const moderatorSegs = [

                    {
                        "id": 0,
                        "seek": 0,
                        "start": 0,
                        "end": 12,
                        "text": " Yeah, just got it. The emotion is so amazing. I can actually do whispers now.",
                        "tokens": [
                            50364,
                            865,
                            11,
                            445,
                            658,
                            309,
                            13,
                            440,
                            8913,
                            307,
                            370,
                            2243,
                            13,
                            286,
                            393,
                            767,
                            360,
                            315,
                            31018,
                            586,
                            13,
                            50964
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.46336759839739117,
                        "compression_ratio": 1.0121951219512195,
                        "no_speech_prob": 0.017260082066059113,
                        "role": "moderator"
                    },
                    {
                        "id": 1,
                        "seek": 0,
                        "start": 12,
                        "end": 16,
                        "text": " Like,",
                        "tokens": [
                            50964,
                            1743,
                            11,
                            51164
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.46336759839739117,
                        "compression_ratio": 1.0121951219512195,
                        "no_speech_prob": 0.017260082066059113,
                        "role": "moderator"
                    },
                    {
                        "id": 2,
                        "seek": 1600,
                        "start": 16,
                        "end": 32,
                        "text": " Nice. Though I'm more excited about the laugh upgrade. Listen to this.",
                        "tokens": [
                            50364,
                            5490,
                            13,
                            10404,
                            286,
                            478,
                            544,
                            2919,
                            466,
                            264,
                            5801,
                            11484,
                            13,
                            7501,
                            281,
                            341,
                            13,
                            51164
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.30282548578774054,
                        "compression_ratio": 1.2166666666666666,
                        "no_speech_prob": 0.0010013342835009098,
                        "role": "moderator"
                    },
                    {
                        "id": 3,
                        "seek": 1600,
                        "start": 32,
                        "end": 40,
                        "text": " I know right, and apparently we can do accents now too. Fancy a cup of tea.",
                        "tokens": [
                            51164,
                            286,
                            458,
                            558,
                            11,
                            293,
                            7970,
                            321,
                            393,
                            360,
                            35012,
                            586,
                            886,
                            13,
                            479,
                            6717,
                            257,
                            4414,
                            295,
                            5817,
                            13,
                            51564
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.30282548578774054,
                        "compression_ratio": 1.2166666666666666,
                        "no_speech_prob": 0.0010013342835009098,
                        "role": "moderator"
                    },
                    {
                        "id": 4,
                        "seek": 4600,
                        "start": 46,
                        "end": 54,
                        "text": " Same here. It's like we've finally got our personalities off to where fully installed.",
                        "tokens": [
                            50414,
                            10635,
                            510,
                            13,
                            467,
                            311,
                            411,
                            321,
                            600,
                            2721,
                            658,
                            527,
                            25308,
                            766,
                            281,
                            689,
                            4498,
                            8899,
                            13,
                            50764
                        ],
                        "temperature": 0,
                        "avg_logprob": -0.17786471048990884,
                        "compression_ratio": 1.0617283950617284,
                        "no_speech_prob": 0.26196619868278503,
                        "role": "moderator"
                    }

                ]

                // Combine and sort segments by start time
                this.transcriptSegments = [...evaluatorSegs, ...moderatorSegs].sort((a, b) => a.start - b.start)

                this.snackbar = {
                    visible: true,
                    text: 'Transcription completed successfully!',
                    color: 'green',
                }

            } catch (error) {
                console.error('❌ Error during session transcription:', error)
                this.snackbar = {
                    visible: true,
                    text: 'Error during transcription. Please try again.',
                    color: 'red',
                }
            } finally {
                this.isTranscribing = false
            }


        },
        formatTime(seconds) {
            const min = Math.floor(seconds / 60).toString().padStart(2, '0')
            const sec = Math.floor(seconds % 60).toString().padStart(2, '0')
            return `${min}:${sec}`
        }

    },
}


import { ref } from 'vue'
import th from 'zod/v4/locales/th.cjs';

const tab = ref(0)
const selectedUser = ref(null)

</script>



<style>
.cardsTitle {
    color: #455a64;
    font-size: 18px;
    font-weight: 600;
}

.list-scroll {
    height: 508px;
    overflow: auto;
}

.list-scroll::-webkit-scrollbar {
    width: 7px;
}

.list-scroll::-webkit-scrollbar-track {
    background: none;
}

.list-scroll::-webkit-scrollbar-thumb {
    background: #ffcd86;
    border-radius: 4px;
}

.list-scroll::-webkit-scrollbar-thumb:hover {
    background: #fca326;
}

.selected-user {
    background-color: #ffecb3 !important;
    /* light orange */
    /* color: #fca326 !important; */
    /* dark gray-blue for better contrast */
    font-weight: 600;
}
</style>

<!-- <template>
    <div>
        Hello
    </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useStore } from 'vuex'


const tab = ref(0)
const selectedUserId = ref(null)
const store = useStore()

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {})

// 🟡 Build options from taskAnswers keys (user IDs)
const sessionOptions = computed(() => {
    const taskAnswers = testAnswerDocument.value?.taskAnswers || {}
    return Object.entries(taskAnswers).map(([userId], i) => ({
        id: userId,
        label: `User ${i + 1}`
    }))
})

// 🟢 Select session based on selected user ID
const selectedSession = computed(() => {
    return testAnswerDocument.value?.taskAnswers?.[selectedUserId.value] || null
})

// 🔁 Auto-select first user when loaded
watch(
    () => sessionOptions.value,
    (options) => {
        if (!selectedUserId.value && options.length > 0) {
            selectedUserId.value = options[0].id
        }
    },
    { immediate: true }
)

// 🧪 Log for debugging
onMounted(() => {
    console.log('🧾 testAnswerDocument:', testAnswerDocument.value)
    console.log('📦 taskAnswers:', testAnswerDocument.value?.taskAnswers)
    console.log('📋 sessionOptions:', sessionOptions.value)
})

const audioUrlEvaluator = computed(() => testAnswerDocument.value.audioUrlEvaluator || '')
const audioUrlModerator = computed(() => testAnswerDocument.value.audioUrlModerator || '')

// For now, use mocked transcript data until you connect backend
const transcriptEvaluator = ref([
    { start: '00:00', text: "Hi, I'm ready to begin." },
    { start: '00:03', text: "Let's go to the next screen." }
])

const transcriptModerator = ref([
    { start: '00:00', text: "Hello and welcome!" },
    { start: '00:02', text: "Sure, take your time." }
])
</script> -->