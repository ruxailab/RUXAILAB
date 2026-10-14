<template>
  <div>
    <p class="text-body-1 text-medium-emphasis mb-5">
      {{ $t('community.agents.subtitle') }}
    </p>
    <div class="d-flex align-center ga-3 mb-5">
      <v-text-field
        v-model="search"
        :label="$t('community.agents.search')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        hide-details
        clearable
      />
      <v-btn
        icon="mdi-refresh"
        variant="text"
        :loading="loading"
        :aria-label="$t('community.agents.refresh')"
        @click="loadAgents"
      />
    </div>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{
      error
    }}</v-alert>
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      :aria-label="$t('navigation.communityAgents')"
    />
    <v-alert
      v-else-if="!filteredAgents.length && !error"
      type="info"
      variant="tonal"
      >{{
        $t(
          agents.length
            ? 'community.agents.noResults'
            : 'community.agents.empty',
        )
      }}</v-alert
    >
    <v-row v-else>
      <v-col
        v-for="agent in filteredAgents"
        :key="agent.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="agent-card pa-5" rounded="lg" variant="outlined">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="primary" variant="tonal"
              ><v-icon>mdi-robot-outline</v-icon></v-avatar
            >
            <h2 class="text-h6 agent-name">{{ agent.name }}</h2>
          </div>
          <v-chip
            size="small"
            color="success"
            variant="tonal"
            prepend-icon="mdi-earth"
            class="mb-3"
            >{{ $t('agents.visibility.public') }}</v-chip
          >
          <p class="agent-description text-body-2 mb-4">
            {{ agent.description || '—' }}
          </p>
          <p class="text-caption text-medium-emphasis mb-4">
            {{ $t('agents.fields.model') }}: {{ agent.model }}
          </p>
          <v-btn
            color="primary"
            variant="tonal"
            @click="selectedAgent = agent"
            >{{ $t('community.agents.details') }}</v-btn
          >
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      :model-value="Boolean(selectedAgent)"
      max-width="700"
      @update:model-value="selectedAgent = null"
    >
      <v-card v-if="selectedAgent" rounded="lg">
        <v-card-title class="pa-5 agent-name">{{
          selectedAgent.name
        }}</v-card-title>
        <v-card-text>
          <p class="agent-description mb-4">{{ selectedAgent.description }}</p>
          <p class="mb-4">
            {{ $t('agents.fields.model') }}: {{ selectedAgent.model }}
          </p>
          <h3 class="text-subtitle-1 mb-2">
            {{ $t('agents.fields.instructions') }}
          </h3>
          <p class="agent-description">
            {{ selectedAgent.systemPrompt || '—' }}
          </p>
        </v-card-text>
        <v-card-actions
          ><v-spacer /><v-btn @click="selectedAgent = null">{{
            $t('common.close')
          }}</v-btn></v-card-actions
        >
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AIAgentController from '@/features/agents/controllers/AIAgentController'

const controller = new AIAgentController()
const { t } = useI18n()
const agents = ref([])
const search = ref('')
const loading = ref(true)
const error = ref('')
const selectedAgent = ref(null)
const filteredAgents = computed(() => {
  const query = (search.value || '').trim().toLocaleLowerCase()
  return agents.value.filter((agent) =>
    [agent.name, agent.description, agent.model].some((value) =>
      value.toLocaleLowerCase().includes(query),
    ),
  )
})
const loadAgents = async () => {
  loading.value = true
  error.value = ''
  try {
    agents.value = await controller.listPublic()
  } catch (cause) {
    error.value = t('agents.messages.loadError', { error: cause.message })
  } finally {
    loading.value = false
  }
}
onMounted(loadAgents)
</script>

<style scoped>
.agent-card {
  height: 100%;
  border-color: #dfe5ec;
}
.agent-name {
  white-space: normal;
  overflow-wrap: anywhere;
}
.agent-description {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
