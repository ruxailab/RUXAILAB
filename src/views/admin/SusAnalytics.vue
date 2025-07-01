<template>

    <v-container class="pa-6" style="max-width: 900px; margin: auto;">
        <h2 class="text-center mb-6" style="font-weight: bold;">SUS Scores de Todos os Usuários</h2>
        <v-data-table :headers="headers" :items="usersWithSUS" class="elevation-1 rounded-xl" dense hide-default-footer>
            <template #item.name="{ item }">
                {{ item.name || 'Usuário Sem Nome' }}
            </template>

            <template #item.susAnswers="{ item }">
                <div style="display: flex; gap: 4px; justify-content: center;">
                    <div v-for="(val, i) in item.susAnswers" :key="i"
                        style="width: 28px; background-color: #333; border-radius: 4px; color: white; text-align: center; font-weight: bold;">
                        {{ val }}
                    </div>
                </div>
            </template>

            <template #item.susScore="{ item }">
                <span :style="{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    color: 'white',
                    fontWeight: 'bold',
                    backgroundColor:
                        item.susScore < 50 ? '#d32f2f' : item.susScore < 70 ? '#fbc02d' : '#388e3c',
                }">
                    {{ item.susScore.toFixed(1) }}
                </span>
            </template>
        </v-data-table>
    </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {});

const usersWithSUS = computed(() => {
    const doc = testAnswerDocument.value;
    if (!doc || !doc.taskAnswers) return [];

    const result = [];

    for (const [userKey, userData] of Object.entries(doc.taskAnswers)) {
        const tasks = userData.tasks || {};

        for (const task of Object.values(tasks)) {
            if (Array.isArray(task.susAnswers) && task.susAnswers.length === 10) {
                const susAnswers = task.susAnswers;
                const total = susAnswers.reduce((acc, val, idx) => acc + (idx % 2 === 0 ? val - 1 : 5 - val), 0);
                const susScore = total * 2.5;

                result.push({
                    name: userData.fullName || userKey,
                    susAnswers,
                    total,
                    susScore,
                });
            }
        }
    }

    return result;
});

const headers = [
    { title: 'Usuário', key: 'name' },
    { title: 'Respostas SUS (Q1-Q10)', key: 'susAnswers' },
    { title: 'SUS Score', key: 'susScore', align: 'center' },
];
</script>
