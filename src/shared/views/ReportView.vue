<template>
  <PageWrapper
    :title="
      showIntroView ? $t('HeuristicsReport.titles.reports_dashboard') : ''
    "
    :side-gap="true"
  >
    <ConfirmDialog
      v-model:show="dialog"
      :title="dialogTitle"
      :message="dialogText"
      :confirm-text="dialogConfirmText"
      :cancel-text="$t('common.cancel')"
      :confirm-color="isHideAction ? 'primary' : 'error'"
      :confirm-icon="isHideAction ? 'mdi-eye-off' : 'mdi-delete'"
      :icon="isHideAction ? 'mdi-eye-off-outline' : 'mdi-delete-outline'"
      :icon-color="isHideAction ? 'primary' : 'error'"
      :type="isHideAction ? 'info' : 'error'"
      :loading="loadingBtn"
      @confirm="confirmReportAction"
      @cancel="dialog = false"
    />
    <template v-if="showIntroView" #subtitle>
      <div class="d-flex align-center mb-4">
        <v-icon
          icon="mdi-update"
          size="small"
          class="mr-2 text-medium-emphasis"
        />
        <span class="text-body-2 text-medium-emphasis">
          {{ $t('Dashboard.cards.lastActivity') }}:
          {{ formatDate(lastUpdated) }}
        </span>
      </div>
    </template>

    <template v-if="showIntroView" #filters>
      <div
        class="d-flex align-center justify-space-between mb-6 flex-wrap gap-4"
      >
        <div class="d-flex align-center gap-4 flex-wrap w-100">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            :label="$t('HeuristicsReport.filters.search_reports')"
            variant="outlined"
            density="compact"
            hide-details
            class="flex-grow-1"
            style="min-width: 250px; max-width: 500px"
          />
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            :label="$t('HeuristicsReport.filters.filter_by_status')"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            style="min-width: 200px; width: 200px"
          />
        </div>
      </div>
    </template>

    <Intro v-if="reports.length === 0 && !loading" @go-to-coops="goToCoops" />

    <v-card
      v-if="reports.length > 0"
      elevation="2"
      class="rounded-lg d-none d-sm-block"
    >
      <v-data-table
        :headers="headers"
        :items="filteredReports"
        :search="searchQuery"
        class="elevation-0"
        :no-data-text="$t('HeuristicsReport.messages.no_reports_found')"
      >
        <template #[`item.evaluator`]="{ item }">
          <div>
            <div class="d-flex align-center flex-wrap">
              <span class="text-subtitle-1 font-weight-bold text-on-surface">
                {{ item.fullName }}
              </span>
              <v-chip
                :color="item.isAnonymous ? 'warning' : 'success'"
                size="x-small"
                variant="tonal"
                class="ml-2"
              >
                {{
                  $t(
                    item.isAnonymous
                      ? 'HeuristicsReport.labels.anonymous'
                      : 'HeuristicsReport.labels.not_anonymous',
                  )
                }}
              </v-chip>
              <v-chip
                v-if="item.isAIAgent"
                color="primary"
                size="x-small"
                variant="tonal"
                class="ml-2"
              >
                {{ $t('HeuristicsReport.labels.ai_agent') }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ item.userDocId || '—' }}
            </div>
          </div>
        </template>

        <template #[`item.lastUpdate`]="{ item }">
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-clock-outline"
              size="small"
              class="mr-2 text-medium-emphasis"
            />
            <span class="text-body-1">{{ item.lastUpdate }}</span>
          </div>
        </template>

        <template #[`item.progress`]="{ item }">
          <div class="progress-section">
            <div class="d-flex align-center justify-space-between mb-2">
              <span
                class="text-body-2 font-weight-medium text-medium-emphasis"
                >{{ $t('HeuristicsReport.headers.progress') }}</span
              >
              <span class="text-subtitle-1 font-weight-bold text-on-surface"
                >{{ item.progress }}%</span
              >
            </div>
            <v-progress-linear
              :model-value="parseFloat(item.progress)"
              :color="getProgressColor(parseFloat(item.progress))"
              height="8"
              rounded
            />
          </div>
        </template>

        <template #[`item.studyStage`]="{ item }">
          <span class="text-body-1">{{ item.studyStage }}</span>
        </template>

        <template #[`item.totalTime`]="{ item }">
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-timer-outline"
              size="small"
              class="mr-2 text-medium-emphasis"
            />
            <span class="text-body-1">{{ item.totalTime }}</span>
          </div>
        </template>

        <template #[`item.tasksTotalTime`]="{ item }">
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-timer-outline"
              size="small"
              class="mr-2 text-medium-emphasis"
            />
            <span class="text-body-1">{{ item.tasksTotalTime }}</span>
          </div>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            :text="item.status"
            variant="flat"
            size="small"
            class="text-capitalize font-weight-medium"
            :prepend-icon="getStatusIcon(item.status)"
          />
        </template>

        <template #[`item.hidden`]="{ item }">
          <v-chip
            :color="item.hidden ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            <v-icon v-if="item.hidden"> mdi-check </v-icon>
            <v-icon v-else> mdi-close </v-icon>
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                v-bind="props"
                class="text-medium-emphasis"
              />
            </template>
            <v-list min-width="180">
              <v-list-item
                prepend-icon="mdi-delete"
                :title="$t('HeuristicsReport.messages.remove_report')"
                class="text-error"
                @click="requestDeleteConfirmation(item)"
              />
              <v-list-item
                :prepend-icon="item.hidden ? 'mdi-eye' : 'mdi-eye-off'"
                :title="
                  $t(
                    item.hidden
                      ? 'HeuristicsReport.actions.unhide_response'
                      : 'HeuristicsReport.actions.hide_response',
                  )
                "
                @click="requestReportVisibilityChange(item)"
              />
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <div class="d-sm-none">
      <template v-for="item in filteredReports" :key="item.id">
        <v-card class="mb-4 report-card pa-4" variant="flat" border>
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center" style="min-width: 0">
              <div style="min-width: 0">
                <div class="d-flex align-center flex-wrap">
                  <span
                    class="text-subtitle-1 font-weight-bold text-on-surface"
                  >
                    {{ item.fullName }}
                  </span>
                  <v-chip
                    :color="item.isAnonymous ? 'warning' : 'success'"
                    size="x-small"
                    variant="tonal"
                    class="ml-2"
                  >
                    {{
                      $t(
                        item.isAnonymous
                          ? 'HeuristicsReport.labels.anonymous'
                          : 'HeuristicsReport.labels.not_anonymous',
                      )
                    }}
                  </v-chip>
                  <v-chip
                    v-if="item.isAIAgent"
                    color="primary"
                    size="x-small"
                    variant="tonal"
                    class="ml-1"
                  >
                    {{ $t('HeuristicsReport.labels.ai_agent') }}
                  </v-chip>
                </div>
                <div class="text-body-2 text-medium-emphasis text-truncate">
                  {{ item.userDocId || '—' }}
                </div>
              </div>
            </div>

            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="default"
                  v-bind="props"
                />
              </template>
              <v-list min-width="180">
                <v-list-item
                  prepend-icon="mdi-delete"
                  :title="$t('HeuristicsReport.messages.remove_report')"
                  class="text-error"
                  @click="requestDeleteConfirmation(item)"
                />
                <v-list-item
                  :prepend-icon="item.hidden ? 'mdi-eye' : 'mdi-eye-off'"
                  :title="
                    $t(
                      item.hidden
                        ? 'HeuristicsReport.actions.unhide_response'
                        : 'HeuristicsReport.actions.hide_response',
                    )
                  "
                  @click="requestReportVisibilityChange(item)"
                />
              </v-list>
            </v-menu>
          </div>

          <v-divider class="mb-4" />

          <v-row dense>
            <v-col cols="12" class="mb-3">
              <v-sheet
                rounded
                color="blue-lighten-5"
                variant="flat"
                class="pa-3"
              >
                <div class="d-flex align-center justify-space-between">
                  <span
                    class="text-caption font-weight-bold text-blue-darken-3"
                  >
                    {{ $t('HeuristicsReport.headers.last_update') }}
                  </span>
                  <div class="d-flex align-center">
                    <v-icon
                      icon="mdi-clock-outline"
                      size="small"
                      class="mr-2 text-blue-darken-3"
                    />
                    <span
                      class="text-body-2 font-weight-medium text-blue-darken-3"
                    >
                      {{ item.lastUpdate }}
                    </span>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="6">
              <v-sheet
                rounded
                color="grey-lighten-4"
                variant="flat"
                class="pa-3 h-100"
              >
                <div
                  class="text-caption font-weight-bold text-medium-emphasis mb-1"
                >
                  {{ $t('HeuristicsReport.headers.status') }}
                </div>
                <v-chip
                  :color="getStatusColor(item.status)"
                  :text="item.status"
                  variant="flat"
                  size="small"
                  class="text-capitalize font-weight-medium w-100 justify-center"
                />
              </v-sheet>
            </v-col>

            <v-col cols="12">
              <v-sheet
                rounded
                color="grey-lighten-4"
                variant="flat"
                class="pa-3 h-100"
              >
                <div
                  class="text-caption font-weight-bold text-medium-emphasis mb-1"
                >
                  {{ $t('HeuristicsReport.headers.total_time') }}
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-timer-outline"
                    size="small"
                    class="mr-2 text-medium-emphasis"
                  />
                  <span class="text-body-2 font-weight-medium">
                    {{ item.totalTime }}
                  </span>
                </div>
              </v-sheet>
            </v-col>

            <v-col v-if="item.studyStage" cols="12">
              <v-sheet
                rounded
                color="grey-lighten-4"
                variant="flat"
                class="pa-3 h-100"
              >
                <div
                  class="text-caption font-weight-bold text-medium-emphasis mb-1"
                >
                  {{ $t('HeuristicsReport.headers.study_stage') }}
                </div>
                <div class="text-body-2 font-weight-medium">
                  {{ item.studyStage }}
                </div>
              </v-sheet>
            </v-col>

            <v-col v-if="item.tasksTotalTime != null" cols="12">
              <v-sheet
                rounded
                color="grey-lighten-4"
                variant="flat"
                class="pa-3 h-100"
              >
                <div
                  class="text-caption font-weight-bold text-medium-emphasis mb-1"
                >
                  {{ $t('HeuristicsReport.headers.tasks_total_time') }}
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-timer-outline"
                    size="small"
                    class="mr-2 text-medium-emphasis"
                  />
                  <span class="text-body-2 font-weight-medium">
                    {{ item.tasksTotalTime }}
                  </span>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="6">
              <v-sheet
                rounded
                color="grey-lighten-4"
                variant="flat"
                class="pa-3 h-100"
              >
                <div
                  class="text-caption font-weight-bold text-medium-emphasis mb-1"
                >
                  {{ $t('common.hidden') }}
                </div>
                <v-chip
                  :color="item.hidden ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                  class="w-100 justify-center"
                >
                  <v-icon start size="small">
                    {{ item.hidden ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                  {{ item.hidden ? $t('common.hidden') : $t('common.visible') }}
                </v-chip>
              </v-sheet>
            </v-col>

            <v-col cols="12" class="mt-2">
              <v-sheet
                rounded
                color="teal-lighten-5"
                variant="flat"
                class="pa-3"
              >
                <div class="d-flex align-center justify-space-between mb-2">
                  <span
                    class="text-caption font-weight-bold text-teal-darken-3"
                  >
                    {{ $t('HeuristicsReport.headers.progress') }}
                  </span>
                  <span class="text-body-2 font-weight-bold text-teal-darken-3">
                    {{ item.progress }}%
                  </span>
                </div>
                <v-progress-linear
                  :model-value="parseFloat(item.progress)"
                  :color="getProgressColor(parseFloat(item.progress))"
                  height="8"
                  rounded
                  class="mb-1"
                />
              </v-sheet>
            </v-col>
          </v-row>
        </v-card>
      </template>
    </div>
    <div
      v-if="filteredReports.length === 0 && reports.length > 0 && !loading"
      class="text-center py-12"
    >
      <v-icon
        icon="mdi-file-search"
        size="64"
        class="text-medium-emphasis mb-4"
      />
      <h3 class="text-h5 font-weight-medium text-medium-emphasis mb-2">
        {{ $t('HeuristicsReport.messages.no_reports_found') }}
      </h3>
      <p class="text-body-1 text-medium-emphasis">
        {{ $t('HeuristicsReport.messages.try_adjusting_search') }}
      </p>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import Intro from '@/shared/components/introduction_cards/IntroReports.vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
  normalizeStudyType,
} from '@/shared/constants/methodDefinitions'
import {
  parseTimeSpentToMs,
  formatTimeSpentFromMs,
} from '@/ux/Heuristic/utils/statistics'
import { sumTaskTimeMs } from '@/ux/UserTest/utils/testDuration'
import { showSuccess } from '../utils/toast'

const store = useStore()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const props = defineProps({ id: { type: String, default: '' } })
const dialog = ref(false)
const dialogAction = ref('delete')
const loadingBtn = ref(false)
const report = ref(null)
const isHideAction = computed(() => dialogAction.value === 'hide')
const dialogTitle = computed(() =>
  isHideAction.value
    ? t('HeuristicsReport.messages.confirm_hide_response')
    : t('HeuristicsReport.messages.remove_report'),
)
const dialogConfirmText = computed(() =>
  isHideAction.value
    ? t('HeuristicsReport.actions.hide_response')
    : t('common.delete'),
)
const searchQuery = ref('')
const statusFilter = ref(null)
const lastUpdated = ref(new Date())

const test = computed(() => store.getters.test)
const loading = computed(() => store.getters.loading)

const showIntroView = computed(() => {
  return reports.value.length > 0
})

const participants = computed(() => store.getters.participants || [])

const allHeaders = computed(() => [
  { title: t('HeuristicsReport.headers.evaluator'), key: 'evaluator' },
  { title: t('HeuristicsReport.headers.status'), key: 'status' },
  { title: t('HeuristicsReport.headers.progress'), key: 'progress' },
  { title: t('HeuristicsReport.headers.study_stage'), key: 'studyStage' },
  { title: t('HeuristicsReport.headers.total_time'), key: 'totalTime' },
  {
    title: t('HeuristicsReport.headers.tasks_total_time'),
    key: 'tasksTotalTime',
  },
  { title: t('HeuristicsReport.headers.last_update'), key: 'lastUpdate' },
  { title: t('common.hidden'), key: 'hidden' },
  {
    title: t('HeuristicsReport.headers.actions'),
    key: 'actions',
    sortable: false,
  },
])

const answers = computed(() => store.getters.rawTestAnswerDocument)
const headers = computed(() => {
  const type = answers.value?.type
  return allHeaders.value
    .filter((header) => {
      if (header.key === 'tasksTotalTime') {
        return type === STUDY_TYPES.USER
      }
      if (header.key === 'studyStage') {
        return type === STUDY_TYPES.USER
      }
      if (header.key === 'totalTime') {
        return type !== STUDY_TYPES.CARD_SORTING
      }
      return true
    })
    .map((header) =>
      header.key === 'totalTime' && type === STUDY_TYPES.USER
        ? { ...header, title: t('HeuristicsReport.headers.total_test_time') }
        : header,
    )
})

const checkIfIsSubmitted = (status) =>
  status
    ? t('HeuristicsReport.status.submitted')
    : t('HeuristicsReport.status.in_progress')

const formatDate = (timestamp) => {
  const current = new Date()
  const start = new Date(timestamp)
  const diff = {
    years: current.getFullYear() - start.getFullYear(),
    months: current.getMonth() - start.getMonth(),
    days: current.getDate() - start.getDate(),
    hours: current.getHours() - start.getHours(),
    minutes: current.getMinutes() - start.getMinutes(),
  }
  for (const [unit, value] of Object.entries(diff)) {
    if (value > 0) return formatTimeAgo(value, unit)
  }
  return t('common.timeAgo.now')
}

const formatTimeAgo = (count, unit) => t(`common.timeAgo.${unit}`, { count })

const getReportTotalTime = (reportData, type) => {
  if (!reportData) return '00:00'

  if (type === STUDY_TYPES.USER) {
    if (reportData.totalTestTimeMs == null) return '—'
    return formatTimeSpentFromMs(Number(reportData.totalTestTimeMs))
  }

  if (type === STUDY_TYPES.HEURISTIC) {
    const isAIAgent = reportData.userDocId?.startsWith('ai-agent:') || false
    if (isAIAgent && reportData.evaluationTimeMs != null) {
      return formatTimeSpentFromMs(Number(reportData.evaluationTimeMs))
    }
    const heuristics = reportData.heuristicQuestions || []
    const totalMs = heuristics.reduce(
      (acc, heuristic) => acc + parseTimeSpentToMs(heuristic?.timeSpent),
      0,
    )
    return formatTimeSpentFromMs(totalMs)
  }

  if (type === STUDY_TYPES.CARD_SORTING) {
    return '—'
  }

  const tasks = reportData.tasks || {}
  const list = Array.isArray(tasks) ? tasks : Object.values(tasks)
  const totalMs = list.reduce(
    (acc, task) => acc + Number(task?.taskTime || 0),
    0,
  )
  return formatTimeSpentFromMs(totalMs)
}

const getReportTasksTotalTime = (reportData) =>
  formatTimeSpentFromMs(sumTaskTimeMs(reportData))

const getReportStudyStage = (reportData) => {
  if (reportData.submitted) return t('HeuristicsReport.stages.completed')

  const structure = test.value?.testStructure || {}
  if (!reportData.consentCompleted) {
    return t('HeuristicsReport.stages.consent')
  }
  if (structure.preTest?.length && !reportData.preTestCompleted) {
    return t('HeuristicsReport.stages.pre_test')
  }

  const tasks = Array.isArray(structure.userTasks) ? structure.userTasks : []
  for (let index = 0; index < tasks.length; index++) {
    const taskDefinition = tasks[index]
    const taskAnswer =
      reportData.tasks?.[index] ??
      reportData.tasks?.[String(index)] ??
      reportData.tasks?.[taskDefinition?.taskId]

    if (!taskAnswer?.completed && !taskAnswer?.attempted) {
      return (
        taskDefinition?.taskName ||
        t('HeuristicsReport.stages.task', { number: index + 1 })
      )
    }
  }

  if (structure.postTest?.length && !reportData.postTestCompleted) {
    return t('HeuristicsReport.stages.post_test')
  }

  return t('HeuristicsReport.stages.completed')
}

const getAnswersByType = (doc, type) => {
  if (type === STUDY_TYPES.USER) return doc.taskAnswers || {}
  if (type === STUDY_TYPES.CARD_SORTING) return doc.cardSortingAnswers || {}
  return doc.heuristicAnswers || {}
}

const isAnonymousParticipant = (userDocId) => {
  const participant = participants.value.find((p) => p?.userDocId === userDocId)
  return !participant?.email
}

const reports = computed(() => {
  const doc = answers.value
  if (!doc) return []
  const type = doc.type
  const raw = getAnswersByType(doc, type)
  return Object.values(raw).map((r) => {
    const isAIAgent = r.userDocId?.startsWith('ai-agent:') || false
    const anonymous = !isAIAgent && isAnonymousParticipant(r.userDocId)

    return {
      id: r.userDocId,
      fullName: isAIAgent
        ? t('HeuristicsReport.labels.ai_agent')
        : r.fullName || t('HeuristicsReport.headers.evaluator'),
      isAnonymous: anonymous,
      isAIAgent,
      userDocId: r.userDocId,
      progress: parseFloat(r.progress || 0).toFixed(2),
      studyStage: type === STUDY_TYPES.USER ? getReportStudyStage(r) : null,
      totalTime: getReportTotalTime(r, type),
      tasksTotalTime:
        type === STUDY_TYPES.USER ? getReportTasksTotalTime(r) : null,
      status: checkIfIsSubmitted(r.submitted),
      lastUpdate: formatDate(r.lastUpdate),
      hidden: r.hidden ?? false,
    }
  })
})

const filteredReports = computed(() => {
  if (!reports.value) return []
  return reports.value.filter((r) => {
    const matchQuery = r.fullName
      ?.toLowerCase()
      .includes(searchQuery.value.toLowerCase())
    const matchStatus = statusFilter.value
      ? r.status === statusFilter.value
      : true
    return matchQuery && matchStatus
  })
})

const statusOptions = computed(() => [
  t('HeuristicsReport.status.submitted'),
  t('HeuristicsReport.status.in_progress'),
])

const toggleReportHidden = async (item) => {
  loadingBtn.value = true
  try {
    const result = await store.dispatch('Reports/setReportHidden', {
      report: item,
      test: test.value,
      hidden: !item.hidden,
    })
    if (!result.success) throw result.error

    await getCurrentAnswer()
    showSuccess('alerts.genericSuccess')
    return true
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('errors.globalError'),
    })
    return false
  } finally {
    loadingBtn.value = false
  }
}

const requestDeleteConfirmation = (item) => {
  report.value = item
  dialogAction.value = 'delete'
  dialog.value = true
}

const requestReportVisibilityChange = (item) => {
  if (item.hidden) {
    toggleReportHidden(item)
    return
  }

  report.value = item
  dialogAction.value = 'hide'
  dialog.value = true
}

const confirmReportAction = async () => {
  if (dialogAction.value === 'hide') {
    if (await toggleReportHidden(report.value)) dialog.value = false
    return
  }

  await removeReport(report.value)
}

const dialogText = computed(() =>
  dialogAction.value === 'hide'
    ? t('HeuristicsReport.messages.hide_response_confirmation')
    : t('HeuristicsReport.messages.sure_to_delete', {
        user: report.value?.fullName || '',
      }),
)

watch(reports, () => {
  if (Object.values(reports.value)) store.commit('setLoading', false)
})

const getCurrentAnswer = async () => {
  await store.dispatch('getCurrentTestAnswerDoc')
}

const removeReport = async (report) => {
  loadingBtn.value = true

  await store.dispatch('Reports/removeReport', { report, test: test.value })

  await getCurrentAnswer()
  showSuccess('alerts.genericSuccess')

  loadingBtn.value = false
  dialog.value = false
}

const goToCoops = () => {
  // determine study type and subtype preferring the answers doc when available
  const type = answers.value?.type || test.value?.testType || ''
  const subType = answers.value?.subType || test.value?.subType || ''
  const normalized = normalizeStudyType(type)

  let base = '/heuristic'
  if (normalized === STUDY_TYPES.USER) {
    base =
      subType === USER_STUDY_SUBTYPES.UNMODERATED
        ? '/userTest/unmoderated'
        : '/userTest/moderated'
  } else if (normalized === STUDY_TYPES.CARD_SORTING) {
    base = '/cardSorting'
  } else if (
    normalized === STUDY_TYPES.ACCESSIBILITY_MANUAL ||
    normalized === STUDY_TYPES.ACCESSIBILITY_AUTOMATIC
  ) {
    base = '/accessibility'
  }

  if (test.value?.id) {
    router.push(`${base}/cooperators/${test.value.id}`).catch(() => {})
  }
}

const getProgressColor = (progress) => (progress >= 100 ? 'success' : 'primary')
const getStatusColor = (status) =>
  status === t('HeuristicsReport.status.submitted') ? 'success' : 'warning'
const getStatusIcon = (status) =>
  status === t('HeuristicsReport.status.submitted')
    ? 'mdi-check-circle'
    : 'mdi-progress-clock'

onMounted(async () => {
  store.commit('setLoading', true)
  try {
    await store.dispatch('getCurrentTestAnswerDoc')

    const studyId = props.id || route.params.id
    await store.dispatch('getStudyParticipants', { studyId })
  } catch {
    // console.error('Error:', error)
  } finally {
    store.commit('setLoading', false)
  }
})
</script>

<style scoped>
.report-card {
  border-radius: 16px !important;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.progress-section {
  min-width: 120px;
}

.table-header {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.table-heading-text {
  color: #1f2937 !important;
  font-weight: 700 !important;
}

.v-text-field :deep(.v-field__input) {
  min-height: 40px !important;
}

.v-select :deep(.v-field__input) {
  min-height: 40px !important;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
