<template>
  <div class="analytics-dashboard">
    <v-container
      fluid
      class="pa-6"
    >
      <!-- Header Section -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-800 mb-2">
          Analytics Dashboard
        </h1>
        <p class="text-body-1 text-grey-600">
          User sessions and task completion overview
        </p>
      </div>

      <!-- Main Data Table -->
      <v-card class="elevation-2 overflow-hidden">
        <v-data-table
          :headers="dataHeaders"
          :items="tableData"
          :items-per-page="10"
          class="elevation-0"
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

          <template #item.tasks="{ item }">
            <div class="py-2">
              <div class="d-flex align-center mb-2">
                <v-icon
                  size="16"
                  color="success"
                  class="mr-1"
                >
                  mdi-check-circle
                </v-icon>
                <span class="font-weight-medium mr-3">{{ item.completedCount }}/{{ item.totalTasks }}</span>
                <v-icon
                  size="16"
                  color="primary"
                  class="mr-1"
                >
                  mdi-timer-outline
                </v-icon>
                <span class="text-body-2 text-grey-600">{{ formatTime(item.avgTimeSeconds) }} avg</span>
              </div>
              <v-btn
                color="accent"
                variant="tonal"
                size="small"
                prepend-icon="mdi-clipboard-list"
                class="font-weight-medium"
                @click="showTaskDetails(item)"
              >
                Task Details
              </v-btn>
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
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-eye"
                class="font-weight-medium"
                @click="viewAnswers(item)"
              >
                View Detail
              </v-btn>
              <v-btn
                :color="item.hidden ? 'warning' : 'secondary'"
                variant="tonal"
                size="small"
                :prepend-icon="item.hidden ? 'mdi-eye' : 'mdi-eye-off'"
                class="font-weight-medium"
                @click="toggleHideSession(item.id)"
              >
                {{ item.hidden ? 'Show' : 'Hide' }}
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Modal (Restored from Original Design) -->
      <v-dialog
        v-model="showDialog"
        max-width="600"
        fullscreen
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar
            color="orange"
            class="pl-3"
          >
            <span class="text-h5">Test Details</span>
            <v-btn
              class="ml-auto"
              icon
              @click="showDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text style="background-color: #E8EAF2;">
            <v-row v-if="dialogItem">
              <v-col
                v-if="dialogItem.preTestAnswer.length"
                cols="12"
                class="pt-8"
              >
                <span class="cardsTitle ma-3">Variables</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <span
                      v-for="(q, i) in testStructure.preTest"
                      :key="i"
                      class="ma-1 text-subtitle-1"
                    >
                      <strong>{{ q.title }}</strong> : {{ dialogItem.preTestAnswer[i].answer }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="dialogItem.postTestAnswer.length"
                cols="12"
                class="pt-8"
              >
                <span class="cardsTitle ma-3">Post-Test Answer</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <span
                      v-for="(q, i) in testStructure.postTest"
                      :key="i"
                      class="ma-1 text-subtitle-1"
                    >
                      <strong>{{ q.title }}</strong> : {{ dialogItem.postTestAnswer[i].answer }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="dialogItem.tasks[taskSelect].postAnswer"
                cols="12"
                class="mt-4"
              >
                <span class="cardsTitle ma-3">Post Question</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <strong>{{ testStructure.userTasks[taskSelect].postQuestion }}</strong> :
                    <span>{{ dialogItem.tasks[taskSelect].postAnswer }}</span>
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="dialogItem.tasks[taskSelect].webcamRecordURL"
                cols="12"
                class="d-flex align-center justify-center flex-column"
              >
                <span class="cardsTitle ma-3">Web Cam Record</span>
                <video
                  class="my-3"
                  :src="dialogItem.tasks[taskSelect].webcamRecordURL"
                  controls
                  height="260"
                />
              </v-col>
              <v-col
                v-if="dialogItem.tasks[taskSelect].screenRecordURL"
                cols="12"
                class="d-flex align-center justify-center flex-column"
              >
                <span class="cardsTitle ma-3">Screen Record</span>
                <video
                  class="my-3"
                  :src="dialogItem.tasks[taskSelect].screenRecordURL"
                  controls
                  height="260"
                />
              </v-col>
              <v-col
                v-if="dialogItem.tasks[taskSelect].audioRecordURL"
                cols="12"
                class="d-flex align-center justify-center flex-column"
              >
                <span class="cardsTitle ma-3">Audio Record</span>
                <audio
                  class="mx-auto my-3"
                  :src="dialogItem.tasks[taskSelect].audioRecordURL"
                  controls
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>

      <TaskDetailsModal
        v-model="showTaskDetailsModal"
        :user-session="selectedUserSession"
        @close="closeTaskDetailsModal"
      />
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import TaskDetailsModal from '../atoms/TaskDetailsModal.vue';

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

const testStructure = computed(() => store.state.Tests.Test.testStructure);
const answers = computed(() => store.getters.testAnswerDocument?.taskAnswers || {});
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

const toggleHideSession = (id) => console.log('Toggle hide session', id);

onMounted(() => {
  testStructure.value.userTasks.forEach((task, i) => {
    testTasks.value[i] = task.taskName;
  });
  taskAnswers.value = Object.values(answers.value);
});
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
