<template>
  <v-container class="pa-6" fluid>
    <div class="d-flex align-center ga-3 mb-2">
      <v-icon color="primary" size="34">mdi-robot-outline</v-icon>
      <h1 class="text-h4 font-weight-bold">Análisis con agentes</h1>
    </div>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Indica una web, selecciona sus páginas y deja que un agente complete la evaluación heurística.
    </p>

    <v-alert v-if="message" :type="messageType" closable class="mb-5" @click:close="message = ''">
      {{ message }}
    </v-alert>

    <v-card class="pa-6 mb-6" rounded="lg" elevation="2">
      <div class="d-flex align-center ga-3 mb-3">
        <v-avatar color="primary" size="32"><span class="text-body-2 font-weight-bold">1</span></v-avatar>
        <div>
          <h2 class="text-h5">Introduce la web</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">Buscaremos la página principal y sus enlaces internos.</p>
        </div>
      </div>
      <v-row align="center">
        <v-col cols="12" md="9">
          <v-text-field
            v-model="pageUrl"
            label="URL de la web"
            placeholder="https://test.com"
            prepend-inner-icon="mdi-link"
            :disabled="running"
            @keyup.enter="discoverPages"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-btn block color="primary" prepend-icon="mdi-magnify" :loading="discovering" :disabled="running || !pageUrl" @click="discoverPages">
            Buscar páginas
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card v-if="pages.length" class="pa-6 mb-6" rounded="lg" elevation="2">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" size="32"><span class="text-body-2 font-weight-bold">2</span></v-avatar>
          <div>
            <h2 class="text-h5">Selecciona las páginas</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ selectedUrls.length }} de {{ pages.length }} seleccionadas</p>
          </div>
        </div>
        <v-btn size="small" variant="text" :disabled="running" @click="toggleAllPages">
          {{ allPagesSelected ? 'Deseleccionar todas' : 'Seleccionar todas' }}
        </v-btn>
      </div>
      <v-list class="url-list border rounded-lg">
        <v-list-item v-for="page in pages" :key="page.url">
          <template #prepend>
            <v-checkbox-btn v-model="selectedUrls" :value="page.url" :disabled="running" />
          </template>
          <v-list-item-title :class="{ 'pl-5': page.depth > 0 }">
            <span v-if="page.depth > 0" class="text-medium-emphasis">↳ </span>{{ page.url }}
          </v-list-item-title>
          <template #append>
            <v-chip v-if="progress[page.url]" size="small" :color="statusColor(progress[page.url].status)" variant="tonal" :title="progress[page.url].error || ''">
              {{ progressLabel(progress[page.url]) }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card class="pa-6 mb-6" rounded="lg" elevation="2">
      <div class="d-flex align-center ga-3 mb-4">
        <v-avatar color="primary" size="32"><span class="text-body-2 font-weight-bold">3</span></v-avatar>
        <div>
          <h2 class="text-h5">Elige un agente y analiza</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">Cada página se guardará como una evaluación independiente.</p>
        </div>
      </div>
      <v-row align="center">
        <v-col cols="12" md="8">
          <v-select
            v-model="selectedAgentId"
            :items="activeAgents"
            item-title="name"
            item-value="id"
            label="Agente"
            prepend-inner-icon="mdi-robot-outline"
            :disabled="running"
            no-data-text="No hay agentes activos para este estudio"
            hint="Puedes activar agentes en la configuración inferior."
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-btn block size="large" color="primary" prepend-icon="mdi-play" :loading="running" :disabled="!canRun" @click="runEvaluations">
            Analizar {{ selectedUrls.length || 0 }} página(s)
          </v-btn>
        </v-col>
      </v-row>
      <v-progress-linear v-if="running" :model-value="totalProgress" color="primary" class="mt-4" />
      <div v-if="results.length" class="d-flex align-center justify-space-between ga-3 mt-5">
        <v-alert type="success" variant="tonal" class="flex-grow-1 mb-0">
          {{ results.length }} análisis guardados como evaluadores independientes.
        </v-alert>
        <v-btn color="primary" prepend-icon="mdi-chart-box-outline" @click="viewResults">Ver resultados</v-btn>
      </div>
    </v-card>

    <v-expansion-panels variant="accordion">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-3">
            <v-icon color="primary">mdi-cog-outline</v-icon>
            <div>
              <div class="font-weight-medium">Configurar agentes del estudio</div>
              <div class="text-caption text-medium-emphasis">{{ activeAgents.length }} agente(s) activo(s)</div>
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Activa aquí los agentes que aparecerán en el selector. Los agentes se crean desde el módulo general “Agentes”.
          </p>
          <v-data-table :headers="agentHeaders" :items="agents" :loading="loading" item-value="id" no-data-text="No hay agentes. Crea uno desde el menú general.">
            <template #item.visibility="{ item }">
              <v-chip size="small" variant="tonal">{{ visibilityLabel(item.visibility) }}</v-chip>
            </template>
            <template #item.active="{ item }">
              <v-switch :model-value="isActive(item.id)" color="primary" hide-details :loading="savingId === item.id" :disabled="Boolean(savingId) || running" aria-label="Activar agente en este estudio" @update:model-value="toggleAgent(item.id, $event)" />
            </template>
          </v-data-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import HeuristicAgentController from '../controllers/HeuristicAgentController'
import HeuristicPageLoader from '../services/HeuristicPageLoader'
import FirebaseHeuristicAgentProvider from '../services/FirebaseHeuristicAgentProvider'
import HeuristicAgentEvaluator from '../services/HeuristicAgentEvaluator'
import AnswerController from '@/shared/controllers/AnswerController'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'

const controller = new HeuristicAgentController()
const answerController = new AnswerController()
const pageLoader = new HeuristicPageLoader()
const store = useStore()
const router = useRouter()
const agents = ref([])
const loading = ref(true)
const savingId = ref(null)
const discovering = ref(false)
const running = ref(false)
const message = ref('')
const messageType = ref('success')
const pageUrl = ref('')
const selectedAgentId = ref(null)
const pages = ref([])
const selectedUrls = ref([])
const results = ref([])
const progress = reactive({})
const PAGE_EVALUATION_CONCURRENCY = 2
const userId = computed(() => store.getters.user?.id || '')
const test = computed(() => store.getters.test)
const activeIds = computed(() => test.value?.heuristicAgentIds || [])
const activeAgents = computed(() => agents.value.filter((agent) => activeIds.value.includes(agent.id)))
const canRun = computed(() => !running.value && !discovering.value && selectedAgentId.value && selectedUrls.value.length > 0)
const allPagesSelected = computed(
  () => pages.value.length > 0 && selectedUrls.value.length === pages.value.length,
)
const agentHeaders = [
  { title: 'Nombre', key: 'name' },
  { title: 'Modelo', key: 'model' },
  { title: 'Estado', key: 'visibility' },
  { title: 'Activo en el estudio', key: 'active', sortable: false },
]
const visibilityLabel = (value) => ({ private: 'Privado', shared: 'Compartido', public: 'Público' })[value] || value
const isActive = (id) => activeIds.value.includes(id)
const notify = (text, type = 'success') => { message.value = text; messageType.value = type }
const statusColor = (status) => ({ completed: 'success', error: 'error', running: 'primary', pending: 'grey' })[status]
const progressLabel = (item) => {
  if (item.status === 'completed') return 'Completado'
  if (item.status === 'error') return 'Error'
  if (item.status === 'running') return `Heurística ${item.current}/${item.total}`
  return 'Pendiente'
}
const totalProgress = computed(() => {
  const selected = selectedUrls.value.map((url) => progress[url]).filter(Boolean)
  if (!selected.length) return 0
  const value = selected.reduce((sum, item) => sum + (item.total ? item.current / item.total : 0), 0)
  return Math.round((value / selected.length) * 100)
})
const toggleAllPages = () => {
  selectedUrls.value = allPagesSelected.value
    ? []
    : pages.value.map((page) => page.url)
}

const discoverPages = async () => {
  discovering.value = true
  pages.value = []
  selectedUrls.value = []
  results.value = []
  try {
    pages.value = await pageLoader.discover(pageUrl.value, test.value.id)
    // Start with the requested page only. Selecting every discovered link can
    // launch dozens of Chromium instances and exhaust the Functions emulator.
    selectedUrls.value = pages.value.slice(0, 1).map((page) => page.url)
    notify(`Se han encontrado ${pages.value.length} URL(s).`)
  } catch (error) { notify(`No se pudieron buscar las URLs: ${error.message}`, 'error') }
  finally { discovering.value = false }
}

const runEvaluations = async () => {
  const agent = agents.value.find((item) => item.id === selectedAgentId.value)
  if (!agent || !test.value) return
  running.value = true
  results.value = []
  selectedUrls.value.forEach((url) => { progress[url] = { status: 'pending', current: 0, total: test.value.testStructure?.length || 0 } })
  const urls = [...selectedUrls.value]
  let nextUrlIndex = 0
  const evaluateNextUrl = async () => {
    while (nextUrlIndex < urls.length) {
      const url = urls[nextUrlIndex]
      nextUrlIndex += 1
      try {
        progress[url].status = 'running'
        const tree = await pageLoader.load(url, test.value.id)
        const provider = new FirebaseHeuristicAgentProvider({ testId: test.value.id, agentId: agent.id })
        const evaluator = new HeuristicAgentEvaluator({
          provider,
          saveAnswer: (answer) => answerController.saveTestAnswer(answer, test.value.answersDocId, STUDY_TYPES.HEURISTIC),
        })
        const urlKey = encodeURIComponent(url).replaceAll('.', '%2E')
        const result = await evaluator.evaluateAndSave({
          agent, userId: userId.value, test: test.value, webTree: tree,
          answerId: `ai-agent:${encodeURIComponent(agent.id)}:${urlKey}`,
          onProgress: ({ index, total, status }) => {
            progress[url] = { status, current: index, total }
          },
        })
        progress[url] = { ...progress[url], status: 'completed', current: progress[url].total }
        results.value.push(result)
      } catch (error) {
        progress[url] = { ...progress[url], status: 'error', error: error.message }
      }
    }
  }
  try {
    // Keep Chromium/OpenRouter pressure bounded while still processing long
    // selections. A failed URL is recorded without cancelling the other URLs.
    const workerCount = Math.min(PAGE_EVALUATION_CONCURRENCY, urls.length)
    await Promise.all(Array.from({ length: workerCount }, evaluateNextUrl))
    if (results.value.length) await store.dispatch('getCurrentTestAnswerDoc')
    const failed = urls.filter((url) => progress[url]?.status === 'error')
    if (!failed.length) {
      notify('Todos los análisis seleccionados se han guardado correctamente.')
    } else if (results.value.length) {
      notify(`${results.value.length} análisis guardados y ${failed.length} con error. Revisa las páginas marcadas.`, 'warning')
    } else {
      notify('No se pudo analizar ninguna página. Revisa los errores de las páginas marcadas.', 'error')
    }
  } finally { running.value = false }
}

const loadAgents = async () => {
  loading.value = true
  try { agents.value = await controller.listAvailable(userId.value) }
  catch (error) { notify(`No se pudieron cargar los agentes: ${error.message}`, 'error') }
  finally { loading.value = false }
}
const toggleAgent = async (agentId, enabled) => {
  savingId.value = agentId
  const previous = [...activeIds.value]
  test.value.heuristicAgentIds = enabled ? [...new Set([...previous, agentId])] : previous.filter((id) => id !== agentId)
  try { await store.dispatch('updateStudy', test.value); notify(enabled ? 'Agente activado.' : 'Agente desactivado.') }
  catch (error) { test.value.heuristicAgentIds = previous; notify(`No se pudo actualizar el estudio: ${error.message}`, 'error') }
  finally { savingId.value = null }
}
const viewResults = () => router.push(`/heuristic/results/${test.value.id}`)
onMounted(loadAgents)
</script>

<style scoped>
.url-list { max-height: 420px; overflow-y: auto; }
</style>
