<template>
  <div>
    <v-alert v-if="message" :type="messageType" closable class="mb-5">
      {{ message }}
    </v-alert>

    <div class="d-flex justify-end mb-6">
      <v-btn color="primary" prepend-icon="mdi-robot-happy-outline" @click="openCreateDialog">
        Crear agente
      </v-btn>
    </div>

    <v-card rounded="lg" elevation="2">
      <v-card-title class="pa-6 pb-2">Agentes disponibles</v-card-title>
      <v-card-subtitle class="px-6 pb-4">
        Tus agentes y los agentes públicos que puedes utilizar.
      </v-card-subtitle>
      <v-data-table
        :headers="headers"
        :items="agents"
        :loading="loading"
        item-value="id"
        no-data-text="Todavía no hay agentes disponibles"
      >
        <template #item.visibility="{ item }">
          <v-chip :color="visibilityColor(item.visibility)" size="small" variant="tonal">
            {{ visibilityLabel(item.visibility) }}
          </v-chip>
        </template>
        <template #item.owner="{ item }">
          {{ item.ownerId === userId ? 'Creado por ti' : 'Comunidad' }}
        </template>
        <template #item.actions="{ item }">
          <v-btn
            v-if="item.ownerId === userId"
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            color="error"
            aria-label="Eliminar agente"
            @click="removeAgent(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="760" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 pa-6 pb-2">
          <v-icon color="primary">mdi-robot-happy-outline</v-icon>
          Crear agente
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="form" @submit.prevent="createAgent">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="draft.name" label="Nombre" :rules="[required]" maxlength="80" counter autofocus />
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="draft.model"
                  label="Modelo"
                  :items="modelOptions"
                  item-title="title"
                  item-value="value"
                  :loading="loadingModels"
                  :rules="[required]"
                  no-data-text="No se encontraron modelos"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="draft.description" label="Descripción" rows="2" maxlength="300" counter />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="draft.systemPrompt"
                  label="Instrucciones del agente"
                  hint="Define el perfil, criterios y forma de justificar las respuestas."
                  persistent-hint
                  rows="4"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="draft.visibility"
                  :items="visibilityOptions"
                  item-title="title"
                  item-value="value"
                  label="Estado"
                />
              </v-col>
              <v-col v-if="draft.visibility === 'shared'" cols="12" md="6">
                <v-text-field
                  v-model="sharedUsers"
                  label="IDs de usuarios"
                  hint="Separados por comas"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" :disabled="creating" @click="closeCreateDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="creating" @click="createAgent">Crear agente</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import AIAgentController from '@/features/agents/controllers/AIAgentController'
import { AGENT_VISIBILITY } from '@/features/agents/models/AIAgent'
import AgentModelProvider from '@/features/agents/services/AgentModelProvider'

const controller = new AIAgentController()
const store = useStore()
const agents = ref([])
const loading = ref(true)
const creating = ref(false)
const dialog = ref(false)
const loadingModels = ref(false)
const modelOptions = ref([])
const form = ref(null)
const message = ref('')
const messageType = ref('success')
const sharedUsers = ref('')
const emptyDraft = () => ({
  name: '', description: '', provider: 'openrouter', model: '', systemPrompt: '',
  visibility: AGENT_VISIBILITY.PRIVATE,
})
const draft = reactive(emptyDraft())
const userId = computed(() => store.getters.user?.id || '')
const required = (value) => Boolean(value?.trim()) || 'Este campo es obligatorio.'
const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Modelo', key: 'model' },
  { title: 'Estado', key: 'visibility' },
  { title: 'Origen', key: 'owner', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]
const visibilityOptions = [
  { title: 'Privado — solo yo', value: AGENT_VISIBILITY.PRIVATE },
  { title: 'Compartido — usuarios concretos', value: AGENT_VISIBILITY.SHARED },
  { title: 'Público — todos los usuarios', value: AGENT_VISIBILITY.PUBLIC },
]
const visibilityLabel = (value) => ({ private: 'Privado', shared: 'Compartido', public: 'Público' })[value] || value
const visibilityColor = (value) => ({ private: 'grey', shared: 'warning', public: 'success' })[value]
const notify = (text, type = 'success') => { message.value = text; messageType.value = type }

const openCreateDialog = () => {
  Object.assign(draft, emptyDraft())
  sharedUsers.value = ''
  form.value?.resetValidation()
  dialog.value = true
  if (!modelOptions.value.length) loadModels()
}
const closeCreateDialog = () => {
  if (!creating.value) dialog.value = false
}

const loadAgents = async () => {
  loading.value = true
  try { agents.value = await controller.listAvailable(userId.value) }
  catch (error) { notify(`No se pudieron cargar los agentes: ${error.message}`, 'error') }
  finally { loading.value = false }
}
const loadModels = async () => {
  loadingModels.value = true
  try {
    const models = await AgentModelProvider.listModels()
    modelOptions.value = models.map((model) => ({ title: `${model.name} — ${model.id}`, value: model.id }))
  } catch (error) { notify(`No se pudieron cargar los modelos: ${error.message}`, 'error') }
  finally { loadingModels.value = false }
}
const createAgent = async () => {
  const validation = await form.value?.validate()
  if (validation && !validation.valid) return
  creating.value = true
  try {
    const agent = await controller.createAgent({
      ...draft,
      sharedWith: sharedUsers.value.split(',').map((id) => id.trim()).filter(Boolean),
    }, userId.value)
    agents.value = [agent, ...agents.value]
    Object.assign(draft, emptyDraft())
    sharedUsers.value = ''
    form.value?.resetValidation()
    dialog.value = false
    notify('Agente creado correctamente.')
  } catch (error) { notify(`No se pudo crear el agente: ${error.message}`, 'error') }
  finally { creating.value = false }
}
const removeAgent = async (agent) => {
  if (!window.confirm(`¿Eliminar el agente “${agent.name}”?`)) return
  try {
    await controller.deleteAgent(agent.id, userId.value)
    agents.value = agents.value.filter((item) => item.id !== agent.id)
    notify('Agente eliminado.')
  } catch (error) { notify(`No se pudo eliminar el agente: ${error.message}`, 'error') }
}

onMounted(loadAgents)
</script>
