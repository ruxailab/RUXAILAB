<template>
  <v-container class="pa-6" fluid>
    <div class="d-flex align-center ga-3 mb-2">
      <v-icon color="primary" size="34">mdi-robot-outline</v-icon>
      <h1 class="text-h4 font-weight-bold">{{ $t('heuristicAgents.title') }}</h1>
    </div>
    <p class="text-body-1 text-medium-emphasis mb-6">
      {{ $t('heuristicAgents.subtitle') }}
    </p>

    <v-alert v-if="message" :type="messageType" closable class="mb-5" @click:close="message = ''">
      {{ message }}
    </v-alert>

    <v-card class="pa-6 mb-6" rounded="lg" elevation="2">
      <div class="d-flex align-center ga-3 mb-3">
        <v-avatar color="primary" size="32"><span class="text-body-2 font-weight-bold">1</span></v-avatar>
        <div>
          <h2 class="text-h5">{{ $t('heuristicAgents.web.title') }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">{{ $t('heuristicAgents.web.subtitle') }}</p>
        </div>
      </div>
      <v-row align="center">
        <v-col cols="12" md="9">
          <v-text-field
            v-model="pageUrl"
            :label="$t('heuristicAgents.web.url')"
            placeholder="https://test.com"
            prepend-inner-icon="mdi-link"
            :disabled="running"
            @keyup.enter="discoverPages"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-btn block color="primary" prepend-icon="mdi-magnify" :loading="discovering" :disabled="running || !pageUrl" @click="discoverPages">
            {{ $t('heuristicAgents.web.search') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="pa-6 mb-6" rounded="lg" elevation="2">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" size="32"><span class="text-body-2 font-weight-bold">2</span></v-avatar>
          <div>
            <h2 class="text-h5">{{ $t('heuristicAgents.pages.title') }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ $t('heuristicAgents.pages.selected', { selected: selectedUrls.length, total: pages.length }) }}</p>
          </div>
        </div>
        <v-btn size="small" variant="text" :disabled="running || !pages.length" @click="toggleAllPages">
          {{ allPagesSelected ? $t('heuristicAgents.pages.deselectAll') : $t('heuristicAgents.pages.selectAll') }}
        </v-btn>
      </div>
      <v-alert
        v-if="!pages.length"
        type="info"
        variant="tonal"
        icon="mdi-link-variant"
      >
        {{ $t('heuristicAgents.pages.empty') }}
      </v-alert>
      <v-list v-else class="url-list border rounded-lg">
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
          <h2 class="text-h5">{{ $t('heuristicAgents.run.title') }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">{{ $t('heuristicAgents.run.subtitle') }}</p>
        </div>
      </div>
      <v-row align="center">
        <v-col cols="12" md="8">
          <v-select
            v-model="selectedAgentId"
            :items="agents"
            item-title="name"
            item-value="id"
            :label="$t('heuristicAgents.run.agent')"
            prepend-inner-icon="mdi-robot-outline"
            :disabled="running"
            :loading="loading"
            :no-data-text="$t('heuristicAgents.run.noAgents')"
            :hint="$t('heuristicAgents.run.agentHint')"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-btn block size="large" color="primary" prepend-icon="mdi-play" :loading="running" :disabled="!canRun" @click="runEvaluations">
            {{ $t('heuristicAgents.run.analyze', { count: selectedUrls.length || 0 }) }}
          </v-btn>
        </v-col>
      </v-row>
      <v-progress-linear v-if="running" :model-value="totalProgress" color="primary" class="mt-4" />
      <div v-if="results.length" class="d-flex align-center justify-space-between ga-3 mt-5">
        <v-alert type="success" variant="tonal" class="flex-grow-1 mb-0">
          {{ $t('heuristicAgents.run.saved', { count: results.length }) }}
        </v-alert>
        <v-btn color="primary" prepend-icon="mdi-chart-box-outline" @click="viewResults">{{ $t('heuristicAgents.run.viewResults') }}</v-btn>
      </div>
    </v-card>

  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()
const agents = ref([])
const loading = ref(true)
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
const canRun = computed(() => !running.value && !discovering.value && selectedAgentId.value && selectedUrls.value.length > 0)
const allPagesSelected = computed(
  () => pages.value.length > 0 && selectedUrls.value.length === pages.value.length,
)
const notify = (text, type = 'success') => { message.value = text; messageType.value = type }
const statusColor = (status) => ({ completed: 'success', error: 'error', running: 'primary', pending: 'grey' })[status]
const progressLabel = (item) => {
  if (item.status === 'completed') return t('heuristicAgents.status.completed')
  if (item.status === 'error') return t('heuristicAgents.status.error')
  if (item.status === 'running') return t('heuristicAgents.status.running', { current: item.current, total: item.total })
  return t('heuristicAgents.status.pending')
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
    notify(t('heuristicAgents.messages.urlsFound', { count: pages.value.length }))
  } catch (error) { notify(t('heuristicAgents.messages.discoverError', { error: error.message }), 'error') }
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
      notify(t('heuristicAgents.messages.allSaved'))
    } else if (results.value.length) {
      notify(t('heuristicAgents.messages.partiallySaved', { saved: results.value.length, failed: failed.length }), 'warning')
    } else {
      notify(t('heuristicAgents.messages.noneSaved'), 'error')
    }
  } finally { running.value = false }
}

const loadAgents = async () => {
  loading.value = true
  try { agents.value = await controller.listAvailable(userId.value) }
  catch (error) { notify(t('heuristicAgents.messages.loadAgentsError', { error: error.message }), 'error') }
  finally { loading.value = false }
}
const viewResults = () => router.push(`/heuristic/results/${test.value.id}`)
onMounted(loadAgents)
</script>

<style scoped>
.url-list { max-height: 420px; overflow-y: auto; }
</style>
