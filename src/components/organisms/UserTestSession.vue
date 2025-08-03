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
                            <v-btn color="orange" class="mb-4 text-white" @click="transcribeBothMock">
                                🎙 Transcribe
                            </v-btn>

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
</template>

<script>
// External Libraries
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// Components


// Controllers


export default {
    components: {
        QuillEditor,
    },
    data() {
        return {
            selectedUserID: null, // Will store the selected user ID


            tab: 0, // ← active tab index

            transcriptSegments: [], // ← segments of the transcript

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
        getMockModeratorSegments() {
            return [
                { id: 1, start: 0, end: 4, text: "Hello and welcome", role: "moderator" },
                { id: 2, start: 8, end: 12, text: "Can you share your thoughts?", role: "moderator" }
            ]
        },
        getMockEvaluatorSegments() {
            return [
                { id: 3, start: 4, end: 8, text: "I'm ready to begin", role: "evaluator" },
                { id: 4, start: 12, end: 16, text: "Sure! I think the app is really intuitive.", role: "evaluator" }
            ]
        },
        transcribeBothMock() {
            const all = [...this.getMockModeratorSegments(), ...this.getMockEvaluatorSegments()]
            this.transcriptSegments = all.sort((a, b) => a.start - b.start)
        },
        formatTime(seconds) {
            const min = Math.floor(seconds / 60).toString().padStart(2, '0')
            const sec = Math.floor(seconds % 60).toString().padStart(2, '0')
            return `${min}:${sec}`
        }

    },
}


import { ref } from 'vue'

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