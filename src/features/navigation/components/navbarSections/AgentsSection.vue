<template>
  <div>
    <v-alert v-if="message" :type="messageType" closable class="mb-5">
      {{ message }}
    </v-alert>

    <div class="d-flex justify-end mb-6">
      <v-btn color="primary" prepend-icon="mdi-robot-happy-outline" @click="openCreateDialog">
        {{ $t('agents.actions.create') }}
      </v-btn>
    </div>

    <v-card rounded="lg" elevation="2">
      <v-card-title class="pa-6 pb-2">{{ $t('agents.list.title') }}</v-card-title>
      <v-card-subtitle class="px-6 pb-4">
        {{ $t('agents.list.subtitle') }}
      </v-card-subtitle>
      <v-data-table
        :headers="headers"
        :items="agents"
        :loading="loading"
        item-value="id"
        :no-data-text="$t('agents.list.empty')"
      >
        <template #item.visibility="{ item }">
          <v-chip :color="visibilityColor(item.visibility)" size="small" variant="tonal">
            {{ visibilityLabel(item.visibility) }}
          </v-chip>
        </template>
        <template #item.owner="{ item }">
          {{ item.ownerId === userId ? $t('agents.owner.you') : $t('agents.owner.community') }}
        </template>
        <template #item.actions="{ item }">
          <v-btn
            v-if="item.ownerId === userId"
            icon="mdi-pencil-outline"
            size="small"
            variant="text"
            :aria-label="$t('agents.actions.edit')"
            @click="openEditDialog(item)"
          />
          <v-btn
            v-if="item.ownerId === userId"
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            color="error"
            :aria-label="$t('agents.actions.delete')"
            @click="removeAgent(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="760" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 pa-6 pb-2">
          <v-icon color="primary">mdi-robot-happy-outline</v-icon>
          {{ editingAgentId ? $t('agents.dialog.editTitle') : $t('agents.dialog.createTitle') }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="form" @submit.prevent="saveAgent">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="draft.name" :label="$t('agents.fields.name')" :rules="[required]" maxlength="80" counter autofocus />
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="draft.model"
                  :label="$t('agents.fields.model')"
                  :items="modelOptions"
                  item-title="title"
                  item-value="value"
                  :loading="loadingModels"
                  :rules="[required]"
                  :no-data-text="$t('agents.models.empty')"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="draft.description" :label="$t('agents.fields.description')" rows="2" maxlength="300" counter />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="draft.systemPrompt"
                  :label="$t('agents.fields.instructions')"
                  :hint="$t('agents.fields.instructionsHint')"
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
                  :label="$t('agents.fields.visibility')"
                />
              </v-col>
              <v-col v-if="draft.visibility === 'shared'" cols="12" md="6">
                <v-text-field
                  v-model="sharedUsers"
                  :label="$t('agents.fields.userIds')"
                  :hint="$t('agents.fields.userIdsHint')"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="closeDialog">{{ $t('agents.actions.cancel') }}</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveAgent">
            {{ editingAgentId ? $t('agents.actions.save') : $t('agents.actions.create') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import AIAgentController from '@/features/agents/controllers/AIAgentController'
import { AGENT_VISIBILITY } from '@/features/agents/models/AIAgent'
import AgentModelProvider from '@/features/agents/services/AgentModelProvider'

const controller = new AIAgentController()
const store = useStore()
const { t } = useI18n()
const agents = ref([])
const loading = ref(true)
const saving = ref(false)
const editingAgentId = ref(null)
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
const required = (value) => Boolean(value?.trim()) || t('agents.validation.required')
const headers = computed(() => [
  { title: t('agents.fields.name'), key: 'name' },
  { title: t('agents.fields.model'), key: 'model' },
  { title: t('agents.fields.visibility'), key: 'visibility' },
  { title: t('agents.fields.origin'), key: 'owner', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' },
])
const visibilityOptions = computed(() => [
  { title: t('agents.visibility.privateOption'), value: AGENT_VISIBILITY.PRIVATE },
  { title: t('agents.visibility.sharedOption'), value: AGENT_VISIBILITY.SHARED },
  { title: t('agents.visibility.publicOption'), value: AGENT_VISIBILITY.PUBLIC },
])
const visibilityLabel = (value) => t(`agents.visibility.${value}`, value)
const visibilityColor = (value) => ({ private: 'grey', shared: 'warning', public: 'success' })[value]
const notify = (text, type = 'success') => { message.value = text; messageType.value = type }

const openCreateDialog = () => {
  editingAgentId.value = null
  Object.assign(draft, emptyDraft())
  sharedUsers.value = ''
  form.value?.resetValidation()
  dialog.value = true
  if (!modelOptions.value.length) loadModels()
}
const openEditDialog = (agent) => {
  editingAgentId.value = agent.id
  Object.assign(draft, {
    name: agent.name,
    description: agent.description,
    provider: agent.provider,
    model: agent.model,
    systemPrompt: agent.systemPrompt,
    visibility: agent.visibility,
  })
  sharedUsers.value = (agent.sharedWith || []).join(', ')
  form.value?.resetValidation()
  dialog.value = true
  if (!modelOptions.value.length) loadModels()
}
const closeDialog = () => {
  if (!saving.value) dialog.value = false
}

const loadAgents = async () => {
  loading.value = true
  try { agents.value = await controller.listAvailable(userId.value) }
  catch (error) { notify(t('agents.messages.loadError', { error: error.message }), 'error') }
  finally { loading.value = false }
}
const loadModels = async () => {
  loadingModels.value = true
  try {
    const models = await AgentModelProvider.listModels()
    modelOptions.value = models.map((model) => ({ title: `${model.name} — ${model.id}`, value: model.id }))
  } catch (error) { notify(t('agents.messages.modelsError', { error: error.message }), 'error') }
  finally { loadingModels.value = false }
}
const saveAgent = async () => {
  const validation = await form.value?.validate()
  if (validation && !validation.valid) return
  saving.value = true
  try {
    const changes = {
      ...draft,
      sharedWith: sharedUsers.value.split(',').map((id) => id.trim()).filter(Boolean),
    }
    if (editingAgentId.value) {
      const agent = await controller.updateAgent(editingAgentId.value, changes, userId.value)
      const index = agents.value.findIndex((item) => item.id === editingAgentId.value)
      if (index !== -1) agents.value.splice(index, 1, agent)
      notify(t('agents.messages.updated'))
    } else {
      const agent = await controller.createAgent(changes, userId.value)
      agents.value = [agent, ...agents.value]
      notify(t('agents.messages.created'))
    }
    Object.assign(draft, emptyDraft())
    sharedUsers.value = ''
    form.value?.resetValidation()
    dialog.value = false
  } catch (error) { notify(t('agents.messages.saveError', { error: error.message }), 'error') }
  finally { saving.value = false }
}
const removeAgent = async (agent) => {
  if (!window.confirm(t('agents.messages.confirmDelete', { name: agent.name }))) return
  try {
    await controller.deleteAgent(agent.id, userId.value)
    agents.value = agents.value.filter((item) => item.id !== agent.id)
    notify(t('agents.messages.deleted'))
  } catch (error) { notify(t('agents.messages.deleteError', { error: error.message }), 'error') }
}

onMounted(loadAgents)
</script>
