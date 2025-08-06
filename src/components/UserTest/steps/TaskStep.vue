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
                        <v-col cols="auto">
                            <v-btn color="primary" block variant="flat" class="ml-2"
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

import { ref, watch, nextTick, computed } from 'vue';
import { useStore } from 'vuex';
// Acceso a la store para leer respuestas SUS
const store = useStore();
const susAnswersFromStore = computed(() => {
    return store.state.tasks?.[props.taskIndex]?.susAnswers || [];
});

// Local copy of SUS answers for v-model
const localSusAnswers = computed({
    get: () => props.susAnswers || [],
    set: (val) => emit('update:susAnswers', val)
});

const stage = ref(1);
// Guardar tiempo de inicio
let taskStartTime = null;

function startTask() {
    stage.value = 2;
    // Guardar timestamp de inicio
    taskStartTime = Date.now();
    nextTick(() => {
        // Abrir el link automáticamente si existe
        if (props.task?.taskLink || props.taskLink) {
            window.open(props.task?.taskLink || props.taskLink, '_blank');
        }
        // Iniciar el timer automáticamente si existe el componente
        setTimeout(() => {
            const timer = document.querySelector('[ref=timerComponent]');
            if (timer && timer.startTimer) timer.startTimer();
        }, 100);
    });
}

// Controla si se muestran los formularios post-tarea
const showPostForm = ref(false);

function handleShowPostForm(userCompleted) {
    // Si la tarea es de tipo SUS o NASA-TLX, pasar a la etapa 3 (mostrar formulario post-tarea)
    if (props.task?.taskType === 'sus' || props.task?.taskType === 'nasa-tlx') {
        showPostForm.userCompleted = userCompleted;
        stage.value = 3;
    } else {
        // Si no, emitir el evento directamente
        showPostForm.userCompleted = userCompleted;
        emitDoneOrCouldNotFinish();
    }
}

function emitDoneOrCouldNotFinish() {
    // Calcular tiempo transcurrido
    let elapsedTime = null;
    if (taskStartTime) {
        elapsedTime = Math.round((Date.now() - taskStartTime) / 1000); // en segundos
    }
    // Llama al evento correspondiente según si el usuario presionó Done o Could Not Finish
    if (showPostForm.userCompleted) {
        emit('done', elapsedTime, props.taskIndex);
    } else {
        emit('couldNotFinish', elapsedTime, props.taskIndex);
    }
    // Resetear etapa y estado
    stage.value = 1;
    showPostForm.value = false;
    showPostForm.userCompleted = undefined;
    taskStartTime = null;
}

import ShowInfo from '@/components/organisms/ShowInfo.vue';
import TipButton from '@/components/atoms/TipButton.vue';
import AudioRecorder from '@/components/atoms/AudioRecorder.vue';
import AudioVisualizer from '@/components/atoms/AudioVisualizer.vue';
import VideoRecorder from '@/components/atoms/VideoRecorder.vue';
import ScreenRecorder from '@/components/atoms/ScreenRecorder.vue';
import Timer from '@/components/atoms/Timer.vue';
import SusForm from '@/components/atoms/SusForm.vue';
import nasaTlxForm from '@/components/atoms/nasaTlxForm.vue';

// ...existing code...

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
// SUS answers are now handled reactively via localSusAnswers
function onUpdateNasaTlx(val) {
    emit('update:nasaTlxAnswers', val);
}
function onTimerStopped(elapsedTime) {
    emit('timer-stopped', elapsedTime, props.taskIndex);
}
</script>
