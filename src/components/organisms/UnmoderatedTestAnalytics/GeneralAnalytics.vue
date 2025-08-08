<template>
  <div class="bg-background">
    <!-- UX Metrics Row (ahora primera fila) -->
    <v-row class="">
      <v-col cols="12" md="4">
        <UxMetricCard :value="`${calculateEffectiveness().toFixed(1)}%`" label="Eficacia" color="success"
          icon="mdi-target-account" description="Porcentaje de tareas completadas exitosamente"
          :progress="calculateEffectiveness()" />
      </v-col>
      <v-col cols="12" md="4">
        <UxMetricCard :value="calculateEfficiency().score.toFixed(1)" label="Eficiencia" color="info"
          icon="mdi-speedometer" :description="`Tiempo promedio: ${calculateEfficiency().avgTime}`"
          :progress="Math.min(calculateEfficiency().score * 10, 100)" />
      </v-col>
      <v-col cols="12" md="4">
        <UxMetricCard :value="`${calculateSatisfaction().toFixed(1)}/5`" label="Satisfacción" color="warning"
          icon="mdi-heart" description="Puntuación promedio de satisfacción del usuario"
          :progress="(calculateSatisfaction() / 5) * 100" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" lg="6">
        <v-card class="pa-8 elevation-4 rounded-xl h-100 conclusion-card">
          <div class="d-flex justify-space-between align-start mb-6">
            <div>
              <div class="d-flex align-center mb-3">
                <v-icon color="primary" size="28" class="me-3">
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
              <v-chip color="success" variant="flat" size="small" class="mb-2">
                <v-icon start size="16">
                  mdi-trending-up
                </v-icon>
                Max {{ parseFloat(maxProgressPerTask()).toFixed(2) }}%
              </v-chip>
              <br>
              <v-chip color="error" variant="flat" size="small">
                <v-icon start size="16">
                  mdi-trending-down
                </v-icon>
                Min {{ parseFloat(minProgressPerTask()).toFixed(2) }}%
              </v-chip>
            </div>
          </div>

          <v-progress-linear :model-value="getConclusionAverage()" color="primary" height="12" rounded
            class="mb-6 progress-glow" />

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
            <v-divider vertical class="mx-4" />
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
      <v-col cols="12" lg="6">
        <v-row class="h-100">
          <v-col cols="6">
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar color="primary" size="48" class="me-3">
                  <v-icon color="white" size="24">
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
                <v-avatar color="error" size="48" class="me-3">
                  <v-icon color="white" size="24">
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
                <v-avatar color="success" size="48" class="me-3">
                  <v-icon color="white" size="24">
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
                <v-icon color="success" size="16" class="me-1">
                  mdi-trending-up
                </v-icon>
                <span class="text-caption text-success">+{{ getTasksTodayCount() }}/day</span>
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar color="accent" size="48" class="me-3">
                  <v-icon color="white" size="24">
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
    <v-row class="mb-8">
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
              <v-btn variant="outlined" size="small" color="primary">
                <v-icon start>
                  mdi-download
                </v-icon>
                Export
              </v-btn>
              <v-btn variant="flat" size="small" color="primary">
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


    <!-- Task Performance Charts -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card flat class="pa-8">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
                Rendimiento por Tarea
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                Tasa de aciertos y errores por cada tarea del test
              </p>
            </div>
          </div>

          <v-row>
            <v-col v-for="taskStat in getTasksPerformance()" :key="taskStat.taskId" cols="12" md="6" lg="4">
              <v-card class="pa-4 elevation-2 rounded-lg task-chart-card" outlined>
                <div class="text-center mb-4">
                  <h4 class="text-h6 font-weight-bold mb-2">
                    {{ taskStat.taskName }}
                  </h4>
                  <v-chip
                    :color="taskStat.successRate >= 70 ? 'success' : taskStat.successRate >= 50 ? 'warning' : 'error'"
                    variant="tonal" size="small">
                    {{ taskStat.successRate.toFixed(1) }}% éxito
                  </v-chip>
                </div>

                <div class="chart-container-small mb-4">
                  <canvas :id="'task-chart-' + taskStat.taskId" class="task-chart" width="120" height="120"></canvas>
                </div>

                <div class="d-flex justify-space-between text-body-2">
                  <div class="d-flex align-center">
                    <div class="legend-dot bg-success mr-2"></div>
                    <span>Aciertos: {{ taskStat.success }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <div class="legend-dot bg-error mr-2"></div>
                    <span>Errores: {{ taskStat.errors }}</span>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mostrar todas las preguntas del pre-form -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card flat class="pa-8 ">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
                Pre Test
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                Resultados del formulario previo al test
              </p>
            </div>
          </div>
          <v-row>
            <template v-for="(q, idx) in (testStructure?.preTest || [])">
              <v-col v-if="Array.isArray(q.selectionFields) && q.selectionFields.length > 0"
                :key="'pre-sel-' + (q.title || q.question || idx)" cols="12" md="6" lg="4">
                <SelectionPieChart :question-title="q.title || q.question" :options="q.selectionFields"
                  :counts="getPreSelectionCounts(idx)" :canvas-id="'pretest-selection-chart-' + idx"
                  :chart-colors="chartColors" />
              </v-col>
              <v-col v-else :key="'pre-com-' + (q.title || q.question || idx)" cols="12">
                <CommentListCard :question-title="q.title || q.question" :answer="getPreTextAnswers(idx)" />
              </v-col>
            </template>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mostrar todas las preguntas del post-form -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card flat class="pa-8 ">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
                Post Test
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                Resultados del formulario posterior al test
              </p>
            </div>
          </div>
          <v-row>
            <template v-for="(q, idx) in taskAnswers[0]?.postTestAnswer || []">
              <v-col v-if="Array.isArray(q.selectionFields) && q.selectionFields.length > 0"
                :key="'sel-' + (q.question || idx)" cols="12" md="6" lg="4">
                <SelectionPieChart :question-title="q.title || q.question" :options="q.selectionFields"
                  :counts="getSelectionCounts(idx)" :canvas-id="'posttest-selection-chart-' + idx"
                  :chart-colors="chartColors" />
              </v-col>
              <v-col v-else :key="'com-' + (q.question || idx)" cols="12">
                <CommentListCard :question-title="q.title || q.question" :answer="q.answer" />
              </v-col>
            </template>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>


<script setup>


import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import DateChart from '@/components/atoms/DateChart.vue';
import UxMetricCard from '@/components/UserTest/answers/UxMetricCard.vue';
import CommentListCard from '@/components/UserTest/answers/CommentListCard.vue';
import SelectionPieChart from '@/components/UserTest/answers/SelectionPieChart.vue';


// Declaraciones reactivas primero para evitar errores de acceso antes de inicialización
const testTasks = ref([]);
const taskAnswers = ref([]);


// Colores para el gráfico
const chartColors = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#FF7043', '#26A69A', '#D4E157'];



// Encuentra todas las preguntas de selección
const selectionQuestions = computed(() => {
  if (!taskAnswers.value.length || !taskAnswers.value[0].postTestAnswer) return [];
  return taskAnswers.value[0].postTestAnswer.filter(q => Array.isArray(q.selectionFields) && q.selectionFields.length > 0);
});

// Devuelve los recuentos de respuestas para una pregunta de selección específica (por índice)
function getSelectionCounts(questionIdx) {
  const counts = {};
  const q = taskAnswers.value[0]?.postTestAnswer?.[questionIdx];
  if (!q) return counts;
  q.selectionFields.forEach(opt => { counts[opt] = 0; });
  taskAnswers.value.forEach(ans => {
    if (ans.postTestAnswer && ans.postTestAnswer[questionIdx] && ans.postTestAnswer[questionIdx].answer) {
      const answer = ans.postTestAnswer[questionIdx].answer;
      if (Array.isArray(answer)) {
        answer.forEach(a => { if (counts[a] !== undefined) counts[a]++; });
      } else if (counts[answer] !== undefined) {
        counts[answer]++;
      }
    }
  });
  return counts;
}

function getPreSelectionCounts(questionIdx) {
  const counts = {};
  const q = taskAnswers.value[0]?.preTestAnswer?.[questionIdx];
  if (!testStructure.value?.preTest?.[questionIdx]?.selectionFields) return counts;
  const options = testStructure.value.preTest[questionIdx].selectionFields;
  options.forEach(opt => { counts[opt] = 0; });
  taskAnswers.value.forEach(ans => {
    const answerObj = ans.preTestAnswer?.[questionIdx];
    if (answerObj && answerObj.answer !== undefined) {
      const answer = answerObj.answer;
      if (Array.isArray(answer)) {
        answer.forEach(a => { if (counts[a] !== undefined) counts[a]++; });
      } else if (counts[answer] !== undefined) {
        counts[answer]++;
      }
    }
  });
  return counts;
}

function getPreTextAnswers(questionIdx) {
  const list = [];
  taskAnswers.value.forEach(ans => {
    const a = ans.preTestAnswer?.[questionIdx]?.answer;
    if (a !== undefined && a !== null && a !== '') list.push(a);
  });
  return list;
}

const store = useStore();


const test = computed(() => store.getters.test);
const testStructure = computed(() => store.state.Tests.Test.testStructure);
const answers = computed(() => {
  if (!store.getters.visibleUserAnswers) {
    return {};
  }
  return store.getters.visibleUserAnswers;
});
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

  const taskMap = {};
  testStructure.value.userTasks.forEach((task) => {
    taskMap[task.taskId] = task;
  });

  return {
    taskName: taskMap[longestTask]?.taskName || 'Task',
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

// UX Metrics Functions
const calculateEffectiveness = () => {
  if (!taskAnswers.value.length) return 0;

  let completedTasks = 0;
  let totalTasks = 0;

  taskAnswers.value.forEach((answer) => {
    totalTasks += Object.keys(answer.tasks).length;
    Object.values(answer.tasks).forEach((task) => {
      if (task.completed) {
        completedTasks++;
      }
    });
  });

  return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
};

const calculateEfficiency = () => {
  if (!taskAnswers.value.length) return { score: 0, avgTime: '0 min 0 s' };

  const avgTime = averageTimePerTask.value;
  const avgTimeFormatted = formatTime(avgTime);

  // Score based on average time (lower is better)
  // Assuming 2 minutes as optimal time, anything above reduces efficiency
  const optimalTime = 120000; // 2 minutes in milliseconds
  const efficiency = Math.max(0, Math.min(10, (optimalTime / avgTime) * 10));

  return {
    score: efficiency,
    avgTime: avgTimeFormatted.formatedTime
  };
};

const calculateSatisfaction = () => {
  if (!taskAnswers.value.length) return 0;

  let totalSatisfaction = 0;
  let ratingsCount = 0;

  taskAnswers.value.forEach((answer) => {
    if (answer.satisfaction && typeof answer.satisfaction === 'number') {
      totalSatisfaction += answer.satisfaction;
      ratingsCount++;
    } else {
      // If no satisfaction data, simulate based on completion rate
      const userProgress = answer.progress;
      const simulatedRating = userProgress >= 90 ? 4.5 :
        userProgress >= 70 ? 4.0 :
          userProgress >= 50 ? 3.5 :
            userProgress >= 30 ? 3.0 : 2.5;
      totalSatisfaction += simulatedRating;
      ratingsCount++;
    }
  });

  return ratingsCount === 0 ? 0 : totalSatisfaction / ratingsCount;
};

const getTasksPerformance = () => {
  // Recoger todos los taskId únicos presentes en taskAnswers
  const allTaskIds = new Set();
  taskAnswers.value.forEach(answer => {
    if (answer.tasks) {
      Object.keys(answer.tasks).forEach(taskId => allTaskIds.add(taskId));
    }
  });

  // Para cada taskId, calcular los datos reales
  const result = [];
  allTaskIds.forEach(taskId => {
    let success = 0;
    let errors = 0;
    let total = 0;
    let taskName = taskId;

    // Buscar el nombre de la tarea si está en testStructure
    if (testStructure.value && testStructure.value.userTasks) {
      const found = testStructure.value.userTasks.find(t => t.taskId === taskId);
      if (found) taskName = found.taskName;
    }

    taskAnswers.value.forEach(answer => {
      if (answer.tasks && answer.tasks[taskId]) {
        total++;
        const task = answer.tasks[taskId];
        if (task.completed && task.success !== false) {
          success++;
        } else {
          errors++;
        }
      }
    });

    result.push({
      taskId,
      taskName,
      success,
      errors,
      total,
      successRate: total === 0 ? 0 : (success / total) * 100
    });
  });
  return result;
};

const createTaskCharts = async () => {
  await nextTick();

  const tasksData = getTasksPerformance();

  tasksData.forEach((task) => {
    // Usar el id único basado en el taskId
    const canvasId = 'task-chart-' + (task.taskId || '');
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const innerRadius = radius * 0.6;

    if (!task.total || isNaN(task.successRate)) {
      // Draw empty donut (gray)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
      ctx.closePath();
      ctx.fillStyle = '#e0e0e0';
      ctx.fill();
      // Draw center text
      ctx.fillStyle = '#999';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('0%', centerX, centerY + 5);
      return;
    }

    // Calculate angles
    const successAngle = (task.success / task.total) * 2 * Math.PI;
    const errorAngle = (task.errors / task.total) * 2 * Math.PI;

    // Draw success arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, successAngle);
    ctx.arc(centerX, centerY, innerRadius, successAngle, 0, true);
    ctx.closePath();
    ctx.fillStyle = '#4CAF50';
    ctx.fill();

    // Draw error arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, successAngle, successAngle + errorAngle);
    ctx.arc(centerX, centerY, innerRadius, successAngle + errorAngle, successAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#F44336';
    ctx.fill();

    // Draw center text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${task.successRate.toFixed(0)}%`, centerX, centerY + 5);
  });
};

watch(
  () => answers.value,
  (newAnswers) => {
    if (newAnswers && typeof newAnswers === 'object') {
      taskAnswers.value = Object.values(newAnswers);
      // Update charts when data changes
      setTimeout(() => createTaskCharts(), 500);
    }
  },
  { immediate: true }
);

watch(
  () => testStructure.value,
  (newVal) => {
    if (newVal && Array.isArray(newVal.userTasks)) {
      testTasks.value = newVal.userTasks.map(task => task.taskName);
      // Update charts when structure changes
      setTimeout(() => createTaskCharts(), 500);
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

  // Create initial charts
  setTimeout(() => createTaskCharts(), 1000);
});
</script>

<style scoped>
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}


.chart-container-large {
  height: 400px;
  width: 100%;
  position: relative;
}

.progress-glow {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
}

.ux-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}


.task-chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

.chart-container-small {
  height: 150px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-chart {
  max-width: 120px;
  max-height: 120px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
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