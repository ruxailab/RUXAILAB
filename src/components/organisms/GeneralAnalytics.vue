<template>
  <div v-if="answers && test.userTestType != 'moderated'">
    <IntroAnalytics
      v-if="answers != null && intro"
      @go-to-coops="goToCoops"
    />
    <div>
      <!-- Analysis Geral -->
      <v-row class="ma-0 pa-0">
        <v-col cols="8">
          <v-card
            height="400"
            class="cards mt-3"
          >
            <v-row>
              <v-col cols="6">
                <v-row justify="center">
                  <span class="cardTitle">Conclusion percentage</span>
                  <span class="conclusionPercentage mx-auto mb-1">{{ parseFloat(getConclusionAverage()).toFixed(2) }}%</span>
                  <v-col
                    cols="8"
                    class="mx-auto"
                  >
                    <v-progress-linear
                      rounded
                      height="6"
                      color="orange"
                      :model-value="getConclusionAverage()"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    class="pb-0 d-flex justify-center align-center"
                  >
                    <span class="cardTitle">Tests in progress</span>
                  </v-col>
                  <span class="conclusionPercentage mx-auto mb-1">{{
                    getTestsInProgress().totalInProgress
                  }}</span>
                </v-row>
              </v-col>

              <v-divider
                vertical
                class="mt-14"
                style="background-color: #c9c9c9"
              />

              <v-col cols="6">
                <v-row justify="center">
                  <span class="cardSubtitle"><v-icon class="mr-1"> mdi-arrow-top-right</v-icon>Max
                    {{ parseFloat(maxProgressPerTask()).toFixed(2) }}%</span>
                  <span class="cardSubtitle"><v-icon class="mr-1"> mdi-arrow-bottom-right</v-icon>Min
                    {{ parseFloat(minProgressPerTask()).toFixed(2) }}%</span>
                  <span class="cardSubtitle">Total time<br>
                    16m</span>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="4">
          <v-card
            height="190"
            class="mb-8 cards mt-3"
          >
            <v-row justify="center">
              <span class="cardTitle mt-6">Average Time per Task</span>
              <span class="cardTime mt-3"><v-icon
                                            size="45"
                                            class="mr-1 mb-2"
                                          > mdi-clock-fast</v-icon>
                {{ calculateAverageTime().formatedTime }}</span>
              <span class="subtitleTime mt-4 mx-8">Users spend a average of
                {{ calculateAverageTime().minutes }} minutes and
                {{ calculateAverageTime().seconds }} seconds on each task</span>
            </v-row>
          </v-card>
          <v-card
            height="190"
            class="cards"
          >
            <v-row justify="center">
              <span class="cardTitle mt-6">Longest Task on Average</span>
              <span
                class="cardTime mt-4"
                style="color: #ff5252"
              ><v-icon
                 size="38"
                 class="mr-1 mb-2"
                 color="#FF5252"
               >
                 mdi-clock-alert-outline</v-icon>
                {{ findLongestTask().averageTime.formatedTime }}</span>
              <span
                class="subtitleTime mt-4 mx-8"
                style="
                  color: #414d55;
                  display: inline-block;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  direction: ltr;
                "
              >“{{ findLongestTask().taskName }}”</span>
              <span class="subtitleTime mx-8">with the longest average</span>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card
            height="190"
            class="mb-8 cards mt-3"
          >
            <v-row>
              <span class="bottomCardsTitle mt-6 ml-11">Answers</span>
              <v-col
                cols="12"
                class="pb-0 pt-0 d-flex pl-0"
              >
                <span
                  class="conclusionPercentage mt-2 ml-11 mr-3"
                  style="
                  min-width: 0px;
                  font-weight: 700;
                  font-size: 36px;
                  line-height: 40px;
                  text-align: start;
                "
                ><v-icon
                  size="38"
                  class="mr-1 mb-2"
                  color="green"
                >
                  mdi-check-circle-outline</v-icon>{{ getTotalAnswers() }}</span>
                <span
                  class="subtitleTime mt-6"
                  style="text-align: start; min-width: 150px"
                >Total answers</span>
              </v-col>
              <v-col
                class="ml-9"
                cols="9"
              >
                <v-divider style="background-color: #e4eaf0" />
              </v-col>

              <span
                class="subtitleTime mt-2 ml-12"
                style="text-align: start; min-width: 210px"
              ><v-icon
                size="20"
                class="mr-1 mb-2"
                color="green"
              >
                mdi-chevron-double-up</v-icon><strong>+{{ getTasksTodayCount() }} </strong>answers/day</span>
            </v-row>
          </v-card>

          <v-card
            height="190"
            class="cards"
          >
            <v-row>
              <span class="bottomCardsTitle mb-1 mt-7 ml-11">Latest user answer</span>
              <v-avatar
                color="grey"
                class="ml-10 mt-4"
                size="45"
              >
                <v-icon
                  size="42"
                  color="white"
                  icon="mdi-account-circle"
                />
              </v-avatar>
              <span
                class="subtitleTime mt-4 ml-4"
                style="text-align: start; min-width: 210px; color: #696d6e"
              >
                {{ getLatestResponse().cooperatorEmail }}
                <br>
                <div
                  class="mt-1"
                  style="color: #28b5e1 !important"
                >
                  Evaluator
                </div>
              </span>
              <span
                class="subtitleTime ml-16 mt-5"
                style="font-size: 14px; text-align: end"
              >Last Updated:
                {{ getFormattedDate(getLatestResponse().lastUpdate) }}</span>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="8">
          <v-card
            height="400"
            class="mt-3 cards"
          >
            <v-row>
              <span
                class="bottomCardsTitle ml-10 mt-6 mb-5"
                style="min-width:500px"
              >Answers Timeline</span>
            </v-row>
            <div class="px-6">
              <DateChart
                :task-answers="taskAnswers"
                class="ml-6"
                style="max-height:300px; max-width:1200px;"
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
  <div v-else>
    <IntroAnalytics
      v-if="answers != null && intro"
      @go-to-coops="goToCoops"
    />
    <div>
      <!-- Analysis Geral -->
      <v-row class="ma-0 pa-0">
        <v-col cols="8">
          <v-card
            height="400"
            class="cards mt-3"
          >
            <v-row>
              <v-col
                cols="6"
                class="mb-8"
              >
                <v-row
                  justify="center"
                  class="mt-16"
                >
                  <span class="cardTitle">Total Insights</span>
                  <span class="conclusionPercentage mx-auto mb-1">0</span>
                </v-row>
              </v-col>

              <v-divider
                vertical
                class="mt-10"
                style="background-color: #c9c9c9"
              />

              <v-col cols="6">
                <v-row justify="center">
                  <span class="cardSubtitle">
                    <v-icon class="mr-1">mdi-thumb-up</v-icon>
                    Positive Insights
                    <br>
                    0
                  </span>
                  <span class="cardSubtitle">
                    <v-icon class="mr-1">mdi-thumb-down</v-icon>
                    Negative Insights
                    <br>
                    0
                  </span>
                  <span class="cardSubtitle">
                    Total test time
                    <br>
                    0m
                  </span>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="4">
          <v-card
            height="190"
            class="mb-8 cards mt-3"
          >
            <v-row justify="center">
              <span class="cardTitle mt-6">Average Time per Task</span>
              <span class="cardTime mt-3"><v-icon
                                            size="45"
                                            class="mr-1 mb-2"
                                          > mdi-clock-fast</v-icon>
                {{ calculateAverageTime().formatedTime }}</span>
              <span class="subtitleTime mt-4 mx-8">Users spend a average of
                {{ calculateAverageTime().minutes }} minutes and
                {{ calculateAverageTime().seconds }} seconds on each task</span>
            </v-row>
          </v-card>
          <v-card
            height="190"
            class="cards"
          >
            <v-row justify="center">
              <span class="cardTitle mt-6">Longest Task on Average</span>
              <span
                class="cardTime mt-4"
                style="color: #ff5252"
              ><v-icon
                size="38"
                class="mr-1 mb-2"
                color="#FF5252"
              >
                mdi-clock-alert-outline</v-icon>
                0 min 0s</span>
              <span
                class="subtitleTime mt-4 mx-8"
                style="
                  color: #414d55;
                  display: inline-block;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  direction: ltr;
                "
              >“Task”</span>
              <span class="subtitleTime mx-8">with the longest average</span>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card
            height="190"
            class="mb-8 cards mt-3"
          >
            <v-row>
              <span class="bottomCardsTitle mt-6 ml-11">Answers</span>
              <span
                class="conclusionPercentage mt-2 ml-11 mr-3"
                style="
                  min-width: 0px;
                  font-weight: 700;
                  font-size: 36px;
                  line-height: 40px;
                  text-align: start;
                "
              ><v-icon
                size="38"
                class="mr-1 mb-2"
                color="green"
              >
                mdi-check-circle-outline</v-icon>{{ getTotalAnswers() }}</span>
              <span
                class="subtitleTime mt-6"
                style="text-align: start; min-width: 150px"
              >Total answers</span>
              <v-col
                class="ml-9"
                cols="9"
              >
                <v-divider style="background-color: #e4eaf0" />
              </v-col>

              <span
                class="subtitleTime mt-2 ml-12"
                style="text-align: start; min-width: 210px"
              ><v-icon
                size="20"
                class="mr-1 mb-2"
                color="green"
              >
                mdi-chevron-double-up</v-icon><strong>+{{ getTasksTodayCount() }} </strong>answers/day</span>
            </v-row>
          </v-card>

          <v-card
            height="190"
            class="cards"
          >
            <v-row>
              <span class="bottomCardsTitle mb-1 mt-7 ml-11">Latest user answer</span>
              <v-avatar
                color="grey"
                class="ml-10 mt-4"
                size="45"
              >
                <v-icon
                  size="42"
                  color="white"
                  icon="mdi-account-circle"
                />
              </v-avatar>
              <span
                class="subtitleTime mt-4 ml-4"
                style="text-align: start; min-width: 210px; color: #696d6e"
              >
                {{ getLatestResponse().cooperatorEmail }}
                <br>
                <div
                  class="mt-1"
                  style="color: #28b5e1 !important"
                >
                  Evaluator
                </div>
              </span>
              <span
                class="subtitleTime ml-16 mt-5"
                style="font-size: 14px; text-align: end"
              >Last Updated:
                {{ getFormattedDate(getLatestResponse().lastUpdate) }}</span>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="8">
          <v-card
            height="400"
            class="mt-3 cards"
          >
            <v-row>
              <span
                class="bottomCardsTitle ml-10 mt-6 mb-5"
                style="min-width:500px"
              >Answers Timeline</span>
            </v-row>
            <DateChart
              :task-answers="taskAnswers"
              class="ml-6"
              style="max-height:300px; max-width:680px;"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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
const tasksAnswer = computed(() => store.getters.testAnswerDocument);
const answers = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return [];
  }
  return store.getters.testAnswerDocument.taskAnswers;
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

onMounted(() => {
  let i = 0;
  testStructure.value.userTasks.forEach((task) => {
    testTasks.value[i] = task.taskName;
    i++;
  });
  let c = 0;
  for (const key in answers.value) {
    taskAnswers.value[c] = answers.value[key];
    c++;
  }
});
</script>

<style scoped>
.cards {
  border-radius: 20px;
  box-shadow: 0px 0px 8.2px 0px rgba(0, 0, 0, 0.25);
}

.cardTitle {
  margin-top: 40px;
  color: #414d55;
  text-align: center;
  font-size: 22px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.cardTime {
  min-width: 250px;
  color: #414d55;
  font-size: 27px;
  text-align: center;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.conclusionPercentage {
  min-width: 250px;
  color: #414d55;
  text-align: center;
  font-size: 48px;
  font-style: normal;
  font-weight: semi-bold;
  line-height: normal;
}

.cardSubtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 250px;
  margin-top: 75px;
  color: #414d55;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.subtitleTime {
  color: #8e8e8e;
  text-align: center;
  font-size: 17px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  min-width: 250px;
}

.bottomCardsTitle {
  min-width: 300px;
  color: #414d55;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;
  /* 125% */
  letter-spacing: 0.01px;
}

.list-scroll {
  height: 508px;
  overflow: auto;
}

/* Nav bar list scroll bar */
/* width */
.list-scroll::-webkit-scrollbar {
  width: 7px;
}

/* Track */
.list-scroll::-webkit-scrollbar-track {
  background: none;
}

/* Handle */
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}

/* Handle on hover */
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
</style>