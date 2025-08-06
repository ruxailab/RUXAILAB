<template>
    <ShowInfo :title="task?.taskName || taskName">
        <template #content>
            <div class="test-content pa-4 rounded-xl">
                <!-- STAGE 1: Show title and description -->
                <template v-if="stage === 1">
                    <div class="rich-text mb-4" v-html="task?.taskDescription || taskDescription" />
                    <v-row v-if="task?.taskLink || taskLink" justify="center">
                        <v-col cols="12" class="text-center">
                            <a :href="task?.taskLink || taskLink" target="_blank"
                                class="text-primary font-weight-medium">
                                {{ task?.taskLink || taskLink }}
                            </a>
                        </v-col>
                    </v-row>
                    <v-row justify="center" class="mt-6">
                        <v-col cols="auto">
                            <v-btn color="primary" @click="startTask">Empezar tarea</v-btn>
                        </v-col>
                    </v-row>
                </template>
                <!-- STAGE 2: Task answer -->
                <template v-else-if="stage === 2">
                    <v-row class="mb-4 d-flex align-center">
                        <v-col cols="auto">
                            <v-chip color="primary" class="mr-2">
                                Tiempo: {{ elapsedTimeDisplay }}
                            </v-chip>
                        </v-col>
                        <v-col v-if="task?.taskTip" cols="auto">
                            <TipButton :task="task" />
                        </v-col>
                        <v-col v-if="task?.hasAudioRecord !== false" cols="auto">
                            <AudioRecorder :test-id="testId" :task-index="taskIndex"
                                @show-loading="$emit('show-loading')" @stop-show-loading="$emit('stop-show-loading')"
                                @recording-started="$emit('recording-started', $event)" />
                        </v-col>
                        <v-col v-if="isVisualizerVisible" cols="auto">
                            <AudioVisualizer />
                        </v-col>
                        <v-col v-if="task?.hasCamRecord !== false" cols="auto">
                            <VideoRecorder ref="videoRecorder" :test-id="testId" :task-index="taskIndex"
                                @show-loading="$emit('show-loading')" @stop-show-loading="$emit('stop-show-loading')" />
                        </v-col>
                        <v-col v-if="task?.hasScreenRecord !== false" cols="auto">
                            <ScreenRecorder :test-id="testId" :task-index="taskIndex"
                                @show-loading="$emit('show-loading')" @stop-show-loading="$emit('stop-show-loading')" />
                        </v-col>
                        <v-spacer />
                        <v-col cols="auto">
                            <Timer ref="timerComponent" :task-index="taskIndex" @timer-stopped="onTimerStopped" />
                        </v-col>
                    </v-row>
                    <div class="mt-4">
                        <v-textarea v-if="task?.taskType === 'text-area' && !submitted"
                            :id="'id-' + (task?.taskName || taskName)" v-model="localTaskAnswer"
                            @update:modelValue="onUpdateTaskAnswer" variant="outlined" label="Answer" rows="3" />
                        <v-textarea v-if="!submitted" :id="'id-' + (task?.taskName || taskName) + '-obs'"
                            v-model="localTaskObservations" @update:modelValue="onUpdateTaskObservations"
                            variant="outlined" label="Observation (optional)" rows="3" />
                    </div>
                    <v-row justify="space-between">
                        <v-col>
                            <v-btn color="error" block variant="outlined" class="mr-2"
                                @click="handleShowPostForm(false)">
                                Could not finish
                            </v-btn>
                        </v-col>
                        <v-col>
                            <v-btn color="primary" block variant="flat" class="ml-2" @click="handleShowPostForm(true)">
                                Done
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
                <!-- STAGE 3:POST-TASK form -->
                <template v-else-if="stage === 3">
                    <div v-if="task?.taskType === 'sus'">
                        <SusForm :task-index="taskIndex" v-model="localSusAnswers"
                            @update:modelValue="val => emit('update:susAnswers', val)" />
                    </div>
                    <div v-if="task?.taskType === 'nasa-tlx'">
                        <nasaTlxForm :nasa-tlx="nasaTlxAnswers" @update:nasaTlx="onUpdateNasaTlx" />
                    </div>
                    <v-row justify="end">
                        <v-col cols="12">
                            <p v-if="task?.taskType === 'sus' && doneTaskDisabled" class="text-error mb-4">
                                Por favor, responde a todas las preguntas antes de continuar.
                            </p>
                            <v-btn color="primary" block variant="flat" class="ml-2" :disabled="doneTaskDisabled"
                                @click="emitDoneOrCouldNotFinish()">
                                Finalizar tarea
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
                <video v-if="videoUrl === ''" id="vpreview" class="d-none" autoplay />
            </div>
        </template>
    </ShowInfo>
</template>

<script setup>
const props = defineProps({
    task: Object,
    taskName: String,
    taskDescription: String,
    taskLink: String,
    postQuestion: String,
    postForm: String,
    postAnswer: String,
    taskAnswer: String,
    taskObservations: String,
    susAnswers: Array,
    nasaTlxAnswers: Object,
    testId: String,
    taskIndex: Number,
    submitted: Boolean,
    doneTaskDisabled: Boolean,
    videoUrl: String,
});
const emit = defineEmits([
    'done',
    'couldNotFinish',
    'update:postAnswer',
    'update:taskAnswer',
    'update:taskObservations',
    'show-loading',
    'stop-show-loading',
    'recording-started',
    'timer-stopped',
    'update:susAnswers',
    'update:nasaTlxAnswers',
]);

import { ref, watch, nextTick, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import TipButton from '@/components/atoms/TipButton.vue';
import AudioRecorder from '@/components/atoms/AudioRecorder.vue';
import AudioVisualizer from '@/components/atoms/AudioVisualizer.vue';
import VideoRecorder from '@/components/atoms/VideoRecorder.vue';
import ScreenRecorder from '@/components/atoms/ScreenRecorder.vue';
import Timer from '@/components/atoms/Timer.vue';
import SusForm from '@/components/atoms/SusForm.vue';
import nasaTlxForm from '@/components/atoms/nasaTlxForm.vue';

onBeforeUnmount(() => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
});
const store = useStore();
const susAnswersFromStore = computed(() => {
    return store.state.tasks?.[props.taskIndex]?.susAnswers || [];
});

const localSusAnswers = computed({
    get: () => props.susAnswers || [],
    set: (val) => emit('update:susAnswers', val)
});

const stage = ref(1);
const elapsedTimeDisplay = ref('0:00');
let taskStartTime = null;
let timerInterval = null;

function updateElapsedTime() {
    if (!taskStartTime) return;
    const elapsed = Math.floor((Date.now() - taskStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    elapsedTimeDisplay.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startTask() {
    stage.value = 2;
    taskStartTime = Date.now();
    timerInterval = setInterval(updateElapsedTime, 1000);
    nextTick(() => {
        if (props.task?.taskLink || props.taskLink) {
            window.open(props.task?.taskLink || props.taskLink, '_blank');
        }
        setTimeout(() => {
            const timer = document.querySelector('[ref=timerComponent]');
            if (timer && timer.startTimer) timer.startTimer();
        }, 100);
    });
}

const showPostForm = ref(false);

function handleShowPostForm(userCompleted) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    let finalTime = null;
    if (taskStartTime) {
        finalTime = Math.round((Date.now() - taskStartTime) / 1000);
        console.log('Tiempo detenido en:', finalTime, 'segundos');
        emit('timer-stopped', finalTime, props.taskIndex);
    }

    if (props.task?.taskType === 'sus' || props.task?.taskType === 'nasa-tlx') {
        showPostForm.userCompleted = userCompleted;
        stage.value = 3;
    } else {
        showPostForm.userCompleted = userCompleted;
        emitDoneOrCouldNotFinish(finalTime);
    }
}

function emitDoneOrCouldNotFinish(savedTime) {
    if (showPostForm.userCompleted) {
        emit('done', savedTime, props.taskIndex);
    } else {
        emit('couldNotFinish', savedTime, props.taskIndex);
    }
    stage.value = 1;
    showPostForm.value = false;
    showPostForm.userCompleted = undefined;
    taskStartTime = null;
    elapsedTimeDisplay.value = '0:00';
}

const localPostAnswer = ref(props.postAnswer);
const localTaskAnswer = ref(props.taskAnswer);
const localTaskObservations = ref(props.taskObservations);
const isVisualizerVisible = ref(false);

watch(() => props.postAnswer, val => { localPostAnswer.value = val; });
watch(() => props.taskAnswer, val => { localTaskAnswer.value = val; });
watch(() => props.taskObservations, val => { localTaskObservations.value = val; });

function onPostAnswerInput(val) {
    localPostAnswer.value = val;
    emit('update:postAnswer', val);
}
function onUpdateTaskAnswer(val) {
    localTaskAnswer.value = val;
    emit('update:taskAnswer', val);
}
function onUpdateTaskObservations(val) {
    localTaskObservations.value = val;
    emit('update:taskObservations', val);
}
function onUpdateNasaTlx(val) {
    emit('update:nasaTlxAnswers', val);
}
function onTimerStopped(elapsedTime) {
    emit('timer-stopped', elapsedTime, props.taskIndex);
}
</script>
