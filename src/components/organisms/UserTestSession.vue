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

        <v-card flat v-if="usersID">
            <v-row class="ma-0 pa-0">
                <!------------------------------------------------------------------------------------------------------------------------->
                <!--------------------------------------------- Answers List [Left] ------------------------------------------------------->
                <!------------------------------------------------------------------------------------------------------------------------->
                <v-col class="ma-0 pa-0 task-list" cols="3">
                    <v-list density="compact" class="list-scroll">
                        <v-list-subheader>Evaluators</v-list-subheader>
                        <v-divider />
                        <v-list v-model:selected="selectedUserID" selection-mode="single">
                            <v-list-item v-for="(item, i) in usersID" :key="i" :value="item"
                                :active="selectedUserID === item" @click="selectedUserID = item">
                                <v-list-item-title>
                                    {{ getCooperatorEmail(item) }}
                                    <!-- {{ item }} -->
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-list>
                </v-col>
            </v-row>
        </v-card>
    </v-container>
</template>

<script>
// External Libraries

// Components


// Controllers

export default {
    components: {

    },
    data() {
        return {
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
    },
}


import { ref } from 'vue'

const tab = ref(0)
const selectedUser = ref(null)

</script>


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