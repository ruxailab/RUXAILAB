<template>
    <div>
        <ShowInfo title="Session Analytics">
            <!-- Main Tabs -->
            <template #top>
                <v-tabs v-model="tab" bg-color="transparent" color="#FCA326" class="ml-4">
                    <v-tab @click="tab = 0">
                        Transcription
                    </v-tab>
                    <v-tab @click="tab = 1">
                        Timeline
                    </v-tab>
                    <v-tab @click="tab = 2">
                        Export
                    </v-tab>
                </v-tabs>
            </template>

            <!-- Content -->
            <template #content>
                <div style="background-color: #E8EAF2;" class="ma-0 pa-0">
                    <!-- <GeneralAnalytics v-if="tab === 0" />
                    <AnalyticsView v-if="tab === 1" />
                    <SentimentAnalysisView v-if="tab === 2" />
                    <SusAnalytics v-if="tab === 3" />
                    <NasaTlxAnalytics v-if="tab === 4" /> -->
                    <div v-if="tab === 0"> ...Transcription View... </div>
                    <div v-else-if="tab === 1"> ...Timeline View... </div>
                    <div v-else-if="tab === 2"> ...Export View... </div>
                </div>
            </template>
        </ShowInfo>

        <!-- <v-container class="py-6">
        <h1 class="text-h5 font-weight-bold mb-4">User Test Session</h1>

        <div v-if="audioUrlEvaluator">
            <h2 class="text-subtitle-1 font-weight-medium mb-2">Evaluator Audio</h2>
            <audio :src="audioUrlEvaluator" controls />
        </div>

        <div v-if="audioUrlModerator" class="mt-6">
            <h2 class="text-subtitle-1 font-weight-medium mb-2">Moderator Audio</h2>
            <audio :src="audioUrlModerator" controls />
            -->
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import ShowInfo from '@/components/organisms/ShowInfo';


const store = useStore()

const tab = ref(0);


const loading = computed(() => store.getters.loading);
</script>