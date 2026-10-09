<template>
  <PageWrapper :title="$t('focusGroup.analytics.title')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('focusGroup.analytics.subtitle') }}
      </p>
    </template>

    <v-container class="pa-0">
      <div
        v-if="!loading && !sessions.length"
        class="text-center py-8 text-medium-emphasis"
      >
        <v-icon icon="mdi-chart-box-outline" size="48" class="mb-2" />
        <p class="text-body-2 mb-0">{{ $t('focusGroup.answers.empty') }}</p>
      </div>

      <div v-else>
        <div
          v-if="sessions.length > 1"
          class="d-flex ga-2 mb-5 overflow-x-auto pb-1"
        >
          <v-chip
            v-for="session in sessions"
            :key="session.sessionId"
            :color="session.sessionId === selectedSessionId ? 'primary' : undefined"
            :variant="session.sessionId === selectedSessionId ? 'flat' : 'outlined'"
            size="large"
            class="text-none flex-shrink-0"
            @click="selectedSessionId = session.sessionId"
          >
            <v-icon start size="16">mdi-calendar-clock-outline</v-icon>
            {{ formatDate(session.startedAt) }}
            <v-chip size="x-small" variant="flat" color="grey-lighten-2" class="ml-2">
              {{ participantCount(session) }}
            </v-chip>
          </v-chip>
        </div>
        <div
          v-else-if="selectedSession"
          class="d-flex align-center ga-2 mb-5 text-medium-emphasis"
        >
          <v-icon icon="mdi-calendar-clock-outline" size="18" />
          <span class="text-body-2">
            {{ formatDate(selectedSession.startedAt) }}
            <span class="mx-1">•</span>
            {{
              $t('focusGroup.answers.participantCount', {
                count: participantCount(selectedSession),
              })
            }}
          </span>
        </div>

        <div v-if="selectedSession">
          <div class="d-flex flex-wrap justify-end ga-2 mb-4">
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-creation"
              class="text-none"
              :loading="analyzing"
              @click="onRunAnalysis"
            >
              {{ $t('focusGroup.analysis.runAnalysis') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-file-pdf-box"
              class="text-none"
              :disabled="!hasAnalysis"
              @click="onDownloadReport"
            >
              {{ $t('focusGroup.analytics.downloadReport') }}
            </v-btn>
            <v-btn
              variant="text"
              class="text-none"
              :to="`/focusGroup/answers/${test.id}`"
            >
              {{ $t('focusGroup.analytics.reviewThemes') }}
            </v-btn>
          </div>

          <v-row>
            <v-col cols="12">
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-title>{{ $t('focusGroup.analytics.keywordsTitle') }}</v-card-title>
                <v-card-subtitle class="analytics-card-subtitle">
                  {{ $t('focusGroup.analytics.keywordsHint') }}
                </v-card-subtitle>
                <v-card-text>
                  <ThemeCloud :entries="keywordCloudEntries" />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="lg">
                <v-card-title>{{ $t('focusGroup.analytics.summariesTitle') }}</v-card-title>
                <v-card-subtitle class="analytics-card-subtitle">
                  {{ $t('focusGroup.analytics.summariesHint') }}
                </v-card-subtitle>
                <v-card-text>
                  <p v-if="!hasAnalysis" class="text-medium-emphasis mb-0">
                    {{ $t('focusGroup.analytics.noAnalysisYet') }}
                  </p>
                  <div v-else>
                    <section
                      v-for="(topic, index) in topics"
                      :key="topic.id"
                      class="analytics-summary"
                      :class="{ 'analytics-summary--separated': index > 0 }"
                    >
                      <h3 class="text-subtitle-1 font-weight-medium mb-2">
                        {{ topic.title || $t('focusGroup.modules.untitledTopic') }}
                      </h3>
                      <p class="text-body-2 mb-0">
                        {{ perTopicAnalysis[topic.id]?.summary || $t('focusGroup.analytics.summaryUnavailable') }}
                      </p>
                    </section>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="5">
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-title>{{ $t('focusGroup.analytics.topicParticipationTitle') }}</v-card-title>
                <v-card-subtitle class="analytics-card-subtitle">
                  {{ $t('focusGroup.analytics.topicParticipationHint') }}
                </v-card-subtitle>
                <v-card-text>
                  <ChatCoverage
                    :topics="topics"
                    :participants="participantsForSession"
                    :matrix="topicParticipationMatrix"
                  />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="7">
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-title>{{ $t('focusGroup.analytics.engagementTitle') }}</v-card-title>
                <v-card-subtitle class="analytics-card-subtitle">
                  {{ $t('focusGroup.analytics.engagementHint') }}
                </v-card-subtitle>
                <v-card-text>
                  <ParticipantEngagement :entries="engagementEntries" />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="lg">
                <v-card-title>{{ $t('focusGroup.analytics.stanceTitle') }}</v-card-title>
                <v-card-subtitle class="analytics-card-subtitle">
                  {{ $t('focusGroup.analytics.stanceHint') }}
                </v-card-subtitle>
                <v-card-text>
                  <p v-if="!hasAnalysis" class="text-medium-emphasis mb-0">
                    {{ $t('focusGroup.analytics.noAnalysisYet') }}
                  </p>
                  <p v-else-if="!hasStanceFindings" class="text-medium-emphasis mb-0">
                    {{ $t('focusGroup.analytics.noStanceFindings') }}
                  </p>
                  <div v-else>
                    <section
                      v-for="(topic, index) in topicsWithStanceFindings"
                      :key="topic.id"
                      class="analytics-summary"
                      :class="{ 'analytics-summary--separated': index > 0 }"
                    >
                      <h3 class="text-subtitle-1 font-weight-medium mb-3">
                        {{ topic.title || $t('focusGroup.modules.untitledTopic') }}
                      </h3>
                      <div
                        v-for="finding in perTopicAnalysis[topic.id]?.consensus?.sharedOpinions ?? []"
                        :key="`shared-${finding.aspect}-${finding.stance}`"
                        class="mb-3"
                      >
                        <div class="text-body-2 font-weight-medium mb-1">
                          {{ $t('focusGroup.analytics.sharedView', { aspect: finding.aspect, stance: $t(`focusGroup.analytics.stance.${finding.stance}`) }) }}
                        </div>
                        <blockquote
                          v-for="item in finding.evidence"
                          :key="`shared-${finding.aspect}-${item.participantId}`"
                          class="stance-evidence text-body-2 mb-1"
                        >
                          <span class="font-weight-medium">{{ participantName(item.participantId) }}:</span>
                          {{ quotedText(item.quote) }}
                        </blockquote>
                      </div>
                      <div
                        v-for="finding in perTopicAnalysis[topic.id]?.consensus?.divergencePoints ?? []"
                        :key="`divergence-${finding.aspect}`"
                        class="mb-3"
                      >
                        <div class="text-body-2 font-weight-medium mb-1">
                          {{ $t('focusGroup.analytics.divergingViews', { aspect: finding.aspect }) }}
                        </div>
                        <template v-for="stance in ['positive', 'negative']" :key="stance">
                          <blockquote
                            v-for="item in finding.positions?.[stance] ?? []"
                            :key="`${finding.aspect}-${stance}-${item.participantId}`"
                            class="stance-evidence text-body-2 mb-1"
                          >
                            <span class="font-weight-medium">{{ participantName(item.participantId) }} ({{ $t(`focusGroup.analytics.stance.${stance}`) }}):</span>
                            {{ quotedText(item.quote) }}
                          </blockquote>
                        </template>
                      </div>
                    </section>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="lg">
                <v-card-title>{{ $t('focusGroup.analytics.deepAnalysisTitle') }}</v-card-title>
                <v-card-subtitle class="analytics-card-subtitle">
                  {{ $t('focusGroup.analytics.deepAnalysisHint') }}
                </v-card-subtitle>
                <v-card-text>
                  <p v-if="savedDeepAnalysis" class="text-body-2">
                    {{ savedDeepAnalysis.text }}
                  </p>

                  <v-alert
                    v-if="deepAnalysisResult"
                    type="info"
                    variant="tonal"
                    density="comfortable"
                    class="mb-3"
                  >
                    {{ deepAnalysisResult }}
                  </v-alert>

                  <div class="d-flex ga-2">
                    <v-btn
                      variant="tonal"
                      color="primary"
                      class="text-none"
                      :disabled="!canGenerateDeepAnalysis"
                      :loading="deepAnalysisLoading"
                      @click="onGenerateDeepAnalysis"
                    >
                      {{ $t('focusGroup.analytics.deepAnalysisGenerate') }}
                    </v-btn>
                    <v-btn
                      v-if="deepAnalysisResult"
                      variant="text"
                      class="text-none"
                      @click="onSaveDeepAnalysis"
                    >
                      {{ $t('focusGroup.analytics.deepAnalysisSave') }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import ThemeCloud from '@/ux/FocusGroup/components/analytics/ThemeCloud.vue'
import ChatCoverage from '@/ux/FocusGroup/components/analytics/ChatCoverage.vue'
import ParticipantEngagement from '@/ux/FocusGroup/components/analytics/ParticipantEngagement.vue'
import { rankKeywordCloud } from '@/ux/FocusGroup/utils/keywordRanking'
import { sortSessionsByStartedAt } from '@/ux/FocusGroup/utils/sessionSummary'
import { computeParticipation } from '@/ux/FocusGroup/utils/participation'

const store = useStore()
const route = useRoute()
const { t } = useI18n()

const test = computed(() => store.getters.test)
const rawSessions = ref({})
const themes = ref([])
const loading = ref(true)
const analyzing = ref(false)
const selectedSessionId = ref(null)

const sessions = computed(() => sortSessionsByStartedAt(rawSessions.value))
const selectedSession = computed(
  () => sessions.value.find((s) => s.sessionId === selectedSessionId.value) ?? null,
)
const topics = computed(() =>
  Array.isArray(test.value?.discussionGuide) ? test.value.discussionGuide : [],
)

const isParticipant = (person) => {
  if (person?.accessLevel !== undefined && person?.accessLevel !== null) {
    return Number(person.accessLevel) === 1
  }
  return ['participant', 'participante'].includes(
    String(person?.role ?? '').trim().toLowerCase(),
  )
}
const participantRoster = (session) =>
  Object.entries(session?.participants ?? {}).filter(([, person]) =>
    isParticipant(person),
  )
const participantCount = (session) => participantRoster(session).length
const formatDate = (timestamp) => (timestamp ? new Date(timestamp).toLocaleString() : '')

const perTopicAnalysis = computed(() => selectedSession.value?.analysis?.perTopic ?? {})
const hasAnalysis = computed(() => Object.keys(perTopicAnalysis.value).length > 0)

const participantsForSession = computed(() =>
  participantRoster(selectedSession.value).map(([id, p]) => ({
      id,
      name: p?.name || t('focusGroup.session.anonymous'),
    })),
)
const participantName = (participantId) =>
  participantsForSession.value.find(({ id }) => id === participantId)?.name
  || t('focusGroup.session.anonymous')
const quotedText = (text) => `“${text}”`
const participantMessages = computed(() => {
  const participantIds = new Set(participantsForSession.value.map(({ id }) => id))
  return Object.fromEntries(
    Object.entries(selectedSession.value?.messages ?? {}).map(([topicId, messages]) => [
      topicId,
      Object.fromEntries(
        Object.entries(messages ?? {}).filter(([, message]) =>
          participantIds.has(message?.userId),
        ),
      ),
    ]),
  )
})

const keywordCloudEntries = computed(() => rankKeywordCloud(perTopicAnalysis.value))

const topicParticipationMatrix = computed(() => {
  const matrix = {}
  const participantIds = participantsForSession.value.map(({ id }) => id)
  topics.value.forEach(({ id: topicId }) => {
    const counts = Object.fromEntries(participantIds.map((participantId) => [participantId, 0]))
    Object.values(participantMessages.value[topicId] ?? {}).forEach((message) => {
      if (message?.text?.trim() && message.userId in counts) counts[message.userId] += 1
    })
    matrix[topicId] = counts
  })
  return matrix
})

const topicCoverage = computed(() => Object.fromEntries(
  topics.value.map(({ id: topicId }) => {
    const counts = topicParticipationMatrix.value[topicId] ?? {}
    const responded = participantsForSession.value.filter(({ id }) => counts[id] > 0)
    return [topicId, {
      responded,
      missing: participantsForSession.value.filter(({ id }) => counts[id] === 0),
    }]
  }),
))

const topicsWithStanceFindings = computed(() => topics.value.filter((topic) => {
  const consensus = perTopicAnalysis.value[topic.id]?.consensus
  return consensus?.sharedOpinions?.length || consensus?.divergencePoints?.length
}))
const hasStanceFindings = computed(() => topicsWithStanceFindings.value.length > 0)

const engagementEntries = computed(() => {
  const percentages = computeParticipation({ messages: participantMessages.value })
  const participantIds = new Set(participantsForSession.value.map(({ id }) => id))
  const participants = selectedSession.value?.participants ?? {}
  const messageCounts = {}
  Object.values(participantMessages.value).forEach((byId) => {
    Object.values(byId ?? {}).forEach((message) => {
      messageCounts[message.userId] = (messageCounts[message.userId] ?? 0) + 1
    })
  })
  return Object.entries(percentages)
    .filter(([userId]) => participantIds.has(userId))
    .map(([userId, percent]) => ({
      userId,
      percent,
      messageCount: messageCounts[userId] ?? 0,
      name: participants[userId]?.name || t('focusGroup.session.anonymous'),
    }))
    .sort((a, b) => b.percent - a.percent)
})

const onRunAnalysis = async () => {
  if (!selectedSession.value) return
  analyzing.value = true
  try {
    const result = await store.dispatch('runFocusGroupAnalysis', {
      studyId: test.value?.id,
      answersDocId: test.value?.answersDocId,
      sessionId: selectedSession.value.sessionId,
    })
    if (!result) return
    rawSessions.value = {
      ...rawSessions.value,
      [selectedSession.value.sessionId]: {
        ...rawSessions.value[selectedSession.value.sessionId],
        analysis: {
          ...rawSessions.value[selectedSession.value.sessionId]?.analysis,
          perTopic: result.perTopic,
          suggestedThemes: result.suggestedThemes ?? [],
        },
      },
    }
  } finally {
    analyzing.value = false
  }
}

// Optional synthesis runs through the server-side OpenRouter configuration;
// no provider key or endpoint is collected in the browser.
const deepAnalysisResult = ref('')
const deepAnalysisModel = ref('')
const deepAnalysisLoading = ref(false)
const savedDeepAnalysis = computed(() => selectedSession.value?.analysis?.deepAnalysis ?? null)
watch(selectedSessionId, () => {
  deepAnalysisResult.value = ''
  deepAnalysisModel.value = ''
})
const canGenerateDeepAnalysis = computed(
  () => hasAnalysis.value,
)

const onGenerateDeepAnalysis = async () => {
  const requestedSessionId = selectedSession.value?.sessionId
  if (!requestedSessionId) return
  deepAnalysisLoading.value = true
  try {
    const result = await store.dispatch('synthesizeFocusGroupAnalysis', {
      studyId: test.value?.id,
      answersDocId: test.value?.answersDocId,
      sessionId: requestedSessionId,
    })
    if (selectedSession.value?.sessionId !== requestedSessionId) return
    deepAnalysisResult.value = result?.text ?? ''
    deepAnalysisModel.value = result?.model ?? ''
    store.commit('SET_TOAST', {
      message: t('focusGroup.analytics.deepAnalysisSuccess'),
      type: 'success',
    })
  } catch {
    store.commit('SET_TOAST', {
      message: t('errors.globalError'),
      type: 'error',
    })
  } finally {
    deepAnalysisLoading.value = false
  }
}

const onSaveDeepAnalysis = async () => {
  const deepAnalysis = {
    text: deepAnalysisResult.value,
    model: deepAnalysisModel.value,
    generatedAt: Date.now(),
  }
  await store.dispatch('saveFocusGroupDeepAnalysis', {
    answersDocId: test.value?.answersDocId,
    sessionId: selectedSession.value.sessionId,
    deepAnalysis,
  })
  rawSessions.value = {
    ...rawSessions.value,
    [selectedSession.value.sessionId]: {
      ...rawSessions.value[selectedSession.value.sessionId],
      analysis: {
        ...rawSessions.value[selectedSession.value.sessionId]?.analysis,
        deepAnalysis,
      },
    },
  }
}

// --- PDF export (jsPDF + autoTable, mirrors ExportPanel.vue's pattern) ---
const onDownloadReport = () => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const M = 48
  let y = M

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(test.value?.testTitle || 'Focus Group Report', M, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(
    `${formatDate(selectedSession.value.startedAt)} — ${participantCount(selectedSession.value)} participants`,
    M,
    y,
  )
  y += 20
  doc.setTextColor(30)

  autoTable(doc, {
    startY: y,
    head: [['Topic', 'Summary', 'Keywords', 'Chat coverage']],
    body: topics.value
      .map((topic) => ({ topic, analysis: perTopicAnalysis.value[topic.id] }))
      .filter(({ analysis }) => analysis)
      .map(({ topic, analysis }) => [
        topic.title || topic.id,
        analysis.summary || '—',
        (analysis.keywords ?? []).join(', '),
        `${topicCoverage.value[topic.id]?.responded.length ?? 0}/${participantsForSession.value.length} participants responded in chat\n` +
          `No chat response: ${(topicCoverage.value[topic.id]?.missing ?? []).map(({ name }) => name).join(', ') || 'None'}`,
      ]),
    styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 78 }, 1: { cellWidth: 170 }, 2: { cellWidth: 115 } },
    margin: { left: M, right: M },
  })
  y = doc.lastAutoTable.finalY + 16

  const stanceRows = topics.value.flatMap((topic) => {
    const consensus = perTopicAnalysis.value[topic.id]?.consensus
    const topicName = topic.title || topic.id
    const shared = (consensus?.sharedOpinions ?? []).map((finding) => [
      topicName,
      `Possible shared ${finding.stance} view: ${finding.aspect}`,
      finding.evidence.map((item) => `${participantName(item.participantId)}: “${item.quote}”`).join('\n'),
    ])
    const divergent = (consensus?.divergencePoints ?? []).map((finding) => [
      topicName,
      `Possible contrasting views: ${finding.aspect}`,
      ['positive', 'negative'].flatMap((stance) =>
        (finding.positions?.[stance] ?? []).map((item) =>
          `${participantName(item.participantId)} (${stance}): “${item.quote}”`,
        ),
      ).join('\n'),
    ])
    return [...shared, ...divergent]
  })
  if (stanceRows.length) {
    autoTable(doc, {
      startY: y,
      head: [['Topic', 'Possible stance finding', 'Supporting participant quotes']],
      body: stanceRows,
      styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 145 } },
      margin: { left: M, right: M },
    })
    y = doc.lastAutoTable.finalY + 16
  }

  autoTable(doc, {
    startY: y,
    head: [['Theme', 'Source', 'Keywords']],
    body: themes.value.map((theme) => [
      theme.label,
      theme.source,
      (theme.keywords ?? []).join(', '),
    ]),
    styles: { fontSize: 9 },
    margin: { left: M, right: M },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : y,
    head: [['Participant', 'Messages', 'Share of participant messages']],
    body: engagementEntries.value.map((entry) => [
      entry.name,
      String(entry.messageCount),
      `${entry.percent}%`,
    ]),
    styles: { fontSize: 9 },
    margin: { left: M, right: M },
  })

  if (savedDeepAnalysis.value?.text) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [[t('focusGroup.analytics.deepAnalysisTitle')]],
      body: [[savedDeepAnalysis.value.text]],
      styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
      margin: { left: M, right: M },
    })
  }

  doc.save(`focus-group-report-${selectedSession.value.sessionId}.pdf`)
}

onMounted(async () => {
  if (!test.value) await store.dispatch('getStudy', { id: route.params.id })
  try {
    const answer = await store.dispatch(
      'getFocusGroupSessionAnswers',
      test.value?.answersDocId,
    )
    rawSessions.value = answer.sessions
    themes.value = (answer.themes ?? []).filter((theme) => theme.source !== 'nlp')
    const first = sortSessionsByStartedAt(rawSessions.value)[0]
    selectedSessionId.value = first?.sessionId ?? null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.analytics-card-subtitle {
  display: block;
  overflow: visible;
  white-space: normal;
  text-overflow: clip;
}

.stance-evidence {
  border-left: 3px solid rgb(var(--v-theme-primary));
  margin: 0;
  padding: 0.25rem 0 0.25rem 0.75rem;
}

.analytics-summary--separated {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
