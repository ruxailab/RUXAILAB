<template>
  <div class="analytics-dashboard">
    <!-- Filtros dinámicos Pre-Test -->
    <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
      <div class="d-flex align-center mb-3 flex-wrap button-bar">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          variant="outlined"
          :placeholder="$t('analytics.searchByName')"
          class="flex-grow-1"
        />
        <v-btn
          color="primary"
          class="search-btn"
          prepend-icon="mdi-magnify"
          @click="triggerSearch"
          >{{ $t('analytics.search') }}</v-btn
        >
        <v-btn
          color="primary"
          class="search-btn"
          prepend-icon="mdi-filter-remove"
          :disabled="!hasActiveFilters"
          @click="resetFilters"
          >{{ $t('analytics.reset') }}</v-btn
        >

        <v-btn
          :color="showFilters ? 'primary' : 'grey'"
          variant="tonal"
          icon
          size="small"
          :title="
            showFilters
              ? $t('analytics.hideFilters')
              : $t('analytics.showFilters')
          "
          @click="toggleFilters"
        >
          <v-icon>{{
            showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant'
          }}</v-icon>
        </v-btn>
      </div>
      <v-expand-transition>
        <div v-show="showFilters">
          <v-row dense>
            <v-col
              v-for="def in filterDefinitions"
              :key="'filter-' + def.index"
              cols="12"
              sm="6"
              md="3"
            >
              <!-- Label / tooltip above field -->
              <v-tooltip v-if="(def.title || '').length > 42" location="top">
                <template #activator="{ props }">
                  <div class="filter-label truncate-2" v-bind="props">
                    {{ def.title }}
                  </div>
                </template>
                <span class="text-wrap">{{ def.title }}</span>
              </v-tooltip>
              <div v-else class="filter-label truncate-2">{{ def.title }}</div>
              <!-- Categórico (multi-select) -->
              <v-select
                v-if="def.isCategorical && def.items.length"
                v-model="selectedFilters[def.index]"
                :items="def.items"
                multiple
                chips
                clearable
                density="compact"
                variant="outlined"
                hide-details
                class="filter-field"
                @update:model-value="(val) => onFilterChange(def.index, val)"
              />
              <!-- Texto libre / numérico (match contiene) -->
              <v-text-field
                v-else
                v-model="selectedFilters[def.index]"
                density="compact"
                variant="outlined"
                hide-details
                clearable
                class="filter-field"
              />
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>

      <!-- Main Data Table -->
      <v-data-table
        :headers="tableHeaders"
        :items="tableData"
        :items-per-page="10"
        class="elevation-0 mt-4"
      >
        <template #item.identifier="{ item }">
          <v-chip
            color="primary"
            variant="tonal"
            size="small"
            class="font-weight-bold font-mono"
          >
            {{ item.identifier }}
          </v-chip>
        </template>

        <template #item.user="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" class="mr-3" color="primary">
              <span class="text-white text-body-2 font-weight-bold">
                {{ item.fullName.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium text-grey-800">
                {{ item.fullName }}
              </div>
              <div class="text-body-2 text-grey-600">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Dynamic Task Columns -->
        <template
          v-for="(t, i) in taskColumns"
          :key="'col-task-' + i"
          #[`item.task_${i}`]="{ item }"
        >
          <div class="d-flex flex-column align-center py-2">
            <v-chip
              size="x-small"
              :color="item[`task_${i}`]?.completed ? 'success' : 'error'"
              variant="tonal"
              class="mb-2 text-uppercase font-weight-medium"
              :prepend-icon="
                item[`task_${i}`]?.completed
                  ? 'mdi-check-circle'
                  : 'mdi-close-circle'
              "
            >
              {{
                item[`task_${i}`]?.completed
                  ? $t('analytics.completed')
                  : $t('analytics.notCompleted')
              }}
            </v-chip>
            <span
              class="text-caption"
              :class="{ 'text-grey-500': !item[`task_${i}`]?.timeSeconds }"
            >
              {{ $t('analytics.timeTaken') }}:
              {{
                item[`task_${i}`]?.timeSeconds
                  ? formatTime(item[`task_${i}`].timeSeconds)
                  : '-'
              }}
            </span>
          </div>
        </template>

        <template #item.tasks="{ item }">
          <div class="py-2">
            <div class="d-flex flex-column">
              <div class="d-flex align-center mb-1">
                <v-chip
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="mr-2 font-weight-medium"
                >
                  {{ $t('analytics.effectiveness') }}: {{ item.effectiveness }}%
                </v-chip>
                <v-chip
                  size="x-small"
                  color="secondary"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  {{ $t('analytics.efficiency') }}: {{ item.efficiency }} t/min
                </v-chip>
              </div>
              <div class="text-caption text-grey-600">
                ({{ item.completedCount }}/{{ item.totalTasks }}
                {{ $t('analytics.tasks') }} ·
                {{ formatTime(item.totalTimeSeconds) }}
                {{ $t('analytics.total') }})
              </div>
            </div>
          </div>
        </template>

        <template #item.invited="{ item }">
          <v-chip
            :color="item.invited ? 'success' : 'grey'"
            :prepend-icon="item.invited ? 'mdi-check' : 'mdi-close'"
            size="small"
            variant="tonal"
          >
            {{ item.invited ? $t('analytics.yes') : $t('analytics.no') }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-menu location="bottom end" transition="fade-transition">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                variant="text"
                size="small"
                :aria-label="'Acciones para ' + (item.fullName || 'usuario')"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list density="compact" class="py-0">
              <v-list-item prepend-icon="mdi-eye" @click="viewAnswers(item)">
                <v-list-item-title>Task detail</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal (Restored from Original Design) -->
    <v-dialog
      v-model="showDialog"
      max-width="960"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar color="primary" class="pl-3">
          <span class="text-h5">Test Details</span>
          <v-spacer />
          <v-btn
            color="white"
            variant="text"
            prepend-icon="mdi-close"
            @click="showDialog = false"
          >
            Close
          </v-btn>
        </v-toolbar>
        <v-card-text class="dialog-body">
          <v-container fluid class="py-0">
            <v-row v-if="dialogItem">
              <!-- User Header -->
              <v-col cols="12" class="pb-0">
                <div class="d-flex align-center mb-4 user-header">
                  <v-avatar size="48" color="primary" class="mr-3">
                    <span class="text-white text-subtitle-1 font-weight-bold">{{
                      dialogItem.fullName?.[0]?.toUpperCase()
                    }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ dialogItem.fullName }}
                    </div>
                    <div class="text-body-2 text-grey-600">
                      {{ dialogItem.email }}
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Pre-Test Answers -->
              <v-col
                v-if="dialogItem?.preTestAnswer?.length"
                cols="12"
                md="6"
                class="section-col"
              >
                <div class="section-card">
                  <div class="section-title">Pre-Test</div>
                  <v-divider class="my-2" />
                  <div class="qa-grid">
                    <div
                      v-for="(q, i) in testStructure.preTest"
                      :key="'pre-' + i"
                      class="qa-row"
                    >
                      <div class="qa-question">{{ q.title }}</div>
                      <div class="qa-answer">
                        <v-chip
                          v-if="q.type === 'selection'"
                          size="x-small"
                          color="primary"
                          variant="tonal"
                          >{{
                            dialogItem.preTestAnswer?.[i]?.answer || '-'
                          }}</v-chip
                        >
                        <span v-else>{{
                          dialogItem.preTestAnswer?.[i]?.answer || '-'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Post-Test Answers -->
              <v-col
                v-if="dialogItem?.postTestAnswer?.length"
                cols="12"
                md="6"
                class="section-col"
              >
                <div class="section-card">
                  <div class="section-title">Post-Test</div>
                  <v-divider class="my-2" />
                  <div class="qa-grid">
                    <div
                      v-for="(q, i) in testStructure.postTest"
                      :key="'post-' + i"
                      class="qa-row"
                    >
                      <div class="qa-question">{{ q.title }}</div>
                      <div class="qa-answer">
                        <v-chip
                          v-if="q.type === 'selection'"
                          size="x-small"
                          color="secondary"
                          variant="tonal"
                          >{{
                            dialogItem.postTestAnswer?.[i]?.answer || '-'
                          }}</v-chip
                        >
                        <span v-else>{{
                          dialogItem.postTestAnswer?.[i]?.answer || '-'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Task Selector -->
              <v-col
                v-if="testStructure?.userTasks?.length"
                cols="12"
                class="section-col"
              >
                <div class="section-card">
                  <div class="section-title d-flex align-center">
                    <span>
                      Tasks
                      <span class="text-caption font-weight-regular ml-2"
                        >({{ testStructure.userTasks.length }})</span
                      >
                    </span>
                  </div>
                  <v-divider class="my-2" />
                  <v-data-table
                    :headers="[
                      {
                        title: '#',
                        key: 'taskNumber',
                        sortable: false,
                        width: 72,
                      },
                      { title: 'Task', key: 'taskName', sortable: false },
                      {
                        title: 'Answer type',
                        key: 'taskTypeLabel',
                        sortable: false,
                        width: 170,
                      },
                      {
                        title: 'Tip',
                        key: 'tipUsage',
                        sortable: false,
                        width: 130,
                      },
                      {
                        title: 'Completion',
                        key: 'statusLabel',
                        sortable: false,
                        width: 150,
                      },
                      {
                        title: 'Answer',
                        key: 'answerPreview',
                        sortable: false,
                      },
                      {
                        title: 'Observations',
                        key: 'observationPreview',
                        sortable: false,
                      },
                      {
                        title: 'Recordings',
                        key: 'recordings',
                        sortable: false,
                        width: 180,
                      },
                      {
                        title: 'Time',
                        key: 'timeLabel',
                        sortable: false,
                        width: 110,
                      },
                    ]"
                    :items="taskSummaryRows"
                    :items-per-page="10"
                    class="elevation-0"
                    hide-default-footer
                    item-value="taskIndex"
                    @click:row="
                      (_, row) => selectTask(row.item.taskIndex, true)
                    "
                  >
                    <template #item.taskNumber="{ item }">
                      <v-chip size="small" variant="tonal" color="primary">
                        {{ item.taskNumber }}
                      </v-chip>
                    </template>

                    <template #item.taskName="{ item }">
                      <button
                        class="task-row-button"
                        type="button"
                        @click.stop="selectTask(item.taskIndex, true)"
                      >
                        <div class="font-weight-medium text-grey-900">
                          {{ item.taskName }}
                        </div>
                        <div class="text-caption text-grey-600">
                          {{ item.taskType || 'Task' }}
                        </div>
                      </button>
                    </template>

                    <template #item.taskTypeLabel="{ item }">
                      <v-chip size="small" variant="tonal" color="secondary">
                        <v-icon size="14" start>{{ item.taskTypeIcon }}</v-icon>
                        {{ item.taskTypeLabel }}
                      </v-chip>
                    </template>

                    <template #item.tipUsage="{ item }">
                      <v-chip
                        v-if="item.hasTipAvailable"
                        size="small"
                        variant="tonal"
                        :color="item.tipPressCount > 0 ? 'warning' : 'grey'"
                      >
                        <v-icon size="14" start>
                          {{
                            item.tipPressCount > 0
                              ? 'mdi-lightbulb-on-outline'
                              : 'mdi-lightbulb-outline'
                          }}
                        </v-icon>
                        {{ item.tipUsage }}
                      </v-chip>
                      <span v-else class="text-grey-500 text-body-2">-</span>
                    </template>

                    <template #item.statusLabel="{ item }">
                      <v-chip
                        size="small"
                        variant="tonal"
                        :color="item.statusColor"
                      >
                        <v-icon size="14" start>
                          {{
                            item.completed
                              ? 'mdi-check-circle'
                              : 'mdi-progress-close'
                          }}
                        </v-icon>
                        {{ item.statusLabel }}
                      </v-chip>
                    </template>

                    <template #item.answerPreview="{ item }">
                      <div class="table-preview text-grey-900">
                        {{ item.answerPreview }}
                      </div>
                    </template>

                    <template #item.observationPreview="{ item }">
                      <div class="d-flex flex-column gap-1">
                        <v-chip
                          v-if="item.hasObservations"
                          size="x-small"
                          color="warning"
                          variant="tonal"
                          class="align-self-start"
                        >
                          Observations added
                        </v-chip>
                        <span class="table-preview text-grey-900">
                          {{ item.observationPreview }}
                        </span>
                      </div>
                    </template>

                    <template #item.recordings="{ item }">
                      <div class="d-flex flex-wrap gap-1 recording-chip-wrap">
                        <v-chip
                          v-for="recording in item.recordings"
                          :key="`${item.taskIndex}-${recording.key}`"
                          size="x-small"
                          color="info"
                          variant="tonal"
                        >
                          <v-icon size="13" start>{{ recording.icon }}</v-icon>
                          {{ recording.label }}
                        </v-chip>
                        <span
                          v-if="!item.recordings.length"
                          class="text-grey-500 text-body-2"
                        >
                          -
                        </span>
                      </div>
                    </template>

                    <template #item.timeLabel="{ item }">
                      <div class="font-weight-medium text-grey-900">
                        {{ item.timeLabel }}
                      </div>
                    </template>
                  </v-data-table>

                  <SessionAnalyticsDialog
                    v-model="showSessionAnalyticsDialog"
                    :user-id="dialogItem.userDocId"
                    :task-answer="taskSummaryRows[taskSelect]?.rawTaskAnswer"
                    :selected-task="taskSelect"
                    :selected-task-name="taskSummaryRows[taskSelect]?.taskName"
                    :task-id="taskSummaryRows[taskSelect]?.taskId"
                    :has-audio-record="
                      taskSummaryRows[taskSelect]?.hasAudioRecord
                    "
                    :answers-doc-id="answersDocId"
                    :task-definitions="testStructure.userTasks || []"
                    :test-answer="answers[dialogItem.userDocId]"
                    :from-eye-tracking="true"
                  />
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <TaskDetailsModal
      v-model="showTaskDetailsModal"
      :user-session="selectedUserSession"
      @close="closeTaskDetailsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { formatTime } from '@/shared/utils/timeUtils'
import TaskDetailsModal from './TaskDetailsModal.vue'
import SessionAnalyticsDialog from '../dialogs/SessionAnalyticsDialog.vue'
import { useI18n } from 'vue-i18n'
import { useFilterDefinitions } from './useFilterDefinitions'

const { t } = useI18n()

const store = useStore()
const testStructure = computed(() => store.state.Tests.Test.testStructure || {})
const answers = computed(() => store.getters.visibleUserAnswers || {})
const answersDocId = computed(
  () =>
    store.getters.test?.answersDocId ||
    store.state.Answer.testAnswerDocument?.id ||
    '',
)

const showDialog = ref(false)
const dialogItem = ref(null)
const taskSelect = ref(0)
const testTasks = ref([])
const taskAnswers = ref([])
const showTaskDetailsModal = ref(false)
const selectedUserSession = ref(null)
const showSessionAnalyticsDialog = ref(false)

// Búsqueda por nombre / email
const searchTerm = ref('')

// Filtros dinámicos (todas las preguntas)
const selectedFilters = ref({})
const ALL_VALUE = '__ALL__'
const { filterDefinitions } = useFilterDefinitions({
  testStructure,
  answers,
  ALL_VALUE,
})

const onFilterChange = (idx, val) => {
  if (!val || !val.length) {
    selectedFilters.value[idx] = []
    return
  }
  if (val.includes(ALL_VALUE)) {
    selectedFilters.value[idx] = [ALL_VALUE]
  } else {
    selectedFilters.value[idx] = val
  }
}

const hasActiveFilters = computed(() => {
  const someFilters = Object.entries(selectedFilters.value).some(([v]) => {
    if (Array.isArray(v)) return v.length && !v.includes(ALL_VALUE)
    return !!v // texto
  })
  return someFilters || !!searchTerm.value.trim()
})

const resetFilters = () => {
  selectedFilters.value = {}
  searchTerm.value = ''
}

const filteredSessions = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return Object.values(answers.value).filter((session) => {
    if (term) {
      const name = (session.fullName || '').toLowerCase()
      const email = (session.email || '').toLowerCase()
      if (!name.includes(term) && !email.includes(term)) return false
    }
    return filterDefinitions.value.every((def) => {
      const sel = selectedFilters.value[def.index]
      // Sin filtro aplicado
      if (
        sel === undefined ||
        sel === null ||
        sel === '' ||
        (Array.isArray(sel) && (sel.length === 0 || sel.includes(ALL_VALUE)))
      )
        return true
      const ans = session.preTestAnswer?.[def.index]?.answer || ''
      if (def.isCategorical) {
        return Array.isArray(sel) ? sel.includes(ans) : true
      } else {
        // texto libre: substring case-insensitive
        if (typeof sel === 'string')
          return ans.toString().toLowerCase().includes(sel.toLowerCase())
        return true
      }
    })
  })
})

// Dynamic task columns + headers + table data
const taskColumns = computed(() => testStructure.value?.userTasks || [])

const getTaskTypeLabel = (taskType) => {
  const labels = {
    'no-answer': 'No answer',
    'text-area': t('switches.textArea'),
    'post-test': t('switches.postTest'),
    'post-form': t('switches.postForm'),
    'nasa-tlx': t('switches.nasa'),
    sus: t('sus'),
    'tam-1': 'TAM-1',
    'tam-2': 'TAM-2',
    'tam-3': 'TAM-3',
    sart: t('switches.sart'),
  }

  return labels[taskType] || taskType || '-'
}

const getTaskTypeIcon = (taskType) => {
  const icons = {
    'no-answer': 'mdi-minus-circle-outline',
    'text-area': 'mdi-text-box-outline',
    'post-test': 'mdi-clipboard-check-outline',
    'post-form': 'mdi-form-select',
    'nasa-tlx': 'mdi-rocket-launch-outline',
    sus: 'mdi-account-check-outline',
    'tam-1': 'mdi-chart-line',
    'tam-2': 'mdi-chart-box-outline',
    'tam-3': 'mdi-chart-donut-outline',
    sart: 'mdi-chart-areaspline',
  }

  return icons[taskType] || 'mdi-help-circle-outline'
}

const resolveTaskKey = (sessionTasks, index, taskDefinition) => {
  if (!sessionTasks) return String(index)
  if (sessionTasks[index] != null) return String(index)
  if (sessionTasks[`${index}`] != null) return String(index)
  if (
    taskDefinition?.taskId != null &&
    sessionTasks[taskDefinition.taskId] != null
  ) {
    return String(taskDefinition.taskId)
  }
  return String(index)
}

const resolveTaskAnswer = (sessionTasks, index, taskDefinition) => {
  if (!sessionTasks) return null
  return (
    sessionTasks[index] ??
    sessionTasks[`${index}`] ??
    sessionTasks[taskDefinition?.taskId] ??
    null
  )
}

const getQuestionnairePreview = (taskAnswer, taskType) => {
  if (!taskAnswer) return '-'

  const questionnaireValueMap = {
    'nasa-tlx': taskAnswer.nasaTlxAnswers,
    sus: taskAnswer.susAnswers,
    'tam-1': taskAnswer.tamAnswers,
    'tam-2': taskAnswer.tamAnswers,
    'tam-3': taskAnswer.tamAnswers,
    sart: taskAnswer.sartAnswers,
  }

  const questionnaireValue = questionnaireValueMap[taskType]
  if (!questionnaireValue) return '-'

  if (Array.isArray(questionnaireValue)) {
    const answered = questionnaireValue.filter(
      (value) => value !== undefined && value !== null && value !== '',
    ).length
    return answered > 0 ? `${answered} answered` : '-'
  }

  if (typeof questionnaireValue === 'object') {
    return Object.keys(questionnaireValue).length > 0
      ? 'Questionnaire captured'
      : '-'
  }

  return 'Questionnaire captured'
}

const getTaskAnswerPreview = (taskAnswer, taskDefinition) => {
  if (!taskAnswer) return '-'

  if (taskDefinition?.postQuestion) {
    return taskAnswer.postAnswer || '-'
  }

  if (taskDefinition?.taskType === 'text-area') {
    return taskAnswer.taskAnswer || '-'
  }

  if (
    ['sus', 'nasa-tlx', 'tam-1', 'tam-2', 'tam-3', 'sart'].includes(
      taskDefinition?.taskType,
    )
  ) {
    return getQuestionnairePreview(taskAnswer, taskDefinition?.taskType)
  }

  if (taskDefinition?.taskType === 'post-form') {
    return taskAnswer.postAnswer || taskAnswer.taskAnswer || '-'
  }

  return taskAnswer.taskAnswer || taskAnswer.postAnswer || '-'
}

const getTaskObservationPreview = (taskAnswer) => {
  const observation = String(taskAnswer?.taskObservations || '').trim()
  return observation || '-'
}

const getTaskRecordings = (taskAnswer, taskDefinition) => {
  const recordings = [
    {
      key: 'audio',
      label: 'Audio',
      icon: 'mdi-microphone',
      active:
        !!taskDefinition?.hasAudioRecord ||
        !!taskAnswer?.audioRecordURL ||
        !!taskAnswer?.moderatorAudioURL,
    },
    {
      key: 'screen',
      label: 'Screen',
      icon: 'mdi-monitor-screenshot',
      active:
        !!taskDefinition?.hasScreenRecord || !!taskAnswer?.screenRecordURL,
    },
    {
      key: 'webcam',
      label: 'Webcam',
      icon: 'mdi-camera',
      active: !!taskDefinition?.hasCamRecord || !!taskAnswer?.webcamRecordURL,
    },
    {
      key: 'eye',
      label: 'Eye',
      icon: 'mdi-eye',
      active:
        !!taskDefinition?.hasEye ||
        (Array.isArray(taskAnswer?.irisTrackingData) &&
          taskAnswer.irisTrackingData.length > 0),
    },
    {
      key: 'transcript',
      label: 'Transcript',
      icon: 'mdi-text-to-speech',
      active: !!taskAnswer?.transcriptionDocId,
    },
  ]

  return recordings.filter((recording) => recording.active)
}

const taskSummaryRows = computed(() => {
  const userTasks = testStructure.value?.userTasks || []
  const sessionTasks = dialogItem.value?.tasks || {}

  return userTasks.map((taskDefinition, index) => {
    const taskAnswer = resolveTaskAnswer(sessionTasks, index, taskDefinition)
    const observationText = getTaskObservationPreview(taskAnswer)
    const completed = !!taskAnswer?.completed
    const attempted = !!taskAnswer?.attempted
    const taskTimeSeconds = Math.floor((taskAnswer?.taskTime || 0) / 1000)
    const tipPressCount = Number(taskAnswer?.tipPressCount || 0)
    const hasTipAvailable = !!taskDefinition?.taskTip

    return {
      taskIndex: index,
      taskId: resolveTaskKey(sessionTasks, index, taskDefinition),
      taskNumber: index + 1,
      taskName: taskDefinition?.taskName || `Task ${index + 1}`,
      taskType: taskDefinition?.taskType || '',
      taskTypeLabel: getTaskTypeLabel(taskDefinition?.taskType),
      taskTypeIcon: getTaskTypeIcon(taskDefinition?.taskType),
      answerPreview: getTaskAnswerPreview(taskAnswer, taskDefinition),
      observationPreview: observationText,
      hasObservations: observationText !== '-',
      hasAudioRecord: !!taskDefinition?.hasAudioRecord,
      tipPressCount,
      hasTipAvailable,
      tipUsage:
        tipPressCount > 0
          ? `${tipPressCount} press${tipPressCount === 1 ? '' : 'es'}`
          : 'Not used',
      recordings: getTaskRecordings(taskAnswer, taskDefinition),
      completed,
      attempted,
      statusLabel: completed
        ? t('analytics.completed')
        : attempted
          ? t('analytics.notCompleted')
          : '-',
      statusColor: completed ? 'success' : attempted ? 'warning' : 'grey',
      timeSeconds: taskTimeSeconds,
      timeLabel: formatTime(taskTimeSeconds),
      rawTaskAnswer: taskAnswer,
    }
  })
})

const tableHeaders = computed(() => {
  const dynamicTaskHeaders = taskColumns.value.map((t, i) => ({
    title: `T${i + 1}`,
    key: `task_${i}`,
    sortable: false,
    align: 'center',
  }))
  return [
    { title: '#', key: 'identifier', sortable: false, width: 60 },
    { title: t('analytics.user'), key: 'user', sortable: false },
    { title: t('analytics.summary'), key: 'tasks', sortable: false },
    ...dynamicTaskHeaders,
    {
      title: t('analytics.invite'),
      key: 'invited',
      sortable: false,
      width: 90,
    },
    {
      title: t('analytics.actions'),
      key: 'actions',
      sortable: false,
      width: 150,
    },
  ]
})

const tableData = computed(() => {
  return filteredSessions.value.map((session, idx) => {
    const userTasks = testStructure.value?.userTasks || []
    let completedCount = 0
    let totalTimeSeconds = 0
    const row = {
      identifier: idx + 1,
      fullName: session.fullName || 'Sin nombre',
      email: session.email || '',
      invited: !!session.invited,
      hidden: !!session.hidden,
      userDocId: session.userDocId,
      tasks: session.tasks || {},
      preTestAnswer: session.preTestAnswer || [],
      postTestAnswer: session.postTestAnswer || [],
    }

    userTasks.forEach((_, i) => {
      const task =
        session.tasks?.[i] ||
        session.tasks?.[`${i}`] ||
        session.tasks?.[userTasks[i]?.taskId] ||
        {}
      const completed = !!task.completed
      const timeMs = task.taskTime || 0
      const timeSeconds = Math.floor(timeMs / 1000)
      if (completed) completedCount += 1
      totalTimeSeconds += timeSeconds
      row[`task_${i}`] = { completed, timeSeconds }
    })

    const totalTasks = userTasks.length || 0
    const effectiveness = totalTasks
      ? Math.round((completedCount / totalTasks) * 100)
      : 0
    const efficiency =
      totalTimeSeconds > 0
        ? (completedCount / (totalTimeSeconds / 60)).toFixed(2)
        : '0.00'

    return {
      ...row,
      completedCount,
      totalTasks,
      totalTimeSeconds,
      effectiveness,
      efficiency,
    }
  })
})

const openSessionAnalyticsDialog = () => {
  showSessionAnalyticsDialog.value = true
}

const selectTask = (selectedTaskIndex, openAnalytics = false) => {
  taskSelect.value = selectedTaskIndex

  if (openAnalytics) {
    openSessionAnalyticsDialog()
  }
}

const viewAnswers = (item) => {
  dialogItem.value = item
  showDialog.value = true
}

const showTaskDetails = (session) => {
  const tasksWithNames = {}
  const taskNames = testTasks.value
  Object.entries(session.tasks || {}).forEach(([key, task], index) => {
    tasksWithNames[key] = {
      ...task,
      taskName: taskNames[index],
    }
  })

  selectedUserSession.value = {
    ...session,
    tasks: tasksWithNames,
  }
  showTaskDetailsModal.value = true
}

const closeTaskDetailsModal = () => {
  showTaskDetailsModal.value = false
  selectedUserSession.value = null
}

const showFilters = ref(true)
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}
// Trigger search (re-computed automatically, but kept for explicit UX hook)
const triggerSearch = () => {
  /* no-op: computed already reacts; placeholder for future debounce */
}

watch(
  [testStructure, answers],
  ([structure, ans]) => {
    if (structure && Array.isArray(structure.userTasks)) {
      testTasks.value = structure.userTasks.map((task) => task.taskName)
    }

    if (ans && typeof ans === 'object') {
      taskAnswers.value = Object.values(ans)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.analytics-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dialog-body {
  background: #f5f7fa;
}

.section-col {
  margin-bottom: 24px;
}

.section-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px 20px;
}

.section-title {
  font-weight: 600;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.qa-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qa-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
}

.qa-question {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.qa-answer {
  font-size: 13px;
  color: #111827;
  word-break: break-word;
}

.task-detail {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  padding: 16px;
}

.media-video {
  max-width: 100%;
  width: 100%;
  border-radius: 8px;
  outline: none;
}

.gap-2 {
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}

.media-panels :deep(.v-expansion-panel-title) {
  font-size: 13px;
  font-weight: 500;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
}

:deep(.v-data-table) {
  background: white !important;
  border-radius: 12px !important;
}

:deep(.v-data-table__wrapper) {
  border-radius: 12px !important;
}

:deep(.v-data-table-header) {
  background: #f8fafc !important;
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: #374151 !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding: 16px !important;
}

:deep(.v-data-table__tr:hover) {
  background: #f8fafc !important;
}

:deep(.v-data-table__tr) {
  border-bottom: 1px solid #f1f5f9 !important;
}

:deep(.v-data-table__td) {
  padding: 12px 16px !important;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  line-height: 1.15;
  color: #475569;
}

.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(11px * 1.15 * 2);
  max-height: calc(11px * 1.15 * 2);
}

.filter-field :deep(.v-field__input) {
  min-height: 36px;
}

.flex-grow-1 {
  flex: 1 1 auto;
  min-width: 240px;
}

.button-bar {
  gap: 14px;
}

.search-btn {
  min-width: 140px;
  height: 40px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.task-row-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.table-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recording-chip-wrap {
  min-height: 28px;
}
</style>
