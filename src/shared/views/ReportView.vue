<template>
  <PageWrapper
    :title="
      showIntroView ? $t('HeuristicsReport.titles.reports_dashboard') : ''
    "
    :side-gap="true"
  >
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-error text-white" primary-title>
          {{ $t('HeuristicsReport.messages.confirm_delete_report') }}
        </v-card-title>
        <v-card-text>{{ dialogText }}</v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            class="bg-grey-lighten-3"
            variant="text"
            @click="dialog = false"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="bg-red text-white ml-1"
            :loading="loadingBtn"
            variant="text"
            @click="removeReport(report), (loadingBtn = true)"
          >
            {{ $t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
          <div class="d-flex align-center">
            <v-avatar
              :color="getAvatarColor(item.evaluator)"
              size="40"
              class="mr-3"
            >
              <span class="text-white font-weight-medium">
                {{ getInitials(item.fullName) }}
              </span>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold text-on-surface">
                {{ item.fullName }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ item.evaluator }}
              </div>
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
                @click=";(dialog = true), (report = item)"
              />
              <v-list-item
                v-if="item.hidden"
                prepend-icon="mdi-eye"
                :title="$t('HeuristicsReport.actions.unhide_report')"
                @click="unhideReport(item)"
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
            <div class="d-flex align-center">
              <v-avatar
                :color="getAvatarColor(item.evaluator)"
                size="40"
                class="mr-3"
              >
                <span class="text-white font-weight-medium">
                  {{ getInitials(item.fullName) }}
                </span>
              </v-avatar>
              <div style="min-width: 0">
                <div
                  class="text-subtitle-1 font-weight-bold text-on-surface text-truncate"
                >
                  {{ item.fullName }}
                </div>
                <div class="text-body-2 text-medium-emphasis text-truncate">
                  {{ item.evaluator }}
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
                  @click=";(dialog = true), (report = item)"
                />
                <v-list-item
                  v-if="item.hidden"
                  prepend-icon="mdi-eye"
                  :title="$t('HeuristicsReport.actions.unhide_report')"
                  @click="unhideReport(item)"
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
                  {{ item.hidden ? 'Hidden' : 'Visible' }}
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
import Intro from '@/shared/components/introduction_cards/IntroReports.vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
import { showSuccess } from '../utils/toast'

const store = useStore()
const { t } = useI18n()

const props = defineProps({ id: { type: String, default: '' } })
const emit = defineEmits(['goToCoops'])

const dialog = ref(false)
const loadingBtn = ref(false)
const report = ref(null)
const searchQuery = ref('')
const statusFilter = ref(null)
const lastUpdated = ref(new Date())

const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)
const loading = computed(() => store.getters.loading)

const showIntroView = computed(() => {
  return reports.value.length > 0
})

const allHeaders = computed(() => [
  { title: t('HeuristicsReport.headers.evaluator'), key: 'evaluator' },
  { title: t('HeuristicsReport.headers.last_update'), key: 'lastUpdate' },
  { title: t('HeuristicsReport.headers.progress'), key: 'progress' },
  { title: t('HeuristicsReport.headers.status'), key: 'status' },
  { title: t('common.hidden'), key: 'hidden' },
  {
    title: t('HeuristicsReport.headers.actions'),
    key: 'actions',
    sortable: false,
  },
])

const answers = computed(() => store.getters.testAnswerDocument)
const headers = computed(() => {
  return allHeaders.value.filter((header) => {
    if (header.key === 'hidden') {
      return answers.value.type !== STUDY_TYPES.USER ? false : true
    }
    return true
  })
})

const checkIfIsSubmitted = (status) =>
  status
    ? t('HeuristicsReport.status.submitted')
    : t('HeuristicsReport.status.in_progress')

const getCooperatorEmail = (userDocId) => {
  if (userDocId === user.value.id) return 'You'
  const cooperators = test.value.cooperators || []
  const found = cooperators.find((c) => c?.userDocId === userDocId)
  return found?.email || 'Unknown'
}

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

const reports = computed(() => {
  const doc = answers.value
  if (!doc) return []
  const type = doc.type
  const raw =
    type === STUDY_TYPES.USER
      ? doc.taskAnswers || {}
      : doc.heuristicAnswers || {}
  return Object.values(raw).map((r) => ({
    id: r.userDocId,
    fullName: r.fullName || t('HeuristicsReport.headers.evaluator'),
    evaluator: getCooperatorEmail(r.userDocId),
    userDocId: r.userDocId,
    progress: parseFloat(r.progress).toFixed(2),
    status: checkIfIsSubmitted(r.submitted),
    lastUpdate: formatDate(r.lastUpdate),
    hidden: r.hidden ?? false,
  }))
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

const unhideReport = async (item) => {
  if (answers.value.type !== STUDY_TYPES.USER) return
  const payload = Object.values(answers.value.taskAnswers).find(
    (s) => s.userDocId === item.id,
  )

  if (!payload) {
    console.error('Session not found for userDocId:', item.id)
    return
  }
  try {
    await store.dispatch('updateTaskAnswer', {
      payload: new UserStudyEvaluatorAnswer({
        ...payload,
        hidden: !item.hidden,
      }),
      answersDocId: test.value.answersDocId,
    })
  } catch (error) {
    console.error('Error saving answer:', error.message)
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('errors.globalError'),
    })
  }
}

const dialogText = computed(() =>
  t('HeuristicsReport.messages.sure_to_delete', {
    user: report.value ? report.value.evaluator : '',
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

const goToCoops = () => emit('goToCoops')

const getAvatarColor = (name) => '#3f51b5'
const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?'
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
  } catch (error) {
    console.error('Error:', error)
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
