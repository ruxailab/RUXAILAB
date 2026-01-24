<template>
    <v-container fluid class="py-6" style="height: 100%; background-color: white;">
        <!-- Título -->
        <v-row class="mb-6">
            <v-col cols="12" class="text-center">
                <h1 class="text-h4 font-weight-bold d-flex align-center justify-center">
                    <v-icon class="mr-2" color="success">mdi-video-account</v-icon>
                    Session Analytics
                </h1>
            </v-col>
        </v-row>

        <v-card flat>
            <v-row class="ma-0 pa-0">
                <!-- Lista de usuários -->
                <v-col class="ma-0 pa-0 task-list" cols="3">
                    <v-list density="compact" class="list-scroll">
                        <v-list-subheader>Evaluators</v-list-subheader>
                        <v-divider />
                        <v-list density="compact" nav>
                            <v-list-item v-for="i in 2" :key="i" class="rounded" @click="selectedUserId = i">
                                <v-list-item-title>
                                    <v-skeleton-loader type="text" width="80%" />
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-list>
                </v-col>

                <v-divider vertical inset />

                <!-- Lista de tarefas -->
                <v-col class="ma-0 pa-1 answer-list" cols="9">
                    <div v-if="selectedUserId">
                        <h3 class="text-h6 font-weight-bold mb-4">Tasks for User {{ selectedUserId }}</h3>
                        <v-list>
                            <v-list-item v-for="task in mockTasks" :key="task.taskId" @click="openTaskDialog(task)">
                                <v-list-item-title>{{ task.taskName }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    <v-skeleton-loader type="text" width="40%" />
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </div>
                    <div v-else>
                        <p class="text-grey">Select a participant to view their tasks.</p>
                    </div>
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
import SessionAnalyticsDialog from './dialogs/SessionAnalyticsDialog.vue';
export default {
    components: {
        SessionAnalyticsDialog
    },
    data() {
        return {
            selectedUserId: null,
            taskDialog: false,
            selectedTask: null,
            selectedThumb: 1,
            selectedScreenThumb: 1,
            rightTab: 'transcript',
            snackbar: {
                visible: false,
                text: '',
                color: '',
            },
            mockTasks: [
                { taskId: 't1', taskName: 'Task 1' },
                { taskId: 't2', taskName: 'Task 2' },
                { taskId: 't3', taskName: 'Task 3' },
            ],
            mockTranscript: 'El usuario realizó la tarea correctamente y luego revisó el panel de configuración. El moderador preguntó sobre la experiencia y el usuario respondió positivamente.',
            mockEyeTracking: {
                accuracy: 92,
                fixations: 34
            },
            mockSentiments: ['positivo', 'neutral', 'positivo', 'negativo', 'positivo', 'neutral'],
            mockNotesCount: 5,
            waveformWidth: 1200,
            currentTime: 0,
            videoDuration: 100,
            isPlaying: false,
            _timelineInterval: null
        };
    },
    mounted() {
        this._timelineInterval = setInterval(() => {
            this.updateTimeline();
        }, 200);
    },
    beforeUnmount() {
        clearInterval(this._timelineInterval);
    },
    methods: {
        emitTimelineUpdate() {
            const v1 = this.$refs.mainVideo1;
            if (!v1) return;
            // Actualiza el estado currentTime para sincronizar el slider
            this.currentTime = v1.currentTime;
        },
        openTaskDialog(task) {

            this.selectedTask = task;
            this.taskDialog = true;
            this.selectedThumb = 1;
            this.selectedScreenThumb = 1;
        },
        formatTime(seconds) {
            const min = Math.floor(seconds / 60).toString().padStart(2, '0');
            const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
            return `${min}:${sec}`;
        },
        onWaveformClick(event, track) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const percent = x / rect.width;
            this.snackbar.text = `Seleccionado en pista ${track === 1 ? 'Moderador' : 'Evaluador'}: ${(percent * 100).toFixed(1)}%`;
            this.snackbar.visible = true;
        },
        handleTimelinePlayPause() {
            const v1 = this.$refs.mainVideo1;
            const v2 = this.$refs.mainVideo2;
            if (!v1 || !v2) return;
            if (v1.paused || v2.paused) {
                v1.play();
                v2.play();
                this.isPlaying = true;
            } else {
                v1.pause();
                v2.pause();
                this.isPlaying = false;
            }
        },
        handleTimelineSeek(time) {
            const v1 = this.$refs.mainVideo1;
            const v2 = this.$refs.mainVideo2;
            if (!v1 || !v2) return;
            v1.currentTime = time;
            v2.currentTime = time;
            this.currentTime = time; // Actualiza el estado para el slider
        },
        watch: {
            currentTime(newVal) {
            }
        },
        updateTimeline() {
            if (this.$refs.mainVideo1 && !this.$refs.mainVideo1.paused) {
                this.emitTimelineUpdate();
            }
        }
    }
}

</script>
<style scoped>
.video-rect-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.video-rect-skeleton {
    width: 100%;
    aspect-ratio: 16 / 9;
    min-height: 320px;
    max-width: 1920px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    background: #fafafa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Screen video styles moved from template to style block */
.screen-video-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.screen-video-skeleton {
    width: 100%;
    aspect-ratio: 19 / 6;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    background: #fafafa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
    font-weight: 600;
}

.video-sync-container {
    gap: 32px;
}

.video-box {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.timeline-thumbnails {
    overflow-x: auto;
    padding-bottom: 4px;
}

.thumb {
    cursor: pointer;
    border-radius: 4px;
    border: 2px solid transparent;
    transition: border-color 0.2s;
    padding: 2px;
}

.thumb-active {
    border-color: #ff9800;
    background: #fff3e0;
}

.timeline-bar-fixed {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100vw;
    background: #f5f5f5;
    z-index: 9999;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    padding-top: 8px;
}

.timeline-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 24px 8px 24px;
}

.thumbnails-row {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 8px;
}

.waveform-row {
    width: 100%;
    margin-bottom: 8px;
}

.waveform-track {
    width: 100%;
    height: 32px;
    position: relative;
    margin-bottom: 4px;
}

.waveform-bar-style {
    display: flex;
    align-items: flex-end;
    height: 40px;
    position: relative;
}

.waveform-bars {
    display: flex;
    align-items: flex-end;
    height: 40px;
    margin-left: 60px;
}

.waveform-label {
    position: absolute;
    left: 8px;
    top: 2px;
    z-index: 2;
    background: rgba(255, 255, 255, 0.7);
    padding: 0 6px;
    border-radius: 4px;
    font-size: 12px;
}

.controls-row {
    width: 100%;
    justify-content: center;
    padding-top: 8px;
}

/* Solo afecta a esta view */
:deep(.v-toolbar__content) {
    max-height: 40px !important;
    height: 40px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}
</style>
