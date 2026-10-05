<template>
  <PageWrapper :title="selectedUrls.length ? $t('heuristicAgents.title') : ''">
    <template v-if="selectedUrls.length" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('heuristicAgents.subtitle') }}
      </p>
    </template>

    <v-alert
      v-if="message"
      :type="messageType"
      closable
      class="mb-5"
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>

    <v-card
      v-if="!selectedUrls.length"
      class="configuration-banner pa-4 mb-4"
      rounded="xl"
      elevation="2"
    >
      <div class="configuration-content">
        <div class="configuration-copy">
          <h2 class="configuration-title">AI AGENTS</h2>
          <p class="configuration-description text-white mb-4">
            {{ $t('heuristicAgents.pages.configureInSettings') }}
          </p>
          <v-btn
            color="white"
            class="rounded-lg"
            :to="{
              name: 'HeuristicEditTest',
              params: { id: test.id },
              query: { tab: 'settings' },
            }"
          >
            {{ $t('pages.intros.click') }}
          </v-btn>
        </div>
        <v-img
          class="configuration-image hidden-sm-and-down"
          :src="require('@/assets/manager/IntroEdit.svg')"
          max-width="30%"
          contain
        />
      </div>
    </v-card>

    <v-card
      v-if="selectedUrls.length"
      class="analysis-card pa-6 mb-6"
      rounded="lg"
      variant="outlined"
    >
      <div class="section-heading mb-5">
        <v-avatar color="primary" variant="tonal" size="44">
          <v-icon>mdi-web</v-icon>
        </v-avatar>
        <h2 class="text-h6 font-weight-bold">
          {{ $t('heuristicAgents.pages.configured') }}
        </h2>
        <v-chip color="primary" variant="tonal" size="small" class="ml-auto">
          {{ selectedUrls.length }}
        </v-chip>
        <v-btn
          icon="mdi-pencil-outline"
          variant="text"
          size="small"
          color="primary"
          :disabled="running"
          :aria-label="$t('heuristicAgents.pages.openSettings')"
          :title="$t('heuristicAgents.pages.openSettings')"
          :to="{
            name: 'HeuristicEditTest',
            params: { id: test.id },
            query: { tab: 'settings' },
          }"
        />
      </div>
      <v-list class="url-list rounded-lg pa-0">
        <v-list-item
          v-for="(url, index) in selectedUrls"
          :key="url"
          class="page-row py-3"
        >
          <template #prepend>
            <span class="page-number mr-4">{{ index + 1 }}</span>
          </template>
          <v-list-item-title class="page-url" :title="url">{{
            url
          }}</v-list-item-title>
          <template #append>
            <v-chip
              v-if="progress[url]"
              size="small"
              :color="statusColor(progress[url].status)"
              variant="tonal"
              :title="progress[url].error || ''"
            >
              {{ progressLabel(progress[url]) }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card
      v-if="selectedUrls.length"
      class="analysis-card pa-6 mb-6"
      rounded="lg"
      variant="outlined"
    >
      <div class="section-heading mb-5">
        <v-avatar color="primary" variant="tonal" size="44"
          ><v-icon>mdi-robot-outline</v-icon></v-avatar
        >
        <div>
          <h2 class="text-h6 font-weight-bold">
            {{ $t('heuristicAgents.run.title') }}
          </h2>
        </div>
      </div>
      <v-row align="start">
        <v-col cols="12" md="8">
          <v-select
            v-model="selectedAgentId"
            :items="agents"
            :item-title="agentLabel"
            item-value="id"
            :label="$t('heuristicAgents.run.agent')"
            prepend-inner-icon="mdi-robot-outline"
            variant="outlined"
            density="comfortable"
            color="primary"
            :disabled="running"
            :loading="loading"
            :no-data-text="$t('heuristicAgents.run.noAgents')"
            :hint="$t('heuristicAgents.run.agentHint')"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-btn
            class="analyze-button text-none"
            block
            size="large"
            height="56"
            elevation="0"
            color="primary"
            prepend-icon="mdi-play"
            :loading="running"
            :disabled="!canRun"
            @click="runEvaluations"
          >
            {{
              $t('heuristicAgents.run.analyze', {
                count: selectedUrls.length || 0,
              })
            }}
          </v-btn>
        </v-col>
      </v-row>
      <v-progress-linear
        v-if="running"
        :model-value="totalProgress"
        color="primary"
        class="mt-4"
      />
      <div
        v-if="results.length"
        class="d-flex flex-wrap align-center justify-space-between ga-3 mt-5"
      >
        <v-alert type="success" variant="tonal" class="flex-grow-1 mb-0">
          {{ $t('heuristicAgents.run.saved', { count: results.length }) }}
        </v-alert>
        <v-btn
          color="primary"
          prepend-icon="mdi-chart-box-outline"
          @click="viewResults"
          >{{ $t('heuristicAgents.run.viewResults') }}</v-btn
        >
      </div>
    </v-card>
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
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
const running = ref(false)
const message = ref('')
const messageType = ref('success')
const selectedAgentId = ref(null)
const agentLabel = (agent) => {
  const description = agent.description?.trim()
  return description ? `${agent.name} - ${description}` : agent.name
}
const selectedUrls = computed(
  () => test.value?.heuristicAgentWebsites?.selectedUrls || [],
)
const results = ref([])
const progress = reactive({})
const PAGE_EVALUATION_CONCURRENCY = 2
const userId = computed(() => store.getters.user?.id || '')
const test = computed(() => store.getters.test)
const canRun = computed(
  () =>
    !running.value && selectedAgentId.value && selectedUrls.value.length > 0,
)
const notify = (text, type = 'success') => {
  message.value = text
  messageType.value = type
}
const statusColor = (status) =>
  ({
    completed: 'success',
    error: 'error',
    running: 'primary',
    pending: 'grey',
  })[status]
const progressLabel = (item) => {
  if (item.status === 'completed') return t('heuristicAgents.status.completed')
  if (item.status === 'error') return t('heuristicAgents.status.error')
  if (item.status === 'running')
    return t('heuristicAgents.status.running', {
      current: item.current,
      total: item.total,
    })
  return t('heuristicAgents.status.pending')
}
const totalProgress = computed(() => {
  const selected = selectedUrls.value
    .map((url) => progress[url])
    .filter(Boolean)
  if (!selected.length) return 0
  const value = selected.reduce(
    (sum, item) => sum + (item.total ? item.current / item.total : 0),
    0,
  )
  return Math.round((value / selected.length) * 100)
})
const runEvaluations = async () => {
  const agent = agents.value.find((item) => item.id === selectedAgentId.value)
  if (!agent || !test.value) return
  running.value = true
  results.value = []
  selectedUrls.value.forEach((url) => {
    progress[url] = {
      status: 'pending',
      current: 0,
      total: test.value.testStructure?.length || 0,
    }
  })
  const urls = [...selectedUrls.value]
  let nextUrlIndex = 0
  const evaluateNextUrl = async () => {
    while (nextUrlIndex < urls.length) {
      const url = urls[nextUrlIndex]
      nextUrlIndex += 1
      try {
        progress[url].status = 'running'
        const tree = await pageLoader.load(url, test.value.id)
        const provider = new FirebaseHeuristicAgentProvider({
          testId: test.value.id,
          agentId: agent.id,
        })
        const evaluator = new HeuristicAgentEvaluator({
          provider,
          saveAnswer: (answer) =>
            answerController.saveTestAnswer(
              answer,
              test.value.answersDocId,
              STUDY_TYPES.HEURISTIC,
            ),
        })
        const urlKey = encodeURIComponent(url).replaceAll('.', '%2E')
        const result = await evaluator.evaluateAndSave({
          agent,
          userId: userId.value,
          test: test.value,
          webTree: tree,
          answerId: `ai-agent:${encodeURIComponent(agent.id)}:${urlKey}`,
          onProgress: ({ index, total, status }) => {
            progress[url] = { status, current: index, total }
          },
        })
        progress[url] = {
          ...progress[url],
          status: 'completed',
          current: progress[url].total,
        }
        results.value.push(result)
      } catch (error) {
        progress[url] = {
          ...progress[url],
          status: 'error',
          error: error.message,
        }
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
      notify(
        t('heuristicAgents.messages.partiallySaved', {
          saved: results.value.length,
          failed: failed.length,
        }),
        'warning',
      )
    } else {
      notify(t('heuristicAgents.messages.noneSaved'), 'error')
    }
  } finally {
    running.value = false
  }
}

const loadAgents = async () => {
  loading.value = true
  try {
    agents.value = await controller.listAvailable(userId.value)
  } catch (error) {
    notify(
      t('heuristicAgents.messages.loadAgentsError', { error: error.message }),
      'error',
    )
  } finally {
    loading.value = false
  }
}
const viewResults = () => router.push(`/heuristic/results/${test.value.id}`)
onMounted(loadAgents)
</script>

<style scoped>
.analysis-card {
  border-color: #dfe5ec;
  box-shadow: 0 4px 18px rgba(0, 33, 63, 0.04);
}
.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.url-list {
  max-height: 420px;
  overflow-y: auto;
  background: #f7f9fc;
}
.page-row + .page-row {
  border-top: 1px solid #e5eaf0;
}
.page-number {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e8eef5;
  color: #00213f;
  font-size: 12px;
  font-weight: 600;
}
.page-url {
  white-space: normal;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.6;
}
.analyze-button {
  border-radius: 8px;
  letter-spacing: 0;
}

.configuration-banner {
  background-image: radial-gradient(
    circle at top left,
    #00213f 60%,
    #ff3f59 160%
  );
  color: aliceblue;
}
.configuration-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  height: 50vh;
}
.configuration-copy {
  max-width: 30%;
}
.configuration-title {
  font-family: 'Google Sans', sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 44px;
  margin: 0 28px 0 0;
}
.configuration-description {
  font-size: 20px;
}
.configuration-image {
  flex: 1;
}
@media (max-width: 960px) {
  .configuration-content {
    height: auto;
    padding: 24px 0;
  }
  .configuration-copy {
    max-width: 100%;
    margin: 0 10px;
  }
}
</style>
