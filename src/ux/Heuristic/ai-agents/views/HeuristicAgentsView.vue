<template>
  <PageWrapper :title="selectedUrls.length ? $t('heuristicAgents.title') : ''">
    <template v-if="selectedUrls.length" #subtitle
      ><p class="text-body-1 text-grey-darken-1">
        {{ $t('heuristicAgents.design.subtitle') }}
      </p></template
    >
    <v-alert
      v-if="message"
      :type="messageType"
      closable
      class="mb-5"
      @click:close="message = ''"
      >{{ message }}</v-alert
    >

    <v-card
      v-if="!selectedUrls.length"
      class="configuration-banner pa-4 mb-4"
      rounded="xl"
      elevation="2"
    >
      <div class="configuration-content">
        <div class="configuration-copy">
          <h2 class="configuration-title">
            {{ $t('Dashboard.managerView.aiAgents') }}
          </h2>
          <p class="configuration-description text-white mb-4">
            {{ $t('heuristicAgents.pages.configureInSettings') }}
          </p>
          <v-btn
            color="white"
            class="rounded-lg"
            :to="{
              name: 'HeuristicEditTest',
              params: { id: test?.id },
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
          :cover="false"
        />
      </div>
    </v-card>

    <v-card
      v-if="selectedUrls.length"
      class="agent-setup pa-6 mb-6"
      rounded="xl"
      variant="outlined"
    >
      <div class="section-heading mb-5">
        <v-avatar color="primary" variant="tonal" size="44"
          ><v-icon>mdi-robot-outline</v-icon></v-avatar
        >
        <div>
          <h2 class="text-h6 font-weight-bold">
            {{ $t('heuristicAgents.run.setupTitle') }}
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
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-btn
            v-if="running"
            class="analyze-button text-none"
            block
            size="large"
            height="56"
            elevation="0"
            :color="job.paused ? 'primary' : 'warning'"
            :prepend-icon="job.paused ? 'mdi-play' : 'mdi-pause'"
            @click="evaluationJobs.toggleAll(job)"
            >{{
              $t(
                job.paused
                  ? 'heuristicAgents.run.resumeAll'
                  : 'heuristicAgents.run.pauseAll',
              )
            }}</v-btn
          >
          <v-btn
            v-else
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
            >{{
              $t('heuristicAgents.run.analyze', { count: selectedUrls.length })
            }}</v-btn
          >
        </v-col>
      </v-row>
      <v-alert
        v-if="!loading && !agents.length"
        type="info"
        variant="tonal"
        class="mt-4"
        >{{ $t('heuristicAgents.run.noAgents') }}</v-alert
      >
    </v-card>

    <v-card
      v-if="job.urls.length"
      class="run-summary pa-5 mb-6"
      rounded="xl"
      variant="outlined"
      aria-live="polite"
    >
      <div
        class="d-flex flex-wrap align-center justify-space-between ga-3 mb-3"
      >
        <div>
          <div class="d-flex align-center ga-2">
            <v-icon :color="job.paused ? 'warning' : 'primary'">{{
              job.paused
                ? 'mdi-pause-circle-outline'
                : running
                  ? 'mdi-progress-clock'
                  : 'mdi-check-circle-outline'
            }}</v-icon>
            <h2 class="text-h6">
              {{
                $t(
                  job.paused
                    ? 'heuristicAgents.run.pausedTitle'
                    : running
                      ? 'heuristicAgents.run.runningTitle'
                      : 'heuristicAgents.run.finishedTitle',
                )
              }}
            </h2>
          </div>
          <p class="text-body-2 text-medium-emphasis mt-1">
            {{
              $t('heuristicAgents.run.pagesProgress', {
                completed: finishedPages,
                total: selectedUrls.length,
              })
            }}
          </p>
        </div>
        <strong class="text-h5">{{ totalProgress }}%</strong>
      </div>
      <v-progress-linear
        :model-value="totalProgress"
        color="primary"
        rounded
        height="8"
        :aria-label="$t('heuristicAgents.design.overallProgress')"
      />
      <p v-if="running" class="text-body-2 text-medium-emphasis mt-3">
        {{
          $t(
            job.paused
              ? 'heuristicAgents.run.pauseHint'
              : 'heuristicAgents.run.background',
          )
        }}
      </p>
      <v-alert v-if="retryCount" type="warning" variant="tonal" class="mt-3">{{
        $t('heuristicAgents.run.retryHint', { count: retryCount })
      }}</v-alert>
    </v-card>

    <div v-if="selectedUrls.length" class="section-heading mb-4">
      <div>
        <h2 class="text-h6 font-weight-bold">
          {{ $t('heuristicAgents.pages.configured') }}
        </h2>
        <p class="text-body-2 text-grey-darken-1">
          {{ $t('heuristicAgents.design.expandHint') }}
        </p>
      </div>
      <v-chip color="primary" variant="tonal" size="small" class="ml-auto">{{
        selectedUrls.length
      }}</v-chip>
      <v-btn
        prepend-icon="mdi-pencil-outline"
        variant="text"
        color="primary"
        :disabled="running"
        :to="{
          name: 'HeuristicEditTest',
          params: { id: test?.id },
          query: { tab: 'settings' },
        }"
        >{{ $t('heuristicAgents.design.editPages') }}</v-btn
      >
    </div>
    <v-expansion-panels
      v-model="expandedPages"
      class="website-panels"
      variant="accordion"
      multiple
    >
      <v-expansion-panel
        v-for="(url, pageIndex) in selectedUrls"
        :key="url"
        :value="url"
        rounded="lg"
      >
        <v-expansion-panel-title>
          <div class="website-heading">
            <v-avatar color="primary" variant="tonal" size="36">{{
              pageIndex + 1
            }}</v-avatar>
            <div class="website-copy">
              <span class="page-url font-weight-medium">{{ url }}</span>
              <p class="text-caption text-grey-darken-1">
                {{
                  $t('heuristicAgents.design.heuristicCount', {
                    count: pageHeuristics(url).length,
                  })
                }}
              </p>
            </div>
            <v-chip
              size="small"
              :color="statusColor(progress[url]?.status || 'pending')"
              variant="tonal"
              >{{
                progressLabel(progress[url] || { status: 'pending' })
              }}</v-chip
            >
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-alert
            v-if="progress[url]?.error"
            type="error"
            variant="tonal"
            class="mb-3"
            >{{ progress[url].error }}</v-alert
          >
          <v-expansion-panels
            variant="accordion"
            multiple
            class="heuristic-panels"
          >
            <v-expansion-panel
              v-for="(heuristic, index) in pageHeuristics(url)"
              :key="index"
              :value="index"
            >
              <v-expansion-panel-title>
                <div class="heuristic-heading">
                  <div class="d-flex align-center ga-2">
                    <v-icon :color="statusColor(heuristic.status)">{{
                      heuristic.answer
                        ? 'mdi-check-circle'
                        : heuristic.paused
                          ? 'mdi-pause-circle'
                          : heuristic.status === 'error'
                            ? 'mdi-alert-circle'
                            : 'mdi-clock-outline'
                    }}</v-icon>
                    <span class="heuristic-title"
                      >{{ index + 1 }}. {{ heuristic.title }}</span
                    >
                  </div>
                  <div class="heuristic-progress">
                    <div
                      class="d-flex justify-space-between ga-2 text-caption mb-1"
                      role="status"
                    >
                      <span>{{
                        $t(
                          `heuristicAgents.status.${job.paused && !['completed', 'error', 'blocked'].includes(heuristic.status) ? 'paused' : heuristic.status === 'running' ? 'evaluating' : heuristic.status}`,
                        )
                      }}</span
                      ><span v-if="studyMode === 'detailed'"
                        >{{ heuristic.completedQuestions }} /
                        {{ heuristic.totalQuestions }}</span
                      >
                    </div>
                    <v-progress-linear
                      :model-value="heuristicPercent(heuristic)"
                      :indeterminate="
                        heuristic.status === 'running' &&
                        !job.paused &&
                        !heuristic.completedQuestions
                      "
                      :color="
                        heuristic.answer
                          ? 'success'
                          : statusColor(heuristic.status)
                      "
                      rounded
                      height="6"
                      :aria-label="heuristic.title"
                    />
                  </div>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div
                  v-if="heuristic.status !== 'completed'"
                  class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4"
                >
                  <p class="text-body-2">
                    {{
                      $t(
                        studyMode === 'detailed'
                          ? 'heuristicAgents.run.questionProgress'
                          : 'heuristicAgents.run.heuristicProgress',
                        {
                          completed: heuristic.completedQuestions,
                          total: heuristic.totalQuestions,
                        },
                      )
                    }}
                  </p>
                  <v-btn
                    v-if="heuristic.status !== 'completed'"
                    size="small"
                    variant="tonal"
                    :color="heuristic.paused ? 'primary' : 'warning'"
                    :prepend-icon="heuristic.paused ? 'mdi-play' : 'mdi-pause'"
                    :disabled="
                      !running ||
                      job.paused ||
                      ['completed', 'error', 'blocked'].includes(
                        heuristic.status,
                      )
                    "
                    :title="
                      $t(
                        heuristic.paused
                          ? 'heuristicAgents.run.resume'
                          : 'heuristicAgents.run.pause',
                      )
                    "
                    @click="toggleHeuristic(url, index)"
                    >{{
                      $t(
                        heuristic.paused
                          ? 'heuristicAgents.design.resume'
                          : 'heuristicAgents.design.pause',
                      )
                    }}</v-btn
                  >
                </div>
                <v-alert
                  v-if="heuristic.error"
                  type="error"
                  variant="tonal"
                  class="mb-3"
                  >{{ heuristic.error }}</v-alert
                >
                <v-alert
                  v-for="(failure, questionIndex) in heuristic.questionErrors"
                  :key="questionIndex"
                  type="error"
                  variant="tonal"
                  class="mb-3"
                >
                  <p>{{ heuristic.questionTitles[questionIndex] }}</p>
                  <p class="text-body-2">{{ failure.message }}</p>
                  <v-btn
                    class="mt-2"
                    :loading="failure.retrying"
                    :disabled="failure.retrying || job.paused"
                    @click="
                      evaluationJobs.retryQuestion(
                        job,
                        url,
                        index,
                        questionIndex,
                      )
                    "
                    >{{
                      $t(
                        studyMode === 'detailed'
                          ? 'heuristicAgents.run.retryQuestion'
                          : 'heuristicAgents.run.retryHeuristic',
                      )
                    }}</v-btn
                  >
                </v-alert>
                <template v-if="heuristic.answer">
                  <div
                    v-for="(answer, questionIndex) in heuristic.answer
                      .heuristicQuestions"
                    :key="questionIndex"
                    class="response-card pa-4 mb-3"
                  >
                    <p
                      v-if="studyMode === 'detailed'"
                      class="font-weight-medium mb-2"
                    >
                      {{ heuristic.questionTitles[questionIndex] }}
                    </p>
                    <div class="assessment-metrics mb-4">
                      <div
                        v-for="metric in responseMetrics(
                          answer.heuristicAnswer,
                        )"
                        :key="metric.label"
                        class="assessment-metric"
                      >
                        <span class="text-caption text-medium-emphasis">{{
                          metric.label
                        }}</span>
                        <strong
                          >{{ metric.value
                          }}<span v-if="metric.max" class="metric-scale">
                            / {{ metric.max }}</span
                          ></strong
                        >
                        <span v-if="metric.description" class="text-caption">{{
                          metric.description
                        }}</span>
                      </div>
                    </div>
                    <p
                      v-if="answer.heuristicComment"
                      class="text-caption text-medium-emphasis mb-1"
                    >
                      {{ $t('heuristicAgents.run.explanation') }}
                    </p>
                    <p
                      v-if="answer.heuristicComment"
                      class="response-comment text-body-2"
                    >
                      {{ answer.heuristicComment }}
                    </p>
                    <a
                      v-if="answer.answerImageUrl"
                      :href="answer.answerImageUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="visual-evidence mt-4"
                      :aria-label="$t('heuristicAgents.run.evidence')"
                    >
                      <img
                        :src="answer.answerImageUrl"
                        :alt="$t('heuristicAgents.run.evidence')"
                        loading="lazy"
                      />
                      <span class="text-caption"
                        >{{ $t('heuristicAgents.run.evidence') }}
                        <v-icon size="14">mdi-open-in-new</v-icon></span
                      >
                    </a>
                  </div>
                </template>
                <div
                  v-else-if="studyMode === 'detailed'"
                  class="question-preview"
                >
                  <p class="text-caption text-grey-darken-1 mb-2">
                    {{ $t('heuristicAgents.design.questions') }}
                  </p>
                  <p
                    v-for="(title, questionIndex) in heuristic.questionTitles"
                    :key="questionIndex"
                    class="text-body-2 mb-2"
                  >
                    {{ questionIndex + 1 }}. {{ title }}
                  </p>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="results.length"
      class="d-flex flex-wrap align-center justify-space-between ga-3 mt-5"
    >
      <p class="text-success">
        <v-icon class="mr-1">mdi-check-circle</v-icon
        >{{ $t('heuristicAgents.run.saved', { count: results.length }) }}
      </p>
      <v-btn
        color="primary"
        prepend-icon="mdi-chart-box-outline"
        @click="viewResults"
        >{{ $t('heuristicAgents.run.viewResults') }}</v-btn
      >
    </div>
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import HeuristicAgentController from '../controllers/HeuristicAgentController'
import evaluationJobs from '../services/heuristicEvaluationJobs'
import {
  prepareAgentStudy,
  resolveAgentStudyMode,
} from '@/ux/Heuristic/utils/heuristicAgentStudyMode'

const controller = new HeuristicAgentController()
const store = useStore()
const router = useRouter()
const { t } = useI18n()
const agents = ref([])
const loading = ref(true)
const userId = computed(() => store.getters.user?.id || '')
const test = computed(() => store.getters.test)
const job = computed(() => evaluationJobs.getJob(userId.value, test.value?.id))
const running = computed(() => job.value.running)
const expandedPages = ref([])
const message = ref('')
const messageType = ref('success')
const selectedAgentId = ref(null)
const agentLabel = (agent) => {
  const description = agent.description?.trim()
  return description ? `${agent.name} - ${description}` : agent.name
}
const selectedUrls = computed(() =>
  job.value.urls.length
    ? job.value.urls
    : test.value?.heuristicAgentWebsites?.selectedUrls || [],
)
const studyMode = computed(
  () => job.value.studyMode || resolveAgentStudyMode(test.value),
)
const pageHeuristics = (url) =>
  progress.value[url]?.heuristics ||
  (prepareAgentStudy(test.value || {}).testStructure || []).map(
    (heuristic) => ({
      title: heuristic.title || heuristic.name || '',
      status: 'pending',
      paused: false,
      completedQuestions: 0,
      totalQuestions: (heuristic.questions || []).length,
      questionTitles: (heuristic.questions || []).map(
        (question, index) => question.title || question.text || `${index + 1}`,
      ),
    }),
  )
const heuristicPercent = (heuristic) =>
  heuristic.totalQuestions
    ? (heuristic.completedQuestions / heuristic.totalQuestions) * 100
    : heuristic.answer
      ? 100
      : 0
const results = computed(() => job.value.results)
const progress = computed(() => job.value.progress)
const toggleHeuristic = (url, index) =>
  evaluationJobs.toggle(job.value, url, index)
watch(
  job,
  (value) => {
    if (value.agentId) selectedAgentId.value = value.agentId
  },
  { immediate: true },
)
watch(
  () => job.value.outcome,
  (outcome) => {
    if (!outcome) return
    if (!outcome.failed) notify(t('heuristicAgents.messages.allSaved'))
    else if (outcome.saved)
      notify(t('heuristicAgents.messages.partiallySaved', outcome), 'warning')
    else notify(t('heuristicAgents.messages.noneSaved'), 'error')
    if (outcome.saved && test.value?.id)
      store.dispatch('getCurrentTestAnswerDoc')
  },
)
const finishedPages = computed(
  () =>
    Object.values(progress.value).filter((page) => page.status === 'completed')
      .length,
)
const retryCount = computed(() =>
  Object.values(progress.value)
    .flatMap((page) => page.heuristics)
    .reduce(
      (count, heuristic) =>
        count +
        Object.values(heuristic.questionErrors || {}).filter(
          (error) => !error.retrying,
        ).length,
      0,
    ),
)
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
    paused: 'warning',
    blocked: 'warning',
  })[status]
const progressLabel = (item) => {
  if (item.status === 'completed') return t('heuristicAgents.status.completed')
  if (item.status === 'error') return t('heuristicAgents.status.error')
  if (job.value.paused) return t('heuristicAgents.status.paused')
  if (item.status === 'running')
    return t('heuristicAgents.status.running', {
      current: item.current,
      total: item.total,
    })
  return t('heuristicAgents.status.pending')
}
const totalProgress = computed(() => {
  const selected = selectedUrls.value
    .map((url) => progress.value[url])
    .filter(Boolean)
  if (!selected.length) return 0
  const heuristics = selected.flatMap((item) => item.heuristics)
  const total = heuristics.reduce((sum, item) => sum + item.totalQuestions, 0)
  const completed = heuristics.reduce(
    (sum, item) => sum + item.completedQuestions,
    0,
  )
  return total ? Math.round((completed / total) * 100) : 0
})
const runEvaluations = () => {
  const agent = agents.value.find((item) => item.id === selectedAgentId.value)
  if (!agent || !test.value) return
  message.value = ''
  void evaluationJobs.start({
    agent,
    userId: userId.value,
    test: test.value,
    urls: test.value.heuristicAgentWebsites?.selectedUrls || [],
  })
}
const responseMetrics = (answer) => {
  if (answer.mode === 'customOptions')
    return [
      {
        label: t('heuristicAgents.run.assessment'),
        value: answer.custom?.text || answer.text,
      },
    ]
  if (answer.mode === 'weight')
    return [
      {
        label: t('HeuristicsSettings.modes.weights'),
        value: answer.weight,
        max: 9,
      },
    ]
  const scales = {
    frequency: ['rare', 'occasional', 'sometimes', 'frequent', 'constant'],
    severity: ['cosmetic', 'minor', 'moderate', 'major', 'catastrophic'],
  }
  return ['frequency', 'severity']
    .filter((key) => answer[key] != null)
    .map((key) => ({
      label: t(`HeuristicsTestView.answer.${key}`),
      value: answer[key],
      max: 4,
      description: t(
        `HeuristicsTestView.answer.${key}Scale.${scales[key][answer[key]]}`,
      ),
    }))
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
.agent-setup {
  border-color: #dfe5ec;
  box-shadow: 0 4px 18px rgba(0, 33, 63, 0.04);
}
.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.website-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding-right: 12px;
}
.website-copy {
  flex: 1;
  min-width: 0;
}
.page-url,
.heuristic-title {
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.5;
}
.website-panels {
  gap: 12px;
}
.website-panels > .v-expansion-panel {
  border: 1px solid #dfe5ec;
}
.heuristic-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding-right: 12px;
}
.heuristic-panels {
  border: 1px solid #e5eaf0;
  border-radius: 8px;
  overflow: hidden;
}
.response-card,
.question-preview {
  background: #f7f9fc;
  border-radius: 8px;
}
.question-preview {
  padding: 16px;
}
.response-comment {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.assessment-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.assessment-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 18px;
  min-width: 150px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
}
.assessment-metric strong {
  font-size: 1.25rem;
}
.metric-scale {
  font-size: 0.875rem;
  font-weight: 400;
  opacity: 0.65;
}
.visual-evidence {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 560px;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}
.visual-evidence img {
  display: block;
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
  object-position: left;
  border: 1px solid #dfe5ec;
  border-radius: 8px;
}
.analyze-button {
  border-radius: 8px;
  letter-spacing: 0;
}
@media (max-width: 600px) {
  .heuristic-heading {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .website-heading {
    flex-wrap: wrap;
    gap: 8px;
  }
  .website-copy {
    flex-basis: calc(100% - 52px);
  }
  .section-heading {
    flex-wrap: wrap;
  }
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
