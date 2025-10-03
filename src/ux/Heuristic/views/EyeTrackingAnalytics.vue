<template>
    <div>
        <v-row>
            <v-col cols="12">
                <v-card flat rounded="xl" class="ma-0 pa-0">
                    <v-row class="fill-height" align="center" justify="center">
                        <v-col cols="12">
                            <v-row justify="center">
                                <h1 style="color: #455a64;" class="mt-6">
                                    Eye-tracking analytics
                                </h1>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-divider class="my-4" />
                    <v-row class="fill-height" align="center" justify="center">
                        <!-- <v-col cols="12" class="mx-auto" align="center">
                            <div v-if="predictedPoints" v-for="(user, index) in usersWithEyeTracking" :key="index">
                                <h2>{{ user.name }}:</h2>
                               <EyeTrackingPredictionCanvas :predictedData="predictedPoints" /> 
                                <span>{{ predictedPoints }}</span>
                            </div>
                        </v-col> -->
                        {{ irisData }}
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {});
const predictedPoints = ref(null);

defineProps({
    irisData: {
        type: Array,
        required: true
    }
});


// const usersWithEyeTracking = computed(() => {
//     const doc = testAnswerDocument.value;
//     if (!doc || !doc.taskAnswers) return [];

//     const result = [];

//     for (const [userKey, userData] of Object.entries(doc.taskAnswers)) {
//         if (Array.isArray(userData.irisTrackingData) && userData.irisTrackingData.length > 0) {
//             const irisTrackingData = userData.irisTrackingData;

//             result.push({
//                 name: userKey,
//                 irisTrackingData,
//             });
//         }
//     }


//     return result;

// });

// onMounted(async () => {
//     const irisTrackingRaw = usersWithEyeTracking.value[0].irisTrackingData;

//     try {
//         const response = await axios.post('http://localhost:5000/api/session/batch_predict', {
//             k: 5,
//             screen_height: 1080,
//             screen_width: 1920,
//             iris_tracking_data: irisTrackingRaw
//         }, {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         console.log('Resposta do backend:', response.data);
//         predictedPoints.value = response.data;

//     } catch (error) {
//         console.error('Erro ao chamar batch_predict:', error);
//     }
// });
</script>
