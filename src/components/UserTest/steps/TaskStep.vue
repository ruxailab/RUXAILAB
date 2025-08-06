<template>
    <ShowInfo :title="task?.taskName || taskName">
        <template #content>
            <div class="test-content pa-4 rounded-xl">
                <div class="rich-text mb-4" v-html="task?.taskDescription || taskDescription" />
                <v-row v-if="task?.taskLink || taskLink" justify="center">
                    <v-col cols="12" class="text-center">
                        <a :href="task?.taskLink || taskLink" target="_blank" class="text-primary font-weight-medium">
                            {{ task?.taskLink || taskLink }}
                        </a>
                    </v-col>
                </v-row>
                <div v-if="!submitted">
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
                </div>
                <div class="mt-4">
                    <v-textarea v-if="task?.taskType === 'text-area' && !submitted"
                        :id="'id-' + (task?.taskName || taskName)" v-model="localTaskAnswer"
                        @update:modelValue="onUpdateTaskAnswer" variant="outlined" label="Answer" rows="3" />
                    <v-textarea v-if="!submitted" :id="'id-' + (task?.taskName || taskName) + '-obs'"
                        v-model="localTaskObservations" @update:modelValue="onUpdateTaskObservations" variant="outlined"
                        label="Observation (optional)" rows="3" />
                </div>
                <div v-if="task?.taskType === 'sus'">
                    <SusForm :sus-answers="susAnswers" @update-answer="onUpdateSusAnswer" />
                </div>
                <div v-if="task?.taskType === 'nasa-tlx'">
                    <nasaTlxForm :nasa-tlx="nasaTlxAnswers" @update:nasaTlx="onUpdateNasaTlx" />
                </div>
                <div v-if="postQuestion || task?.postQuestion" class="mt-6">
                    <p class="text-h6 font-weight-medium">
                        {{ postQuestion || task?.postQuestion }}
                    </p>
                    <v-text-field :model-value="localPostAnswer" @update:modelValue="onPostAnswerInput" class="mt-2"
                        :placeholder="postQuestion || task?.postQuestion" variant="outlined" density="comfortable" />
                </div>
                <div v-if="postForm || task?.postForm" class="mt-6">
                    <p class="text-h6 font-weight-medium mb-4">Post Form</p>
                    <iframe :src="postForm || task?.postForm" title="loading" width="100%" height="500"
                        class="rounded-lg">Loading...</iframe>
                </div>
                <v-row justify="space-between">
                    <v-col>
                        <v-btn color="error" block variant="outlined" class="mr-2" @click="$emit('couldNotFinish')">
                            Could not finish
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn color="primary" block variant="flat" class="ml-2" :disabled="doneTaskDisabled"
                            @click="$emit('done')">
                            Done
                        </v-btn>
                    </v-col>
                </v-row>
                <video v-if="videoUrl === ''" id="vpreview" class="d-none" autoplay />
            </div>
        </template>
    </ShowInfo>
</template>
<script setup>
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import TipButton from '@/components/atoms/TipButton.vue';
import AudioRecorder from '@/components/atoms/AudioRecorder.vue';
import AudioVisualizer from '@/components/atoms/AudioVisualizer.vue';
import VideoRecorder from '@/components/atoms/VideoRecorder.vue';
import ScreenRecorder from '@/components/atoms/ScreenRecorder.vue';
import Timer from '@/components/atoms/Timer.vue';
import SusForm from '@/components/atoms/SusForm.vue';
import nasaTlxForm from '@/components/atoms/nasaTlxForm.vue';
import { ref, watch } from 'vue';

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
function onUpdateSusAnswer({ index, value }) {
    // Hacer una copia del array actual o inicializar si es undefined
    const updated = Array.isArray(props.susAnswers) ? [...props.susAnswers] : Array(10).fill(undefined);
    updated[index] = value;
    emit('update:susAnswers', updated);
}
function onUpdateNasaTlx(val) {
    emit('update:nasaTlxAnswers', val);
}
function onTimerStopped(elapsedTime) {
    emit('timer-stopped', elapsedTime, props.taskIndex);
}
</script>
