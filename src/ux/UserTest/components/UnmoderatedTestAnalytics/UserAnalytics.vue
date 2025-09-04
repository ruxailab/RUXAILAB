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
          placeholder="Buscar por nombre o email"
          class="flex-grow-1"
        />
        <v-btn
          color="primary"
          class="search-btn"
          prepend-icon="mdi-magnify"
          @click="triggerSearch"
        >
          Buscar
        </v-btn>
        <v-btn
          color="primary"
          class="search-btn"
          prepend-icon="mdi-filter-remove"
          :disabled="!hasActiveFilters"
          @click="resetFilters"
        >
          Reset
        </v-btn>

        <v-btn
          :color="showFilters ? 'primary' : 'grey'"
          variant="tonal"
          icon
          size="small"
          :title="showFilters ? 'Ocultar filtros' : 'Mostrar filtros'"
          @click="toggleFilters"
        >
          <v-icon>{{ showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant' }}</v-icon>
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
              <v-tooltip
                v-if="(def.title || '').length > 42"
                location="top"
              >
                <template #activator="{ props }">
                  <div
                    class="filter-label truncate-2"
                    v-bind="props"
                  >
                    {{ def.title }}
                  </div>
                </template>
                <span class="text-wrap">{{ def.title }}</span>
              </v-tooltip>
              <div
                v-else
                class="filter-label truncate-2"
              >
                {{ def.title }}
              </div>
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
                @update:model-value="val => onFilterChange(def.index, val)"
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
                @update:model-value="onFreeTextFilter(def.index)"
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
            <v-avatar
              size="32"
              class="mr-3"
              color="primary"
            >
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
              :prepend-icon="item[`task_${i}`]?.completed ? 'mdi-check-circle' : 'mdi-close-circle'"
            >
              {{ item[`task_${i}`]?.completed ? 'Completed' : 'Not Completed' }}
            </v-chip>
            <span
              class="text-caption"
              :class="{ 'text-grey-500': !item[`task_${i}`]?.timeSeconds }"
            >
              Time taken: {{ item[`task_${i}`]?.timeSeconds ? formatTime(item[`task_${i}`].timeSeconds) : '-' }}
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
                  Eficacia: {{ item.effectiveness }}%
                </v-chip>
                <v-chip
                  size="x-small"
                  color="secondary"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  Eficiencia: {{ item.efficiency }} t/min
                </v-chip>
              </div>
              <div class="text-caption text-grey-600">
                ({{ item.completedCount }}/{{ item.totalTasks }} tareas · {{ formatTime(item.totalTimeSeconds) }} total)
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
            {{ item.invited ? 'Yes' : 'No' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-menu
            location="bottom end"
            transition="fade-transition"
          >
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
            <v-list
              density="compact"
              class="py-0"
            >
              <v-list-item
                prepend-icon="mdi-eye"
                @click="viewAnswers(item)"
              >
                <v-list-item-title>Test detail</v-list-item-title>
              </v-list-item>
              <v-list-item
                prepend-icon="mdi-clipboard-list"
                @click="showTaskDetails(item)"
              >
                <v-list-item-title>Task Details</v-list-item-title>
              </v-list-item>
              <v-list-item
                :prepend-icon="item.hidden ? 'mdi-eye' : 'mdi-eye-off'"
                @click="toggleHideSession(item)"
              >
                <v-list-item-title>{{ item.hidden ? 'Show' : 'Hide' }}</v-list-item-title>
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
        <v-toolbar
          color="orange"
          class="pl-3"
        >
          <span class="text-h5">Test Details</span>
          <v-spacer />
          <v-btn
            icon
            @click="showDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="dialog-body">
          <v-container
            fluid
            class="py-0"
          >
            <v-row v-if="dialogItem">
              <!-- User Header -->
              <v-col
                cols="12"
                class="pb-0"
              >
                <div class="d-flex align-center mb-4 user-header">
                  <v-avatar
                    size="48"
                    color="primary"
                    class="mr-3"
                  >
                    <span class="text-white text-subtitle-1 font-weight-bold">{{ dialogItem.fullName?.[0]?.toUpperCase()
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
                  <div class="section-title">
                    Pre-Test
                  </div>
                  <v-divider class="my-2" />
                  <div class="qa-grid">
                    <div
                      v-for="(q, i) in testStructure.preTest"
                      :key="'pre-' + i"
                      class="qa-row"
                    >
                      <div class="qa-question">
                        {{ q.title }}
                      </div>
                      <div class="qa-answer">
                        <v-chip
                          v-if="q.type === 'selection'"
                          size="x-small"
                          color="primary"
                          variant="tonal"
                        >
                          {{
                            dialogItem.preTestAnswer?.[i]?.answer || '-' }}
                        </v-chip>
                        <span v-else>{{ dialogItem.preTestAnswer?.[i]?.answer || '-' }}</span>
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
                  <div class="section-title">
                    Post-Test
                  </div>

                  <v-divider class="my-2" />

                  <div class="qa-grid">
                    <div
                      v-for="(q, i) in testStructure.postTest"
                      :key="'post-' + i"
                      class="qa-row"
                    >
                      <div class="qa-question">
                        {{ q.title }}
                      </div>
                      <div class="qa-answer">
                        <v-chip
                          v-if="q.type === 'selection'"
                          size="x-small"
                          color="secondary"
                          variant="tonal"
                        >
                          {{
                            dialogItem.postTestAnswer?.[i]?.answer || '-' }}
                        </v-chip>
                        <span v-else>{{ dialogItem.postTestAnswer?.[i]?.answer || '-' }}</span>
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
                    <span class="text-caption font-weight-regular ml-2">({{ testStructure.userTasks.length }})</span>
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
                        <v-icon
                          size="14"
                          start
                        >
                          mdi-check-circle
                        </v-icon> Completed
                      </v-chip>

                      <v-chip
                        v-else
                        size="x-small"
                        color="error"
                        variant="tonal"
                      >
                        <v-icon
                          size="14"
                          start
                        >
                          mdi-close-circle
                        </v-icon> Not Completed
                      </v-chip>

                      <v-chip
                        v-if="dialogItem.tasks[taskSelect].taskTime"
                        size="x-small"
                        color="info"
                        variant="tonal"
                      >
                        <v-icon
                          size="14"
                          start
                        >
                          mdi-timer-outline
                        </v-icon>
                        {{ formatTime(Math.floor((dialogItem.tasks[taskSelect].taskTime || 0) / 1000)) }}
                      </v-chip>
                    </div>

                    <div
                      v-if="testStructure.userTasks?.[taskSelect]?.postQuestion"
                      class="mb-4"
                    >
                      <div class="qa-question mb-1">
                        Post Question
                      </div>
                      <div class="qa-answer">
                        {{ dialogItem.tasks[taskSelect].postAnswer || '-' }}
                      </div>
                    </div>

                    <!-- Media -->
                    <v-expansion-panels
                      multiple
                      class="media-panels"
                    >
                      <v-expansion-panel v-if="dialogItem.tasks[taskSelect].webcamRecordURL">
                        <v-expansion-panel-title expand-icon="mdi-chevron-down">
                          Webcam
                          Recording
                        </v-expansion-panel-title>

                        <v-expansion-panel-text>
                          <video
                            :src="dialogItem.tasks[taskSelect].webcamRecordURL"
                            controls
                            class="media-video"
                            aria-label="Webcam recording"
                          >
                            <track
                              v-if="dialogItem.tasks[taskSelect].webcamCaptionsURL"
                              kind="captions"
                              srclang="en"
                              label="English"
                              :src="dialogItem.tasks[taskSelect].webcamCaptionsURL"
                            >
                          </video>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel v-if="dialogItem.tasks[taskSelect].screenRecordURL">
                        <v-expansion-panel-title expand-icon="mdi-chevron-down">
                          Screen
                          Recording
                        </v-expansion-panel-title>

                        <v-expansion-panel-text>
                          <video
                            :src="dialogItem.tasks[taskSelect].screenRecordURL"
                            controls
                            class="media-video"
                            aria-label="Screen recording"
                          >
                            <track
                              v-if="dialogItem.tasks[taskSelect].screenCaptionsURL"
                              kind="captions"
                              srclang="en"
                              label="English"
                              :src="dialogItem.tasks[taskSelect].screenCaptionsURL"
                            >
                          </video>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <v-expansion-panel v-if="dialogItem.tasks[taskSelect].audioRecordURL">
                        <v-expansion-panel-title expand-icon="mdi-chevron-down">
                          Audio
                          Recording
                        </v-expansion-panel-title>

                        <v-expansion-panel-text>
                          <audio
                            :src="dialogItem.tasks[taskSelect].audioRecordURL"
                            controls
                            class="w-100"
                          />
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
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
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import TaskDetailsModal from '@/ux/UserTest/components/UnmoderatedTestAnalytics/TaskDetailsModal.vue';
import { useToast } from 'vue-toastification';
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer';

const toast = useToast()

const store = useStore();
const showDialog = ref(false);
const dialogItem = ref(null);
const taskSelect = ref(0);
const testTasks = ref([]);
const taskAnswers = ref([]);
const showTaskDetailsModal = ref(false)
const selectedUserSession = ref(null)

const dataHeaders = [
  { title: 'Identifier', key: 'identifier', sortable: true, width: '120px' },
  { title: 'User', key: 'user', sortable: true },
  { title: 'Tasks', key: 'tasks', sortable: false, width: '280px' },
  { title: 'Invited', key: 'invited', sortable: true, width: '100px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '300px' },
];

const test = computed(() => store.getters.test);
const testStructure = computed(() => store.state.Tests.Test.testStructure);
const answers = computed(() => store.getters.visibleUserAnswers || {});
// const answers = computed(() => store.getters.testAnswerDocument?.taskAnswers || {});
const tableData = computed(() => Object.values(answers.value).map((item, index) => {
  const tasks = Object.values(item.tasks || {});
  const completedCount = tasks.filter(t => !!t.completed).length;
  const totalTasks = testStructure.value.userTasks.length;
  const avgTime = tasks.reduce((sum, t) => sum + (t.taskTime || 0), 0) / (completedCount || 1);
  return {
    ...item,
    identifier: `#${index + 1}`,
    completedCount,
    totalTasks,
    avgTimeSeconds: Math.floor(avgTime / 1000),
  };
}));

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const viewAnswers = (item) => {
  dialogItem.value = item;
  showDialog.value = true;
};

const showTaskDetails = (session) => {
  const tasksWithNames = {}
  const taskNames = testTasks.value
  Object.entries(session.tasks || {}).forEach(([key, task], index) => {
    tasksWithNames[key] = {
      ...task,
      taskName: taskNames[index]
    }
  })

  selectedUserSession.value = {
    ...session,
    tasks: tasksWithNames,
  };
  showTaskDetailsModal.value = true
}

const closeTaskDetailsModal = () => {
  showTaskDetailsModal.value = false
  selectedUserSession.value = null
}

const toggleHideSession = async (item) => {
  const payload = Object.values(answers.value).find(s => s.userDocId === item.userDocId);

  console.log(payload)
  if (!payload) {
    console.error("Session not found for userDocId:", item.userDocId);
    return;
  }

  try {
    await store.dispatch('updateTaskAnswer', {
      payload: new UserStudyEvaluatorAnswer({
        ...payload,
        tasks: { ...payload.tasks },
        hidden: !item.hidden,
      }),
      answerDocId: test.value.answersDocId,
    });
    toast.success("User made hidden successfull")
  } catch (error) {
    console.error('Error saving answer:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to save the answer. Please try again.' });
    toast.error("Unable to hide user!!")
  }
};

watch(
  [testStructure, answers],
  ([structure, ans]) => {
    if (structure && Array.isArray(structure.userTasks)) {
      testTasks.value = structure.userTasks.map((task) => task.taskName);
    }

    if (ans && typeof ans === 'object') {
      taskAnswers.value = Object.values(ans);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.analytics-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
}

.gap-2 {
  gap: 8px;
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
  background: #F8FAFC !important;
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: #374151 !important;
  border-bottom: 1px solid #E5E7EB !important;
  padding: 16px !important;
}

:deep(.v-data-table__tr:hover) {
  background: #F8FAFC !important;
}

:deep(.v-data-table__tr) {
  border-bottom: 1px solid #F1F5F9 !important;
}

:deep(.v-data-table__td) {
  padding: 12px 16px !important;
}
</style>
