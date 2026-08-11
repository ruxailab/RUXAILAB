<template>
  <v-card class="pa-4 mb-0 agent-card" elevation="3" rounded="lg" @click="open">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon size="24" color="primary" class="mr-2"
          >mdi-robot-outline</v-icon
        >
        <v-card-title class="text-h6 text-primary pa-0">AI Agents</v-card-title>
      </div>
      <v-chip color="primary" size="small" variant="tonal">
        {{ activeCount }} activos
      </v-chip>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Crea y comparte evaluadores de IA para responder este test heurístico.
    </p>
    <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-right">
      Gestionar agentes
    </v-btn>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ test: { type: Object, required: true } })
const router = useRouter()
const activeCount = computed(() => props.test?.heuristicAgentIds?.length || 0)
const open = () => router.push(`/heuristic/ai-agents/${props.test.id}`)
</script>

<style scoped>
.agent-card {
  cursor: pointer;
  height: 100%;
  transition: transform 0.2s ease;
}
.agent-card:hover {
  transform: translateY(-2px);
}
</style>
