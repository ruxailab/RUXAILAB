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
                <v-list-item-title>Test detail</v-list-item-title>
              </v-list-item>
              <v-list-item
                prepend-icon="mdi-clipboard-list"
                @click="showTaskDetails(item)"
              >
                <v-list-item-title>Task Details</v-list-item-title>
              </v-list-item>
              <!--
              <v-list-item @click="toggleHideSession(item)" :prepend-icon="item.hidden ? 'mdi-eye' : 'mdi-eye-off'">
                <v-list-item-title>{{ item.hidden ? 'Show' : 'Hide' }}</v-list-item-title>
              </v-list-item>
              -->
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
        <v-toolbar color="orange" class="pl-3">
          <span class="text-h5">Test Details</span>
          <v-spacer />
          <v-btn icon @click="showDialog = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
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
                    Tasks
                    <span class="text-caption font-weight-regular ml-2"
                      >({{ testStructure.userTasks.length }})</span
                    >
                  </div>
                  <v-divider class="my-2" />
                  <div class="d-flex flex-wrap gap-2 mb-3">
                    <v-chip
                      v-for="(t, i) in testStructure.userTasks"
                      :key="'task-chip-' + i"
                      :color="taskSelect === i ? 'primary' : 'grey'"
                      variant="tonal"
                      size="small"
                      class="cursor-pointer"
                      @click="taskSelect = i"
                    >
                      {{ i + 1 }}. {{ t.taskName }}
                    </v-chip>
                  </div>

                  <div
                    v-if="dialogItem.tasks?.[taskSelect]"
                    class="task-detail"
                  >
                    <div class="mb-2 d-flex flex-wrap gap-2">
                      <v-chip
                        v-if="dialogItem.tasks[taskSelect].completed"
                        size="x-small"
                        color="success"
                        variant="tonal"
                      >
                        <v-icon size="14" start>mdi-check-circle</v-icon>
                        Completed
                      </v-chip>
                      <v-chip
                        v-else
                        size="x-small"
                        color="error"
                        variant="tonal"
                      >
                        <v-icon size="14" start>mdi-close-circle</v-icon> Not
                        Completed
                      </v-chip>
                      <v-chip
                        v-if="dialogItem.tasks[taskSelect].taskTime"
                        size="x-small"
                        color="info"
                        variant="tonal"
                      >
                        <v-icon size="14" start>mdi-timer-outline</v-icon>
                        {{
                          formatTime(
                            Math.floor(
                              (dialogItem.tasks[taskSelect].taskTime || 0) /
                                1000,
                            ),
                          )
                        }}
                      </v-chip>
                    </div>

                    <div
                      v-if="testStructure.userTasks?.[taskSelect]?.postQuestion"
                      class="mb-4"
                    >
                      <div class="qa-question mb-1">Post Question</div>
                      <div class="qa-answer">
                        {{ dialogItem.tasks[taskSelect].postAnswer || '-' }}
                      </div>
                    </div>

                    <!-- Media -->
                    <v-expansion-panels multiple class="media-panels">
                      <v-expansion-panel
                        v-if="
                          dialogItem.tasks[taskSelect].webcamRecordURL ||
                          dialogItem.tasks[taskSelect].irisTrackingData > 0
                        "
                        readonly
                        hide-actions
                        class="cursor-pointer"
                        @click.stop="openSessionAnalyticsDialog"
                      >
                        <v-expansion-panel-title>
                          Task Analytics
                        </v-expansion-panel-title>
                      </v-expansion-panel>

                      <v-expansion-panel
                        v-if="dialogItem.tasks[taskSelect].webcamRecordURL"
                      >
                        <v-expansion-panel-title expand-icon="mdi-chevron-down"
                          >Webcam Recording</v-expansion-panel-title
                        >
                        <v-expansion-panel-text>
                          <video
                            :src="dialogItem.tasks[taskSelect].webcamRecordURL"
                            controls
                            class="media-video"
                            aria-label="Webcam recording"
                          >
                            <track
                              v-if="
                                dialogItem.tasks[taskSelect].webcamCaptionsURL
                              "
                              kind="captions"
                              srclang="en"
                              label="English"
                              :src="
                                dialogItem.tasks[taskSelect].webcamCaptionsURL
                              "
                            />
                          </video>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                      <v-expansion-panel
                        v-if="dialogItem.tasks[taskSelect].screenRecordURL"
                      >
                        <v-expansion-panel-title expand-icon="mdi-chevron-down"
                          >Screen Recording</v-expansion-panel-title
                        >
                        <v-expansion-panel-text>
                          <video
                            :src="dialogItem.tasks[taskSelect].screenRecordURL"
                            controls
                            class="media-video"
                            aria-label="Screen recording"
                          >
                            <track
                              v-if="
                                dialogItem.tasks[taskSelect].screenCaptionsURL
                              "
                              kind="captions"
                              srclang="en"
                              label="English"
                              :src="
                                dialogItem.tasks[taskSelect].screenCaptionsURL
                              "
                            />
                          </video>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                      <v-expansion-panel
                        v-if="dialogItem.tasks[taskSelect].audioRecordURL"
                      >
                        <v-expansion-panel-title expand-icon="mdi-chevron-down"
                          >Audio Recording</v-expansion-panel-title
                        >
                        <v-expansion-panel-text>
                          <audio
                            :src="dialogItem.tasks[taskSelect].audioRecordURL"
                            controls
                            class="w-100"
                          />
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                    <!-- Diálogo que chama o componente em tela cheia -->
                    <v-dialog v-model="showSessionAnalytics" fullscreen>
                      <SessionAnalytics
                        :tasks="dialogItem.tasks"
                        :task-select="taskSelect"
                        @close="showSessionAnalytics = false"
                      />
                    </v-dialog>
                    <SessionAnalyticsDialog
                      v-model="showSessionAnalyticsDialog"
                      :user-id="dialogItem.userDocId"
                      :task-answer="dialogItem.tasks[taskSelect]"
                      :selected-task="taskSelect"
                      :test-answer="answers[dialogItem.userDocId]"
                      :from-eye-tracking="true"
                    />
                  </div>
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
import SessionAnalytics from '../SessionAnalytics.vue'
import SessionAnalyticsDialog from '../dialogs/SessionAnalyticsDialog.vue'
import { useI18n } from 'vue-i18n'
import { useFilterDefinitions } from './useFilterDefinitions'

const { t } = useI18n()

const store = useStore()
const testStructure = computed(() => store.state.Tests.Test.testStructure || {})
const answers = computed(() => store.getters.visibleUserAnswers || {})

const showDialog = ref(false)
const dialogItem = ref(null)
const taskSelect = ref(0)
const testTasks = ref([])
const taskAnswers = ref([])
const showTaskDetailsModal = ref(false)
const selectedUserSession = ref(null)
const showSessionAnalytics = ref(false)
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
</style>
