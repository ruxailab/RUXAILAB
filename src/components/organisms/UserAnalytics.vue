<template>
  <div v-if="answers" class="analytics-dashboard">
    <v-container fluid class="pa-6">
      <!-- Header Section -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-bold text-grey-800 mb-2">
          Analytics Dashboard
        </h1>
        <p class="text-body-1 text-grey-600">
          Select a task to view participant details and answers
        </p>
      </div>

      <!-- Main Table Layout -->
      <v-card class="elevation-2 overflow-hidden" rounded='xl'>
        <div class="d-flex" style="min-height: 600px;">
          <!-- Tasks List -->
          <div class="tasks-sidebar">
            <div class="sidebar-header pa-4 bg-grey-50">
              <h3 class="text-h6 font-weight-bold text-grey-800">Tasks</h3>
              <p class="text-body-2 text-grey-600 mb-0">{{ testTasks.length }} total</p>
            </div>
            <v-divider />
            <div class="tasks-list">
              <div
                v-for="(taskName, index) in testTasks"
                :key="index"
                class="task-item pa-4 cursor-pointer d-flex align-center justify-space-between"
                :class="{ 'active': taskSelect === index }"
                @click="taskSelect = index"
              >
                <div class="flex-grow-1">
                  <div class="font-weight-medium text-grey-800 mb-1">
                    {{ taskName }}
                  </div>
                  <div class="text-body-2 text-grey-600">
                    {{ taskAnswers.filter(t => t.taskName === taskName).length }} participant(s)
                  </div>
                </div>
                <v-icon 
                  v-if="taskSelect === index"
                  color="primary"
                  size="20"
                >
                  mdi-chevron-right
                </v-icon>
              </div>
            </div>
          </div>

          <v-divider vertical />

          <!-- Participants Table -->
          <div class="participants-section flex-grow-1">
            <div class="section-header pa-4 bg-grey-50">
              <h3 class="text-h6 font-weight-bold text-grey-800">
                {{ testTasks[taskSelect] || 'Select a Task' }}
              </h3>
              <p class="text-body-2 text-grey-600 mb-0">
                {{ filteredParticipants.length }} participant(s)
              </p>
            </div>
            <v-divider />

            <div v-if="filteredParticipants.length" class="participants-table">
              <v-data-table
                :headers="dataHeaders"
                :items="filteredParticipants"
                class="elevation-0"
                hide-default-footer
              >
                <template #item.userDocId="{ item }">
                  <span>{{ item.fullName }}</span>
                </template>
                <template #item.actions="{ item }">
                  <v-btn
                    color="accent"
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-eye"
                    @click="viewAnswers(item)"
                  >
                    Show Answers
                  </v-btn>
                </template>
              </v-data-table>

              <div class="pa-4 bg-grey-50 d-flex justify-end text-body-2 text-grey-600">
                Showing {{ filteredParticipants.length }} of {{ filteredParticipants.length }} participants
              </div>
            </div>

            <div v-else class="empty-state pa-8 text-center">
              <v-icon size="64" color="grey-400" class="mb-4">mdi-account-search</v-icon>
              <h3 class="text-h6 text-grey-600 mb-2">No participants found</h3>
              <p class="text-body-2 text-grey-500">
                No participants have attempted this task yet.
              </p>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Modal -->
      <v-dialog
        v-model="showDialog"
        max-width="600"
        fullscreen
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar color="orange" class="pl-3">
            <span class="text-h5">Answer and Observation</span>
            <v-btn class="ml-auto" icon @click="showDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text style="background-color: #E8EAF2;">
            <v-row v-if="dialogItem">
              <v-col
                v-if="dialogItem.preTestAnswer.length"
                :cols="dialogItem.tasks[taskSelect].taskTime ? '10' : '12'"
                class="pt-8"
              >
                <span class="cardsTitle ma-3">Variables</span>
                <v-card border rounded="xl">
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
                v-if="dialogItem.tasks[taskSelect].taskTime"
                cols="2"
                class="pt-8"
              >
                <span class="text-h6 font-weight-bold">Task Time</span>
                <v-card border rounded="xl">
                  <div class="ma-6">
                    <p class="text-h6">{{ formatTime(dialogItem.tasks[taskSelect].taskTime) }}</p>
                  </div>
                </v-card>
              </v-col>
              <v-col v-if="dialogItem.postTestAnswer.length" cols="12" class="pt-8">
                <span class="cardsTitle ma-3">Post-Test Answer</span>
                <v-card border rounded="xl">
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
              <v-col v-if="dialogItem.tasks[taskSelect].taskAnswer" :cols="dialogItem.tasks[taskSelect].taskObservations ? '6' : '12'" class="mt-4">
                <span class="cardsTitle ma-3">Answer</span>
                <v-card border rounded="xl">
                  <div class="ma-6">
                    <span>{{ dialogItem.tasks[taskSelect].taskAnswer }}</span>
                  </div>
                </v-card>
              </v-col>
              <v-col v-if="dialogItem.tasks[taskSelect].postAnswer" cols="12" class="mt-4">
                <span class="cardsTitle ma-3">Post Question</span>
                <v-card border rounded="xl">
                  <div class="ma-6">
                    <strong>{{ testStructure.userTasks[taskSelect].postQuestion }}</strong> :
                    <span>{{ dialogItem.tasks[taskSelect].postAnswer }}</span>
                  </div>
                </v-card>
              </v-col>
              <v-col v-if="dialogItem.tasks[taskSelect].taskObservations" :cols="dialogItem.tasks[taskSelect].taskAnswer ? '6' : '12'" class="mt-4">
                <span class="cardsTitle ma-3">Observation</span>
                <v-card border rounded="xl">
                  <div class="ma-6">
                    <span>{{ dialogItem.tasks[taskSelect].taskObservations }}</span>
                  </div>
                </v-card>
              </v-col>
              <v-col v-if="dialogItem.tasks[taskSelect].webcamRecordURL" cols="12" class="d-flex align-center justify-center flex-column">
                <span class="cardsTitle ma-3">Web Cam Record</span>
                <video class="my-3" :src="dialogItem.tasks[taskSelect].webcamRecordURL" controls height="260" />
              </v-col>
              <v-col v-if="dialogItem.tasks[taskSelect].screenRecordURL" cols="12" class="d-flex align-center justify-center flex-column">
                <span class="cardsTitle ma-3">Screen Record</span>
                <video class="my-3" :src="dialogItem.tasks[taskSelect].screenRecordURL" controls height="260" />
              </v-col>
              <v-col v-if="dialogItem.tasks[taskSelect].audioRecordURL" cols="12" class="d-flex align-center justify-center flex-column">
                <span class="cardsTitle ma-3">Audio Record</span>
                <audio class="mx-auto my-3" :src="dialogItem.tasks[taskSelect].audioRecordURL" controls />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const showDialog = ref(false);
const dialogItem = ref(null);
const taskSelect = ref(0);
const testTasks = ref([]);
const taskAnswers = ref([]);

const dataHeaders = ref([
  { title: 'Full Name', value: 'userDocId', sortable: true},
  { title: 'Actions', value: 'actions', width: '160px'},
]);

const testStructure = computed(() => store.state.Tests.Test.testStructure);
const answers = computed(() => store.getters.testAnswerDocument?.taskAnswers || []);
const filteredParticipants = computed(() => taskAnswers.value.filter((_, i) => true));

const formatTime = (time) => {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const viewAnswers = (item) => {
  dialogItem.value = item;
  showDialog.value = true;
};

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

.tasks-sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #E5E7EB;
}

.sidebar-header,
.section-header {
  border-bottom: 1px solid #E5E7EB;
}

.tasks-list {
  max-height: calc(600px - 80px);
  overflow-y: auto;
}

.task-item {
  border-bottom: 1px solid #F1F5F9;
  transition: all 0.2s ease;
}

.task-item:hover {
  background-color: #F8FAFC;
}

.task-item.active {
  background-color: #EBF4FF;
  border-right: 3px solid var(--v-theme-primary);
}

.task-item:last-child {
  border-bottom: none;
}

.participants-section {
  background: white;
}

.participants-table {
  max-height: calc(600px - 80px);
  overflow-y: auto;
}

.empty-state {
  height: calc(600px - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cursor-pointer {
  cursor: pointer;
}

/* Custom scrollbar */
.tasks-list::-webkit-scrollbar,
.participants-table::-webkit-scrollbar {
  width: 6px;
}

.tasks-list::-webkit-scrollbar-track,
.participants-table::-webkit-scrollbar-track {
  background: #F1F5F9;
}

.tasks-list::-webkit-scrollbar-thumb,
.participants-table::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}

.tasks-list::-webkit-scrollbar-thumb:hover,
.participants-table::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

/* Data table customization */
:deep(.v-data-table) {
  background: transparent !important;
}

:deep(.v-data-table__wrapper) {
  border-radius: 0 !important;
}

:deep(.v-data-table-header) {
  background: #F8FAFC !important;
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: #374151 !important;
  border-bottom: 1px solid #E5E7EB !important;
}

:deep(.v-data-table__tr:hover) {
  background: #F8FAFC !important;
}

:deep(.v-data-table__tr) {
  border-bottom: 1px solid #F1F5F9 !important;
}
</style>