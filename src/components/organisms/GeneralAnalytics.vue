<template>
  <v-container
    fluid
    class="pa-8 bg-background min-h-screen"
  >
    <v-row class="mb-8">
      <v-col
        cols="12"
        lg="6"
      >
        <v-card class="pa-8 elevation-4 rounded-xl h-100 conclusion-card">
          <div class="d-flex justify-space-between align-start mb-6">
            <div>
              <div class="d-flex align-center mb-3">
                <v-icon
                  color="primary"
                  size="28"
                  class="me-3"
                >
                  mdi-target
                </v-icon>
                <h3 class="text-h5 font-weight-medium text-on-surface">
                  Conclusion Rate
                </h3>
              </div>
              <div class="text-h2 font-weight-bold text-primary mb-2">
                {{ parseFloat(getConclusionAverage()).toFixed(2) }}%
              </div>
              <p class="text-body-1 text-medium-emphasis">
                Perfect completion rate achieved
              </p>
            </div>
            <div class="text-end">
              <v-chip
                color="success"
                variant="flat"
                size="small"
                class="mb-2"
              >
                <v-icon
                  start
                  size="16"
                >
                  mdi-trending-up
                </v-icon>
                Max {{ parseFloat(maxProgressPerTask()).toFixed(2) }}%
              </v-chip>
              <br>
              <v-chip
                color="error"
                variant="flat"
                size="small"
              >
                <v-icon
                  start
                  size="16"
                >
                  mdi-trending-down
                </v-icon>
                Min {{ parseFloat(minProgressPerTask()).toFixed(2) }}%
              </v-chip>
            </div>
          </div>

          <v-progress-linear
            :model-value="getConclusionAverage()"
            color="primary"
            height="12"
            rounded
            class="mb-6 progress-glow"
          />

          <v-divider class="mb-6" />

          <div class="d-flex justify-space-between">
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-secondary mb-1">
                {{ getTestsInProgress().totalInProgress }}
              </div>
              <p class="text-body-2 text-medium-emphasis">
                Tests in Progress
              </p>
            </div>
            <v-divider
              vertical
              class="mx-4"
            />
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-accent mb-1">
                16m
              </div>
              <p class="text-body-2 text-medium-emphasis">
                Total Duration
              </p>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        lg="6"
      >
        <v-row class="h-100">
          <v-col cols="6">
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar
                  color="primary"
                  size="48"
                  class="me-3"
                >
                  <v-icon
                    color="white"
                    size="24"
                  >
                    mdi-clock-fast
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold text-primary">
                    {{ calculateAverageTime().formatedTime }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Avg Time/Task
                  </p>
                </div>
              </div>
              <p class="text-caption text-medium-emphasis">
                Efficient task completion rate
              </p>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar
                  color="error"
                  size="48"
                  class="me-3"
                >
                  <v-icon
                    color="white"
                    size="24"
                  >
                    mdi-timer-alert
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold text-error">
                    {{ findLongestTask().averageTime.formatedTime }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Longest Task
                  </p>
                </div>
              </div>
              <p class="text-caption text-medium-emphasis">
                Task: <strong>"{{ findLongestTask().taskName }}"</strong>
              </p>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar
                  color="success"
                  size="48"
                  class="me-3"
                >
                  <v-icon
                    color="white"
                    size="24"
                  >
                    mdi-check-circle
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold text-success">
                    {{ getTotalAnswers() }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Total Answers
                  </p>
                </div>
              </div>
              <div class="d-flex align-center">
                <v-icon
                  color="success"
                  size="16"
                  class="me-1"
                >
                  mdi-trending-up
                </v-icon>
                <span class="text-caption text-success">+{{ getTasksTodayCount() }}/day</span>
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar
                  color="accent"
                  size="48"
                  class="me-3"
                >
                  <v-icon
                    color="white"
                    size="24"
                  >
                    mdi-account-circle
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-1 font-weight-bold text-accent">
                    Evaluator
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Latest User
                  </p>
                </div>
              </div>
              <p class="text-caption text-medium-emphasis">
                {{ getFormattedDate(getLatestResponse().lastUpdate) }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-8 elevation-4 rounded-xl chart-card">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
                Answers Timeline
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                Track your answer submissions over time
              </p>
            </div>
            <div class="d-flex ga-2">
              <v-btn
                variant="outlined"
                size="small"
                color="primary"
              >
                <v-icon start>
                  mdi-download
                </v-icon>
                Export
              </v-btn>
              <v-btn
                variant="flat"
                size="small"
                color="primary"
              >
                <v-icon start>
                  mdi-refresh
                </v-icon>
                Refresh
              </v-btn>
            </div>
          </div>

          <div class="chart-container-large">
            <DateChart :task-answers="taskAnswers" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import DateChart from '../atoms/DateChart.vue';

const store = useStore();

const emit = defineEmits(['goToCoops']);

const showDialog = ref(false);
const dialogItem = ref(null);
const search = ref('');
const taskSelect = ref(0);
const testTasks = ref([]);
const taskAnswers = ref([]);
const intro = ref(null);
const dataHeaders = ref([
  {
    title: 'Email',
    value: 'userDocId',
  },
  {
    title: 'Actions',
    sortable: false,
    value: 'actions',
  },
]);

const test = computed(() => store.getters.test);
const testStructure = computed(() => store.state.Tests.Test.testStructure);
const answers = computed(() => {
  if (!store.getters.visibleUserAnswers) {
    return [];
  }
  return store.getters.visibleUserAnswers;
});
const loading = computed(() => !Object.values(answers.value).length);
const averageTimePerTask = computed(() => {
  let totalTasks = 0;
  let totalTaskTime = 0;

  if (!taskAnswers.value.length) return 0;

  taskAnswers.value.forEach((answer) => {
    Object.values(answer.tasks).forEach((task) => {
      totalTaskTime += task.taskTime;
      totalTasks++;
    });
  });

  return totalTasks === 0 ? 0 : totalTaskTime / totalTasks;
});

const formatTime = (time) => {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return {
    formatedTime: `${minutes} min ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} s`,
    seconds: remainingSeconds,
    minutes: minutes,
  };
};

const findLongestTask = () => {
  if (!taskAnswers.value.length) return { taskName: 'Task', averageTime: formatTime(0) };

  const taskAverages = {};

  taskAnswers.value.forEach((answer) => {
    for (const taskId in answer.tasks) {
      const taskTime = answer.tasks[taskId].taskTime;

      if (!taskAverages[taskId]) {
        taskAverages[taskId] = {
          totalTime: taskTime,
          count: 1,
        };
      } else {
        taskAverages[taskId].totalTime += taskTime;
        taskAverages[taskId].count++;
      }
    }
  });

  for (const taskId in taskAverages) {
    const averageTime = taskAverages[taskId].totalTime / taskAverages[taskId].count;
    taskAverages[taskId].averageTime = averageTime;
  }

  let longestTask = null;
  let longestAverageTime = 0;

  for (const taskId in taskAverages) {
    if (taskAverages[taskId].averageTime > longestAverageTime) {
      longestAverageTime = taskAverages[taskId].averageTime;
      longestTask = taskId;
    }
  }

  return {
    taskName: testStructure.value.userTasks[longestTask]?.taskName || 'Task',
    averageTime: formatTime(longestAverageTime),
  };
};

const calculateAverageTime = () => {
  return formatTime(averageTimePerTask.value);
};

const getConclusionAverage = () => {
  if (!taskAnswers.value.length) return 0;

  let eachConclusion = 0;
  let totalAnswers = 0;
  taskAnswers.value.forEach((answer) => {
    eachConclusion += answer.progress;
    totalAnswers++;
  });
  return eachConclusion / totalAnswers;
};

const getTestsInProgress = () => {
  if (!taskAnswers.value.length) return { totalInProgress: 0, totalCompleted: 0 };

  let totalProgress = 0;
  let totalCompleted = 0;
  taskAnswers.value.forEach((answer) => {
    if (answer.submitted) {
      totalCompleted++;
    } else {
      totalProgress++;
    }
  });
  return {
    totalInProgress: totalProgress,
    totalCompleted: totalCompleted,
  };
};

const maxProgressPerTask = () => {
  if (!taskAnswers.value.length) return 0;

  const progressArray = taskAnswers.value.map((answer) => answer.progress);
  return Math.max(...progressArray);
};

const minProgressPerTask = () => {
  if (!taskAnswers.value.length) return 0;

  const progressArray = taskAnswers.value.map((answer) => answer.progress);
  return Math.min(...progressArray);
};

const getTotalAnswers = () => {
  return taskAnswers.value.length;
};

const getLatestResponse = () => {
  if (!taskAnswers.value.length) return { cooperatorEmail: '', lastUpdate: '' };

  let latestResponse = taskAnswers.value[0].userDocId;
  let lastUpdate = taskAnswers.value[0].lastUpdate;

  taskAnswers.value.forEach((answer) => {
    if (answer.lastUpdate > taskAnswers.value[0].lastUpdate) {
      latestResponse = answer.userDocId;
      lastUpdate = answer.lastUpdate;
    }
  });

  return {
    cooperatorEmail: getCooperatorEmail(latestResponse),
    lastUpdate: lastUpdate,
  };
};

const getTasksTodayCount = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let tasksToday = 0;

  taskAnswers.value.forEach((answer) => {
    const answerDate = new Date(answer.lastUpdate);
    answerDate.setHours(0, 0, 0, 0);

    if (answerDate.getTime() === today.getTime()) {
      tasksToday++;
    }
  });

  return tasksToday;
};

const getCooperatorEmail = (userDocId) => {
  let cooperatorEmail = '';
  if (test.value.cooperators && Array.isArray(test.value.cooperators)) {
    for (const element of test.value.cooperators) {
      if (element.userDocId === userDocId) {
        cooperatorEmail = element.email;
      }
    }
  }
  return cooperatorEmail;
};

const getFormattedDate = (date) => {
  return new Date(date).toLocaleString();
};

const goToCoops = () => {
  emit('goToCoops');
};

const viewAnswers = (item) => {
  dialogItem.value = item;
  showDialog.value = true;
};

watch(
  () => testStructure.value,
  (newVal) => {
    if (newVal && Array.isArray(newVal.userTasks)) {
      testTasks.value = newVal.userTasks.map(task => task.taskName);
    }
  },
  { immediate: true }
);

watch(
  () => answers.value,
  (newAnswers) => {
    if (newAnswers && typeof newAnswers === 'object') {
      taskAnswers.value = Object.values(newAnswers);
    }
  },
  { immediate: true }
);


onMounted(() => {
  if (testStructure.value && Array.isArray(testStructure.value.userTasks)) {
    testStructure.value.userTasks.forEach((task, i) => {
      testTasks.value[i] = task.taskName;
    });
  }

  if (answers.value && typeof answers.value === 'object') {
    let c = 0;
    for (const key in answers.value) {
      taskAnswers.value[c] = answers.value[key];
      c++;
    }
  }
});
</script>

<style scoped>
.conclusion-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.stat-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.chart-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.chart-container-large {
  height: 400px;
  width: 100%;
  position: relative;
}

.progress-glow {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .text-h1 {
    font-size: 2.5rem !important;
  }
}

@media (max-width: 600px) {
  .chart-container-large {
    height: 300px;
  }
  
  .conclusion-card .text-h1 {
    font-size: 2rem !important;
  }
}
</style>