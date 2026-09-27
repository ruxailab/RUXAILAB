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

      <v-row v-else>
        <v-col cols="12" md="4">
          <v-list density="compact" class="pa-0">
            <v-list-item
              v-for="session in sessions"
              :key="session.sessionId"
              :active="session.sessionId === selectedSessionId"
              rounded="lg"
              class="mb-1"
              @click="selectedSessionId = session.sessionId"
            >
              <v-list-item-title>
                {{ formatDate(session.startedAt) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{
                  $t('focusGroup.answers.participantCount', {
                    count: participantCount(session),
                  })
                }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col v-if="selectedSession" cols="12" md="8">
          <div class="d-flex justify-end ga-2 mb-4">
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

          <v-card variant="outlined" rounded="lg" class="mb-4">
            <v-card-title>{{ $t('focusGroup.analytics.keywordsTitle') }}</v-card-title>
            <v-card-text>
              <ThemeCloud :entries="keywordCloudEntries" />
            </v-card-text>
          </v-card>

          <v-card variant="outlined" rounded="lg" class="mb-4">
            <v-card-title>{{ $t('focusGroup.analytics.consensusTitle') }}</v-card-title>
            <v-card-text>
              <ConsensusHeatmap
                :topics="topics"
                :participants="participantsForSession"
                :matrix="consensusMatrix"
              />
            </v-card-text>
          </v-card>

          <v-card variant="outlined" rounded="lg" class="mb-4">
            <v-card-title>{{ $t('focusGroup.analytics.engagementTitle') }}</v-card-title>
            <v-card-text>
              <ParticipantEngagement :entries="engagementEntries" />
            </v-card-text>
          </v-card>

          <v-card variant="outlined" rounded="lg">
            <v-card-title>{{ $t('focusGroup.analytics.deepAnalysisTitle') }}</v-card-title>
            <v-card-subtitle>
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
import ConsensusHeatmap from '@/ux/FocusGroup/components/analytics/ConsensusHeatmap.vue'
import ParticipantEngagement from '@/ux/FocusGroup/components/analytics/ParticipantEngagement.vue'
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

// Rank-weighted keyword frequency across every topic's RAKE output — a
// keyword ranked first in a topic counts for more than one ranked last, and
// counts accumulate across topics.
const keywordCloudEntries = computed(() => {
  const weights = new Map()
  Object.values(perTopicAnalysis.value).forEach((topicAnalysis) => {
    ;(topicAnalysis?.keywords ?? []).forEach((term, index) => {
      const weight = topicAnalysis.keywords.length - index
      weights.set(term, (weights.get(term) ?? 0) + weight)
    })
  })
  return [...weights.entries()]
    .map(([term, weight]) => ({ term, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20)
})

const consensusMatrix = computed(() => {
  const matrix = {}
  Object.entries(perTopicAnalysis.value).forEach(([topicId, topicAnalysis]) => {
    matrix[topicId] = topicAnalysis?.consensus?.alignment ?? {}
  })
  return matrix
})

const engagementEntries = computed(() => {
  const percentages = computeParticipation({ messages: participantMessages.value })
  const participantIds = new Set(participantsForSession.value.map(({ id }) => id))
  const participants = selectedSession.value?.participants ?? {}
  return Object.entries(percentages)
    .filter(([userId]) => participantIds.has(userId))
    .map(([userId, percent]) => ({
      userId,
      percent,
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
    themes.value = result.themes ?? themes.value
    rawSessions.value = {
      ...rawSessions.value,
      [selectedSession.value.sessionId]: {
        ...rawSessions.value[selectedSession.value.sessionId],
        analysis: {
          ...rawSessions.value[selectedSession.value.sessionId]?.analysis,
          perTopic: result.perTopic,
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
    head: [['Topic', 'Summary', 'Keywords', 'Consensus']],
    body: topics.value
      .map((topic) => ({ topic, analysis: perTopicAnalysis.value[topic.id] }))
      .filter(({ analysis }) => analysis)
      .map(({ topic, analysis }) => [
        topic.title || topic.id,
        analysis.summary || '—',
        (analysis.keywords ?? []).join(', '),
        `${Math.round((analysis.consensus?.score ?? 0) * 100)}%`,
      ]),
    styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 215 } },
    margin: { left: M, right: M },
  })
  y = doc.lastAutoTable.finalY + 16

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
    head: [['Participant', 'Engagement']],
    body: engagementEntries.value.map((entry) => [entry.name, `${entry.percent}%`]),
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
    themes.value = answer.themes ?? []
    const first = sortSessionsByStartedAt(rawSessions.value)[0]
    selectedSessionId.value = first?.sessionId ?? null
  } finally {
    loading.value = false
  }
})
</script>
