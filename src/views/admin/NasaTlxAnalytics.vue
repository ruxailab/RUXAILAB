<template>
    <v-container class="pa-6" style="max-width: 900px; margin: auto;">
        <h2 class="text-center mb-6" style="font-weight: bold;">NASA-TLX Scores de Todos os Usuários</h2>

        <v-data-table :headers="headers" :items="usersWithNASA" class="elevation-1 rounded-xl" dense
            hide-default-footer>
            <template #item.name="{ item }">
                {{ item.name || 'Usuário Sem Nome' }}
            </template>

            <template #item.nasaScores="{ item }">
                <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                    <div v-for="(val, key) in item.nasaScores" :key="key"
                        style="width: 60px; font-size: 12px; background-color: #1976d2; border-radius: 4px; color: white; text-align: center; font-weight: bold;">
                        <div style="font-size: 10px;">{{ shortLabels[key] }}</div>
                        {{ val }}
                    </div>
                </div>
            </template>

            <template #item.avgScore="{ item }">
                <span :style="{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    color: 'white',
                    fontWeight: 'bold',
                    backgroundColor:
                        item.avgScore < 40 ? '#388e3c' : item.avgScore < 70 ? '#fbc02d' : '#d32f2f',
                }">
                    {{ item.avgScore.toFixed(1) }}
                </span>
            </template>
        </v-data-table>
    </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || {})

const usersWithNASA = computed(() => {
    const doc = testAnswerDocument.value
    if (!doc || !doc.taskAnswers) return []

    const result = []

    for (const [userKey, userData] of Object.entries(doc.taskAnswers)) {
        const tasks = userData.tasks || {}

        for (const task of Object.values(tasks)) {
            const nasa = task.nasaTlxAnswers
            if (nasa && typeof nasa === 'object') {
                const scores = {
                    mentalDemand: nasa.mentalDemand ?? 0,
                    physicalDemand: nasa.physicalDemand ?? 0,
                    temporalDemand: nasa.temporalDemand ?? 0,
                    performance: nasa.performance ?? 0,
                    effort: nasa.effort ?? 0,
                    frustration: nasa.frustration ?? 0,
                }

                const values = Object.values(scores)
                const avgScore = values.reduce((a, b) => a + b, 0) / values.length

                result.push({
                    name: userData.fullName || userKey,
                    nasaScores: scores,
                    avgScore,
                })
            }
        }
    }

    return result
})

const shortLabels = {
    mentalDemand: 'Mental',
    physicalDemand: 'Physical',
    temporalDemand: 'Tempo',
    performance: 'Perf',
    effort: 'Effort',
    frustration: 'Frust',
}

const headers = [
    { title: 'Usuário', key: 'name' },
    { title: 'Dimensões NASA-TLX', key: 'nasaScores' },
    { title: 'Média', key: 'avgScore', align: 'center' },
]
</script>
